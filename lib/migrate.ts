import { DatabaseSync } from "node:sqlite";

/**
 * Versioned migration system.
 *
 * Each migration has a unique version string (e.g. "001_initial"). The
 * `migrations` tracker table records which versions have already been applied.
 * `runMigrations()` checks the tracker and runs only the new migrations,
 * making the process idempotent and traceable.
 */

type Migration = {
  version: string;
  up(db: DatabaseSync): void;
};

/* ---------- Migration definitions ---------- */

const migrations: Migration[] = [
  {
    version: "001_initial",
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'farmer',
          farm_name TEXT,
          location TEXT,
          verified_at TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS early_access (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL,
          farm TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS contact_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT NOT NULL,
          body TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS fields (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          area_ha REAL NOT NULL,
          crop TEXT,
          status TEXT,
          notes TEXT
        );
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          due_date TEXT,
          category TEXT,
          done INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          kind TEXT NOT NULL,
          title TEXT NOT NULL,
          counterparty TEXT,
          when_date TEXT,
          end_date TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          amount REAL,
          note TEXT,
          pair_id TEXT,
          partner_user_id INTEGER
        );
        CREATE TABLE IF NOT EXISTS devices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          kind TEXT NOT NULL,
          status TEXT NOT NULL,
          location TEXT
        );
        CREATE TABLE IF NOT EXISTS equipment (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          category TEXT,
          status TEXT NOT NULL DEFAULT 'available',
          daily_rate REAL,
          location TEXT
        );
        CREATE TABLE IF NOT EXISTS members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          farm TEXT,
          status TEXT NOT NULL DEFAULT 'active',
          fields_count INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS purchases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          lot TEXT NOT NULL,
          buyer TEXT,
          quantity_tonnes REAL NOT NULL DEFAULT 0,
          amount REAL NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'enquiry'
        );
        CREATE TABLE IF NOT EXISTS auth_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL UNIQUE,
          kind TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          used_at TEXT
        );
      `);
    },
  },
  {
    version: "002_add_indexes",
    up(db) {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_fields_user_id ON fields(user_id);
        CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
        CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
        CREATE INDEX IF NOT EXISTS idx_bookings_pair_id ON bookings(pair_id);
        CREATE INDEX IF NOT EXISTS idx_bookings_kind ON bookings(kind);
        CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
        CREATE INDEX IF NOT EXISTS idx_equipment_user_id ON equipment(user_id);
        CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
        CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
        CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_kind ON auth_tokens(user_id, kind);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      `);
    },
  },
  {
    version: "003_transactions_and_maintenance",
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          description TEXT NOT NULL,
          amount REAL NOT NULL,
          type TEXT NOT NULL DEFAULT 'expense',
          category TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS maintenance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
          task TEXT NOT NULL,
          due_date TEXT,
          status TEXT NOT NULL DEFAULT 'scheduled',
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_maintenance_user_id ON maintenance(user_id);
        CREATE INDEX IF NOT EXISTS idx_maintenance_equipment_id ON maintenance(equipment_id);
      `);
    },
  },
  {
    version: "004_harvests_and_notifications",
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS harvests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
          crop TEXT NOT NULL,
          quantity_tonnes REAL NOT NULL,
          date TEXT NOT NULL,
          quality TEXT,
          status TEXT NOT NULL DEFAULT 'planned',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          message TEXT NOT NULL,
          read INTEGER NOT NULL DEFAULT 0,
          related_id INTEGER,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_harvests_user_id ON harvests(user_id);
        CREATE INDEX IF NOT EXISTS idx_harvests_field_id ON harvests(field_id);
        CREATE INDEX IF NOT EXISTS idx_harvests_status ON harvests(status);
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
      `);
    },
  },
  // Iteration 1: Connected agricultural lifecycle tables
  {
    version: "005_agricultural_lifecycle",
    up(db) {
      // Create farms table first
      db.exec(`
        CREATE TABLE IF NOT EXISTS farms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          address TEXT,
          total_area_ha REAL NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      // Safely add farm_id column to fields table only if it doesn't already exist
      const columns = db.prepare("PRAGMA table_info(fields)").all() as { name: string }[];
      const hasFarmId = columns.some((c) => c.name === "farm_id");
      if (!hasFarmId) {
        db.exec("ALTER TABLE fields ADD COLUMN farm_id INTEGER REFERENCES farms(id) ON DELETE SET NULL;");
      }

      // Create all remaining agricultural lifecycle tables
      db.exec(`
        -- CROP CYCLE: A planting-to-harvest cycle on a specific field
        CREATE TABLE IF NOT EXISTS crop_cycles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
          crop_type TEXT NOT NULL,
          variety TEXT,
          season TEXT,
          planned_start_date TEXT,
          planned_planting_date TEXT,
          planned_harvest_date TEXT,
          actual_start_date TEXT,
          actual_planting_date TEXT,
          actual_harvest_date TEXT,
          stage TEXT NOT NULL DEFAULT 'planned',
          status TEXT NOT NULL DEFAULT 'planned',
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- ASSESSMENT: Soil/field assessment records
        CREATE TABLE IF NOT EXISTS assessments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
          assessment_type TEXT NOT NULL,
          assessor TEXT,
          data_source TEXT,
          status TEXT NOT NULL DEFAULT 'draft',
          assessment_date TEXT NOT NULL DEFAULT (date('now')),
          observations TEXT,
          report TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- SOIL MEASUREMENTS: Individual soil measurements from assessments
        CREATE TABLE IF NOT EXISTS soil_measurements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
          sample_id TEXT,
          measurement_type TEXT NOT NULL,
          value REAL NOT NULL,
          unit TEXT NOT NULL,
          method TEXT,
          source TEXT,
          measured_date TEXT NOT NULL DEFAULT (date('now')),
          reference_range_min REAL,
          reference_range_max REAL,
          validation_status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- INPUT CATALOGUE: Agricultural products and supplies
        CREATE TABLE IF NOT EXISTS input_catalogue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          manufacturer TEXT,
          sku TEXT,
          unit TEXT NOT NULL,
          package_size REAL,
          unit_price REAL,
          storage_conditions TEXT,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- SUPPLIERS: Agricultural input suppliers
        CREATE TABLE IF NOT EXISTS suppliers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          contact_name TEXT,
          email TEXT,
          phone TEXT,
          address TEXT,
          terms TEXT,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- PROCUREMENT ORDERS: Purchase requests and orders
        CREATE TABLE IF NOT EXISTS procurement_orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          farm_id INTEGER REFERENCES farms(id) ON DELETE SET NULL,
          crop_cycle_id INTEGER REFERENCES crop_cycles(id) ON DELETE SET NULL,
          supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
          status TEXT NOT NULL DEFAULT 'draft',
          estimated_cost REAL,
          notes TEXT,
          submitted_at TEXT,
          approved_at TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- PROCUREMENT ORDER ITEMS: Line items for procurement orders
        CREATE TABLE IF NOT EXISTS procurement_order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL REFERENCES procurement_orders(id) ON DELETE CASCADE,
          input_id INTEGER NOT NULL REFERENCES input_catalogue(id) ON DELETE CASCADE,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          unit_price REAL,
          total_price REAL,
          received_quantity REAL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'ordered',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- INVENTORY: Current stock levels per input per location
        CREATE TABLE IF NOT EXISTS inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          input_id INTEGER NOT NULL REFERENCES input_catalogue(id) ON DELETE CASCADE,
          location TEXT,
          quantity_available REAL NOT NULL DEFAULT 0,
          quantity_reserved REAL NOT NULL DEFAULT 0,
          unit TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- INVENTORY MOVEMENTS: Ledger of all inventory changes
        CREATE TABLE IF NOT EXISTS inventory_movements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          inventory_id INTEGER NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
          movement_type TEXT NOT NULL,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          reference_type TEXT,
          reference_id INTEGER,
          date TEXT NOT NULL DEFAULT (date('now')),
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- OPERATORS: People who operate machinery
        CREATE TABLE IF NOT EXISTS operators (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          phone TEXT,
          qualifications TEXT,
          machinery_permissions TEXT,
          availability TEXT NOT NULL DEFAULT 'available',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- WORK ORDERS: Machinery work assignments
        CREATE TABLE IF NOT EXISTS work_orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          farm_id INTEGER REFERENCES farms(id) ON DELETE SET NULL,
          field_id INTEGER REFERENCES fields(id) ON DELETE SET NULL,
          crop_cycle_id INTEGER REFERENCES crop_cycles(id) ON DELETE SET NULL,
          equipment_id INTEGER REFERENCES equipment(id) ON DELETE SET NULL,
          operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
          activity_type TEXT NOT NULL,
          description TEXT,
          planned_start_date TEXT,
          planned_end_date TEXT,
          actual_start_date TEXT,
          actual_end_date TEXT,
          status TEXT NOT NULL DEFAULT 'draft',
          cost REAL,
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- HARVEST LOTS: Traceable produce batches
        CREATE TABLE IF NOT EXISTS harvest_lots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          crop_cycle_id INTEGER NOT NULL REFERENCES crop_cycles(id) ON DELETE CASCADE,
          field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
          harvest_id INTEGER REFERENCES harvests(id) ON DELETE SET NULL,
          harvest_date TEXT NOT NULL,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL DEFAULT 'tonnes',
          quality_grade TEXT,
          moisture_content REAL,
          location TEXT,
          status TEXT NOT NULL DEFAULT 'created',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- FACILITIES: Processing, storage, and collection facilities
        CREATE TABLE IF NOT EXISTS facilities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          facility_type TEXT NOT NULL,
          address TEXT,
          capacity REAL,
          capacity_unit TEXT,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- PROCESSING RECORDS: Post-harvest processing operations
        CREATE TABLE IF NOT EXISTS processing_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          facility_id INTEGER REFERENCES facilities(id) ON DELETE SET NULL,
          input_lot_id INTEGER REFERENCES harvest_lots(id) ON DELETE SET NULL,
          process_type TEXT NOT NULL,
          input_quantity REAL NOT NULL,
          input_unit TEXT NOT NULL,
          output_quantity REAL NOT NULL,
          output_unit TEXT NOT NULL,
          loss_quantity REAL DEFAULT 0,
          grade TEXT,
          processing_date TEXT NOT NULL DEFAULT (date('now')),
          operator TEXT,
          status TEXT NOT NULL DEFAULT 'completed',
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- STORAGE LOCATIONS: Physical storage bins/warehouses
        CREATE TABLE IF NOT EXISTS storage_locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          facility_id INTEGER REFERENCES facilities(id) ON DELETE SET NULL,
          name TEXT NOT NULL,
          capacity REAL,
          capacity_unit TEXT,
          commodity_type TEXT,
          status TEXT NOT NULL DEFAULT 'available',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- STORAGE MOVEMENTS: Ledger of storage in/out movements
        CREATE TABLE IF NOT EXISTS storage_movements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          storage_location_id INTEGER NOT NULL REFERENCES storage_locations(id) ON DELETE CASCADE,
          lot_id INTEGER REFERENCES harvest_lots(id) ON DELETE SET NULL,
          movement_type TEXT NOT NULL,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          reference_type TEXT,
          reference_id INTEGER,
          date TEXT NOT NULL DEFAULT (date('now')),
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- BUYERS: Produce buyers and organisations
        CREATE TABLE IF NOT EXISTS buyers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          contact_name TEXT,
          email TEXT,
          phone TEXT,
          address TEXT,
          buyer_type TEXT,
          payment_terms TEXT,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- BUYER ORDERS: Purchase orders from buyers
        CREATE TABLE IF NOT EXISTS buyer_orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          buyer_id INTEGER NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
          commodity TEXT NOT NULL,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          grade TEXT,
          agreed_price REAL,
          currency TEXT NOT NULL DEFAULT 'INR',
          delivery_address TEXT,
          expected_date TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- SHIPMENTS: Transport of produce
        CREATE TABLE IF NOT EXISTS shipments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          buyer_order_id INTEGER REFERENCES buyer_orders(id) ON DELETE SET NULL,
          origin_facility_id INTEGER REFERENCES facilities(id) ON DELETE SET NULL,
          destination TEXT,
          carrier TEXT,
          vehicle TEXT,
          driver TEXT,
          planned_quantity REAL NOT NULL,
          unit TEXT NOT NULL DEFAULT 'tonnes',
          dispatched_quantity REAL DEFAULT 0,
          delivered_quantity REAL DEFAULT 0,
          planned_dispatch_date TEXT,
          actual_dispatch_date TEXT,
          actual_delivery_date TEXT,
          status TEXT NOT NULL DEFAULT 'draft',
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- SHIPMENT LOTS: Link shipments to specific harvest lots
        CREATE TABLE IF NOT EXISTS shipment_lots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          shipment_id INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
          lot_id INTEGER NOT NULL REFERENCES harvest_lots(id) ON DELETE CASCADE,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL
        );

        -- SALES: Confirmed produce sales
        CREATE TABLE IF NOT EXISTS sales (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          buyer_id INTEGER REFERENCES buyers(id) ON DELETE SET NULL,
          buyer_order_id INTEGER REFERENCES buyer_orders(id) ON DELETE SET NULL,
          shipment_id INTEGER REFERENCES shipments(id) ON DELETE SET NULL,
          commodity TEXT NOT NULL,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          unit_price REAL NOT NULL,
          gross_amount REAL NOT NULL,
          currency TEXT NOT NULL DEFAULT 'INR',
          charges REAL DEFAULT 0,
          net_amount REAL NOT NULL,
          sale_date TEXT NOT NULL DEFAULT (date('now')),
          status TEXT NOT NULL DEFAULT 'confirmed',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- FINANCIAL TRANSACTIONS (enhanced): Linked to operational records
        CREATE TABLE IF NOT EXISTS financial_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          farm_id INTEGER REFERENCES farms(id) ON DELETE SET NULL,
          field_id INTEGER REFERENCES fields(id) ON DELETE SET NULL,
          crop_cycle_id INTEGER REFERENCES crop_cycles(id) ON DELETE SET NULL,
          transaction_type TEXT NOT NULL,
          category TEXT NOT NULL,
          amount REAL NOT NULL,
          currency TEXT NOT NULL DEFAULT 'INR',
          date TEXT NOT NULL DEFAULT (date('now')),
          description TEXT,
          source_type TEXT,
          source_id INTEGER,
          counterparty TEXT,
          status TEXT NOT NULL DEFAULT 'posted',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
    },
  },
  // Sprint 03: Crop cycle enhancements — assessment_id, cultivated_area_ha, crop_plans, stages, input_requirements
  {
    version: "007_crop_planning",
    up(db) {
      // Add assessment_id and cultivated_area_ha to crop_cycles
      const ccColumns = db.prepare("PRAGMA table_info(crop_cycles)").all() as { name: string }[];
      if (!ccColumns.some((c) => c.name === "assessment_id")) {
        db.exec("ALTER TABLE crop_cycles ADD COLUMN assessment_id INTEGER REFERENCES assessments(id) ON DELETE SET NULL;");
      }
      if (!ccColumns.some((c) => c.name === "cultivated_area_ha")) {
        db.exec("ALTER TABLE crop_cycles ADD COLUMN cultivated_area_ha REAL;");
      }

      db.exec(`
        -- CROP PLANS: Detailed planning for a crop cycle
        CREATE TABLE IF NOT EXISTS crop_plans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          crop_cycle_id INTEGER NOT NULL REFERENCES crop_cycles(id) ON DELETE CASCADE,
          planting_method TEXT,
          irrigation_approach TEXT,
          field_conditions TEXT,
          planning_notes TEXT,
          status TEXT NOT NULL DEFAULT 'draft',
          created_by INTEGER NOT NULL REFERENCES users(id),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- CROP CYCLE STAGES: Configurable growth stages for a crop cycle
        CREATE TABLE IF NOT EXISTS crop_cycle_stages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          crop_cycle_id INTEGER NOT NULL REFERENCES crop_cycles(id) ON DELETE CASCADE,
          stage_name TEXT NOT NULL,
          sequence INTEGER NOT NULL DEFAULT 0,
          planned_start_date TEXT,
          planned_end_date TEXT,
          actual_start_date TEXT,
          actual_end_date TEXT,
          status TEXT NOT NULL DEFAULT 'planned',
          description TEXT,
          responsible_person TEXT,
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- INPUT REQUIREMENTS: Planned input needs for a crop cycle
        CREATE TABLE IF NOT EXISTS input_requirements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          farm_id INTEGER REFERENCES farms(id) ON DELETE SET NULL,
          field_id INTEGER REFERENCES fields(id) ON DELETE SET NULL,
          crop_cycle_id INTEGER NOT NULL REFERENCES crop_cycles(id) ON DELETE CASCADE,
          crop_plan_id INTEGER REFERENCES crop_plans(id) ON DELETE SET NULL,
          input_catalogue_id INTEGER REFERENCES input_catalogue(id) ON DELETE SET NULL,
          input_category TEXT NOT NULL,
          product_name TEXT,
          planned_quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          rate_per_ha REAL,
          planned_application_date TEXT,
          intended_purpose TEXT,
          estimated_unit_price REAL,
          estimated_total_cost REAL,
          status TEXT NOT NULL DEFAULT 'draft',
          notes TEXT,
          created_by INTEGER NOT NULL REFERENCES users(id),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_crop_plans_crop_cycle_id ON crop_plans(crop_cycle_id);
        CREATE INDEX IF NOT EXISTS idx_crop_cycle_stages_cycle_id ON crop_cycle_stages(crop_cycle_id);
        CREATE INDEX IF NOT EXISTS idx_crop_cycle_stages_status ON crop_cycle_stages(status);
        CREATE INDEX IF NOT EXISTS idx_input_requirements_user_id ON input_requirements(user_id);
        CREATE INDEX IF NOT EXISTS idx_input_requirements_crop_cycle_id ON input_requirements(crop_cycle_id);
        CREATE INDEX IF NOT EXISTS idx_input_requirements_status ON input_requirements(status);
        CREATE INDEX IF NOT EXISTS idx_crop_cycles_assessment_id ON crop_cycles(assessment_id);
      `);
    },
  },
  // Sprint 04: Input supply chain — supplier_products, input_supply_requests, goods_receipts, fulfilment
  {
    version: "008_input_supply_chain",
    up(db) {
      // Enhance procurement_orders with expected_delivery_date, currency, delivery_destination
      const poColumns = db.prepare("PRAGMA table_info(procurement_orders)").all() as { name: string }[];
      if (!poColumns.some((c) => c.name === "expected_delivery_date")) {
        db.exec("ALTER TABLE procurement_orders ADD COLUMN expected_delivery_date TEXT;");
      }
      if (!poColumns.some((c) => c.name === "currency")) {
        db.exec("ALTER TABLE procurement_orders ADD COLUMN currency TEXT NOT NULL DEFAULT 'INR';");
      }
      if (!poColumns.some((c) => c.name === "delivery_destination")) {
        db.exec("ALTER TABLE procurement_orders ADD COLUMN delivery_destination TEXT;");
      }

      // Enhance suppliers with supplier_type, country, region
      const supColumns = db.prepare("PRAGMA table_info(suppliers)").all() as { name: string }[];
      if (!supColumns.some((c) => c.name === "supplier_type")) {
        db.exec("ALTER TABLE suppliers ADD COLUMN supplier_type TEXT;");
      }
      if (!supColumns.some((c) => c.name === "country")) {
        db.exec("ALTER TABLE suppliers ADD COLUMN country TEXT;");
      }
      if (!supColumns.some((c) => c.name === "region")) {
        db.exec("ALTER TABLE suppliers ADD COLUMN region TEXT;");
      }

      // Enhance input_catalogue with description, brand
      const icColumns = db.prepare("PRAGMA table_info(input_catalogue)").all() as { name: string }[];
      if (!icColumns.some((c) => c.name === "description")) {
        db.exec("ALTER TABLE input_catalogue ADD COLUMN description TEXT;");
      }
      if (!icColumns.some((c) => c.name === "brand")) {
        db.exec("ALTER TABLE input_catalogue ADD COLUMN brand TEXT;");
      }

      db.exec(`
        -- SUPPLIER PRODUCTS: Many-to-many relationship between suppliers and input catalogue
        CREATE TABLE IF NOT EXISTS supplier_products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
          input_id INTEGER NOT NULL REFERENCES input_catalogue(id) ON DELETE CASCADE,
          supplier_sku TEXT,
          package_size REAL,
          offered_unit TEXT NOT NULL,
          unit_price REAL,
          currency TEXT NOT NULL DEFAULT 'INR',
          min_order_quantity REAL,
          available_quantity REAL,
          lead_time_days INTEGER,
          offer_valid_until TEXT,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(supplier_id, input_id)
        );

        -- INPUT SUPPLY REQUESTS: Farmer demand requests to VAN
        CREATE TABLE IF NOT EXISTS input_supply_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
          crop_cycle_id INTEGER REFERENCES crop_cycles(id) ON DELETE SET NULL,
          delivery_location TEXT,
          requested_date TEXT,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'draft',
          submitted_at TEXT,
          reviewed_at TEXT,
          reviewed_by INTEGER REFERENCES users(id),
          review_notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- INPUT SUPPLY REQUEST ITEMS: Line items for farmer requests
        CREATE TABLE IF NOT EXISTS input_supply_request_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          request_id INTEGER NOT NULL REFERENCES input_supply_requests(id) ON DELETE CASCADE,
          input_requirement_id INTEGER REFERENCES input_requirements(id) ON DELETE SET NULL,
          input_id INTEGER NOT NULL REFERENCES input_catalogue(id) ON DELETE CASCADE,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          requested_date TEXT,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- GOODS RECEIPTS: Physical receipt of goods from supplier
        CREATE TABLE IF NOT EXISTS goods_receipts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          procurement_order_id INTEGER NOT NULL REFERENCES procurement_orders(id) ON DELETE CASCADE,
          receipt_date TEXT NOT NULL DEFAULT (date('now')),
          receiving_location TEXT,
          delivery_reference TEXT,
          batch_number TEXT,
          expiry_date TEXT,
          inspection_notes TEXT,
          status TEXT NOT NULL DEFAULT 'confirmed',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- GOODS RECEIPT ITEMS: Line items for goods receipts
        CREATE TABLE IF NOT EXISTS goods_receipt_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          receipt_id INTEGER NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
          order_item_id INTEGER NOT NULL REFERENCES procurement_order_items(id) ON DELETE CASCADE,
          received_quantity REAL NOT NULL,
          accepted_quantity REAL NOT NULL,
          rejected_quantity REAL DEFAULT 0,
          damaged_quantity REAL DEFAULT 0,
          unit TEXT NOT NULL,
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- FULFILMENT RECORDS: Allocation and delivery of stock to farmer requests
        CREATE TABLE IF NOT EXISTS fulfilment_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          request_id INTEGER NOT NULL REFERENCES input_supply_requests(id) ON DELETE CASCADE,
          request_item_id INTEGER REFERENCES input_supply_request_items(id) ON DELETE SET NULL,
          input_id INTEGER NOT NULL REFERENCES input_catalogue(id) ON DELETE CASCADE,
          inventory_id INTEGER NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
          farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          batch_number TEXT,
          status TEXT NOT NULL DEFAULT 'allocated',
          allocated_at TEXT NOT NULL DEFAULT (datetime('now')),
          dispatched_at TEXT,
          delivered_at TEXT,
          delivery_notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier_id ON supplier_products(supplier_id);
        CREATE INDEX IF NOT EXISTS idx_supplier_products_input_id ON supplier_products(input_id);
        CREATE INDEX IF NOT EXISTS idx_supplier_products_status ON supplier_products(status);
        CREATE INDEX IF NOT EXISTS idx_input_supply_requests_user_id ON input_supply_requests(user_id);
        CREATE INDEX IF NOT EXISTS idx_input_supply_requests_farm_id ON input_supply_requests(farm_id);
        CREATE INDEX IF NOT EXISTS idx_input_supply_requests_status ON input_supply_requests(status);
        CREATE INDEX IF NOT EXISTS idx_input_supply_request_items_request_id ON input_supply_request_items(request_id);
        CREATE INDEX IF NOT EXISTS idx_input_supply_request_items_input_id ON input_supply_request_items(input_id);
        CREATE INDEX IF NOT EXISTS idx_goods_receipts_order_id ON goods_receipts(procurement_order_id);
        CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_receipt_id ON goods_receipt_items(receipt_id);
        CREATE INDEX IF NOT EXISTS idx_fulfilment_records_request_id ON fulfilment_records(request_id);
        CREATE INDEX IF NOT EXISTS idx_fulfilment_records_farm_id ON fulfilment_records(farm_id);
        CREATE INDEX IF NOT EXISTS idx_fulfilment_records_status ON fulfilment_records(status);
        CREATE INDEX IF NOT EXISTS idx_procurement_orders_expected_delivery ON procurement_orders(expected_delivery_date);
      `);
    },
  },

  {
    version: "006_lifecycle_indexes",
    up(db) {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
        CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON fields(farm_id);
        CREATE INDEX IF NOT EXISTS idx_crop_cycles_user_id ON crop_cycles(user_id);
        CREATE INDEX IF NOT EXISTS idx_crop_cycles_field_id ON crop_cycles(field_id);
        CREATE INDEX IF NOT EXISTS idx_crop_cycles_status ON crop_cycles(status);
        CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
        CREATE INDEX IF NOT EXISTS idx_assessments_field_id ON assessments(field_id);
        CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
        CREATE INDEX IF NOT EXISTS idx_soil_measurements_assessment_id ON soil_measurements(assessment_id);
        CREATE INDEX IF NOT EXISTS idx_procurement_orders_user_id ON procurement_orders(user_id);
        CREATE INDEX IF NOT EXISTS idx_procurement_orders_status ON procurement_orders(status);
        CREATE INDEX IF NOT EXISTS idx_procurement_order_items_order_id ON procurement_order_items(order_id);
        CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
        CREATE INDEX IF NOT EXISTS idx_inventory_input_id ON inventory(input_id);
        CREATE INDEX IF NOT EXISTS idx_inventory_movements_inventory_id ON inventory_movements(inventory_id);
        CREATE INDEX IF NOT EXISTS idx_work_orders_user_id ON work_orders(user_id);
        CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
        CREATE INDEX IF NOT EXISTS idx_work_orders_field_id ON work_orders(field_id);
        CREATE INDEX IF NOT EXISTS idx_work_orders_equipment_id ON work_orders(equipment_id);
        CREATE INDEX IF NOT EXISTS idx_harvest_lots_user_id ON harvest_lots(user_id);
        CREATE INDEX IF NOT EXISTS idx_harvest_lots_crop_cycle_id ON harvest_lots(crop_cycle_id);
        CREATE INDEX IF NOT EXISTS idx_harvest_lots_status ON harvest_lots(status);
        CREATE INDEX IF NOT EXISTS idx_facilities_user_id ON facilities(user_id);
        CREATE INDEX IF NOT EXISTS idx_processing_records_user_id ON processing_records(user_id);
        CREATE INDEX IF NOT EXISTS idx_processing_records_input_lot_id ON processing_records(input_lot_id);
        CREATE INDEX IF NOT EXISTS idx_storage_locations_user_id ON storage_locations(user_id);
        CREATE INDEX IF NOT EXISTS idx_storage_locations_facility_id ON storage_locations(facility_id);
        CREATE INDEX IF NOT EXISTS idx_storage_movements_location_id ON storage_movements(storage_location_id);
        CREATE INDEX IF NOT EXISTS idx_buyers_user_id ON buyers(user_id);
        CREATE INDEX IF NOT EXISTS idx_buyer_orders_user_id ON buyer_orders(user_id);
        CREATE INDEX IF NOT EXISTS idx_buyer_orders_buyer_id ON buyer_orders(buyer_id);
        CREATE INDEX IF NOT EXISTS idx_buyer_orders_status ON buyer_orders(status);
        CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON shipments(user_id);
        CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
        CREATE INDEX IF NOT EXISTS idx_shipments_buyer_order_id ON shipments(buyer_order_id);
        CREATE INDEX IF NOT EXISTS idx_shipment_lots_shipment_id ON shipment_lots(shipment_id);
        CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
        CREATE INDEX IF NOT EXISTS idx_sales_buyer_id ON sales(buyer_id);
        CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_id ON financial_transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_financial_transactions_farm_id ON financial_transactions(farm_id);
        CREATE INDEX IF NOT EXISTS idx_financial_transactions_crop_cycle_id ON financial_transactions(crop_cycle_id);
        CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(transaction_type);
      `);
    },
  },
];

/* ---------- Tracker table ---------- */

function ensureTrackerTable(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT UNIQUE NOT NULL,
      applied_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function appliedVersions(db: DatabaseSync): Set<string> {
  const rows = db
    .prepare("SELECT version FROM migrations")
    .all() as { version: string }[];
  return new Set(rows.map((r) => r.version));
}

function recordApplied(db: DatabaseSync, version: string) {
  db.prepare("INSERT OR IGNORE INTO migrations (version) VALUES (?)").run(version);
}

/* ---------- Public API ---------- */

/**
 * Run any migrations that have not yet been applied.
 * Idempotent: safe to call on every server start.
 */
export function runMigrations(db: DatabaseSync) {
  ensureTrackerTable(db);
  const applied = appliedVersions(db);
  for (const migration of migrations) {
    if (!applied.has(migration.version)) {
      migration.up(db);
      recordApplied(db, migration.version);
    }
  }
}
