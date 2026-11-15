/**
 * Test helper that creates an in-memory SQLite database with all migrations
 * applied. Each test gets a fresh, isolated database.
 *
 * Usage:
 *   import { setupTestDb, teardownTestDb } from "../testDb";
 *
 *   beforeEach(() => setupTestDb());
 *   afterAll(() => teardownTestDb());
 */

import { DatabaseSync } from "node:sqlite";
import { runMigrations } from "@/lib/migrate";
import { setTestDb, getDb } from "@/lib/db/getDb";

/**
 * Set up a fresh in-memory SQLite database with all migrations applied.
 * This sets the _testDb variable in getDb.ts so all DB modules use the test database.
 */
export function setupTestDb(): DatabaseSync {
  // Create in-memory database
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  // Run all migrations
  runMigrations(db);

  // Inject the in-memory DB into getDb
  setTestDb(db);

  return db;
}

/**
 * Tear down the test database.
 */
export function teardownTestDb() {
  setTestDb(null);
}

/**
 * Create a test user in the in-memory database.
 */
export function createTestUser(
  db: DatabaseSync,
  role: "farmer" | "provider" | "cooperative" | "buyer" | "operations" = "farmer",
  name = "Test User",
  email = "test@example.com",
) {
  const result = db
    .prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)",
    )
    .run(name, email, "hashed_password", role);

  return Number(result.lastInsertRowid);
}

/**
 * Clear all data from the test database while keeping the schema.
 */
export function clearTestDb(db: DatabaseSync) {
  // Order matters: delete child tables before parent tables to avoid FK violations
  const tables = [
    // Lifecycle tables (children first)
    "shipment_lots",
    "sales",
    "shipments",
    "buyer_orders",
    "buyers",
    "storage_movements",
    "storage_locations",
    "processing_records",
    "facilities",
    "harvest_lots",
    "work_orders",
    "operators",
    "inventory_movements",
    "inventory",
    "procurement_order_items",
    "procurement_orders",
    "suppliers",
    "input_catalogue",
    "soil_measurements",
    "assessments",
    "input_requirements",
    "crop_cycle_stages",
    "crop_plans",
    "crop_cycles",
    "farms",
    // Sprint 04: Input supply chain tables
    "fulfilment_records",
    "goods_receipt_items",
    "goods_receipts",
    "input_supply_request_items",
    "input_supply_requests",
    "supplier_products",
    // Original tables (children first)
    "notifications",
    "harvests",
    "maintenance",
    "transactions",
    "purchases",
    "members",
    "equipment",
    "devices",
    "bookings",
    "activities",
    "fields",
    "sessions",
    "auth_tokens",
    "contact_messages",
    "early_access",
    "users",
  ];

  db.exec("PRAGMA foreign_keys = OFF;");
  for (const table of tables) {
    db.prepare(`DELETE FROM ${table}`).run();
  }
  db.exec("PRAGMA foreign_keys = ON;");
}
