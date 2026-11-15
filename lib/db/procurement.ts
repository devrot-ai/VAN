import { getDb } from "./getDb";
import { InputCatalogueRow, SupplierRow, ProcurementOrderRow, ProcurementOrderItemRow } from "./types";
import { withAuditCreate, withAuditUpdate, withAuditDelete } from "@/lib/audit";

// --- Input Catalogue ---

export function listInputCatalogue() {
  return getDb().prepare(`SELECT * FROM input_catalogue WHERE status = 'active' ORDER BY category, name`).all() as InputCatalogueRow[];
}

export function getInputById(id: number): InputCatalogueRow | undefined {
  return getDb().prepare("SELECT * FROM input_catalogue WHERE id = ?").get(id) as InputCatalogueRow | undefined;
}

export const createInput = withAuditCreate(
  "INPUT_CREATED",
  (input: {
    name: string;
    category: string;
    manufacturer?: string | null;
    sku?: string | null;
    unit: string;
    packageSize?: number | null;
    unitPrice?: number | null;
    storageConditions?: string | null;
  }): InputCatalogueRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO input_catalogue (name, category, manufacturer, sku, unit, package_size, unit_price, storage_conditions) VALUES (?,?,?,?,?,?,?,?)")
      .run(input.name, input.category, input.manufacturer ?? null, input.sku ?? null, input.unit, input.packageSize ?? null, input.unitPrice ?? null, input.storageConditions ?? null);
    return getInputById(Number(info.lastInsertRowid))!;
  },
  () => -1,
  (row) => ({ inputId: row.id }),
);

// --- Suppliers ---

export function listSuppliers(userId: number) {
  return getDb().prepare(`SELECT * FROM suppliers WHERE user_id = ? AND status = 'active' ORDER BY name`).all(userId) as SupplierRow[];
}

export function getSupplierById(id: number): SupplierRow | undefined {
  return getDb().prepare("SELECT * FROM suppliers WHERE id = ?").get(id) as SupplierRow | undefined;
}

export const createSupplier = withAuditCreate(
  "SUPPLIER_CREATED",
  (input: {
    userId: number;
    name: string;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    terms?: string | null;
  }): SupplierRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO suppliers (user_id, name, contact_name, email, phone, address, terms) VALUES (?,?,?,?,?,?,?)")
      .run(input.userId, input.name, input.contactName ?? null, input.email ?? null, input.phone ?? null, input.address ?? null, input.terms ?? null);
    return getSupplierById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ supplierId: row.id }),
);

// --- Procurement Orders ---

export function listProcurementOrders(userId: number) {
  return getDb().prepare(`SELECT * FROM procurement_orders WHERE user_id = ? ORDER BY created_at DESC`).all(userId) as ProcurementOrderRow[];
}

export function getProcurementOrderById(id: number): ProcurementOrderRow | undefined {
  return getDb().prepare("SELECT * FROM procurement_orders WHERE id = ?").get(id) as ProcurementOrderRow | undefined;
}

export function listProcurementOrderItems(orderId: number) {
  return getDb().prepare(`SELECT * FROM procurement_order_items WHERE order_id = ? ORDER BY id`).all(orderId) as ProcurementOrderItemRow[];
}

export const createProcurementOrder = withAuditCreate(
  "PROCUREMENT_ORDER_CREATED",
  (input: {
    userId: number;
    farmId?: number | null;
    cropCycleId?: number | null;
    supplierId?: number | null;
    estimatedCost?: number | null;
    notes?: string | null;
  }): ProcurementOrderRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO procurement_orders (user_id, farm_id, crop_cycle_id, supplier_id, estimated_cost, notes) VALUES (?,?,?,?,?,?)")
      .run(input.userId, input.farmId ?? null, input.cropCycleId ?? null, input.supplierId ?? null, input.estimatedCost ?? null, input.notes ?? null);
    return getProcurementOrderById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ orderId: row.id }),
);

export const addProcurementOrderItem = withAuditCreate(
  "PROCUREMENT_ITEM_ADDED",
  (input: {
    orderId: number;
    inputId: number;
    quantity: number;
    unit: string;
    unitPrice?: number | null;
  }): ProcurementOrderItemRow => {
    const db = getDb();
    const totalPrice = input.unitPrice ? input.quantity * input.unitPrice : null;
    const info = db
      .prepare("INSERT INTO procurement_order_items (order_id, input_id, quantity, unit, unit_price, total_price) VALUES (?,?,?,?,?,?)")
      .run(input.orderId, input.inputId, input.quantity, input.unit, input.unitPrice ?? null, totalPrice);
    return db.prepare("SELECT * FROM procurement_order_items WHERE id = ?").get(Number(info.lastInsertRowid)) as ProcurementOrderItemRow;
  },
  () => -1,
  (row) => ({ itemId: row.id }),
);

export const updateProcurementOrderStatus = withAuditUpdate(
  "PROCUREMENT_ORDER_STATUS_UPDATED",
  (id: number, input: { status: string; submittedAt?: string | null; approvedAt?: string | null }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = ["status = ?"];
    const values: (string | number | null)[] = [input.status];
    if (input.submittedAt !== undefined) { fields.push("submitted_at = ?"); values.push(input.submittedAt); }
    if (input.approvedAt !== undefined) { fields.push("approved_at = ?"); values.push(input.approvedAt); }
    values.push(id);
    db.prepare(`UPDATE procurement_orders SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ orderId: id }),
);
