import { getDb } from "./getDb";
import {
  SupplierProductRow,
  InputSupplyRequestRow,
  InputSupplyRequestItemRow,
  GoodsReceiptRow,
  GoodsReceiptItemRow,
  FulfilmentRecordRow,
} from "./types";
import { withAuditCreate, withAuditUpdate, logAudit } from "@/lib/audit";

// --- Supplier Products ---

export function listSupplierProductsBySupplier(supplierId: number) {
  return getDb().prepare(
    "SELECT * FROM supplier_products WHERE supplier_id = ? AND status = 'active' ORDER BY id"
  ).all(supplierId) as SupplierProductRow[];
}

export function listSupplierProductsByInput(inputId: number) {
  return getDb().prepare(
    "SELECT * FROM supplier_products WHERE input_id = ? AND status = 'active' ORDER BY unit_price ASC"
  ).all(inputId) as SupplierProductRow[];
}

export function getSupplierProductById(id: number): SupplierProductRow | undefined {
  return getDb().prepare("SELECT * FROM supplier_products WHERE id = ?").get(id) as SupplierProductRow | undefined;
}

export const createSupplierProduct = withAuditCreate(
  "SUPPLIER_PRODUCT_CREATED",
  (input: {
    supplierId: number;
    inputId: number;
    offeredUnit: string;
    supplierSku?: string | null;
    packageSize?: number | null;
    unitPrice?: number | null;
    currency?: string;
    minOrderQuantity?: number | null;
    availableQuantity?: number | null;
    leadTimeDays?: number | null;
    offerValidUntil?: string | null;
  }): SupplierProductRow => {
    const db = getDb();
    const info = db
      .prepare(`INSERT INTO supplier_products (supplier_id, input_id, supplier_sku, package_size, offered_unit, unit_price, currency, min_order_quantity, available_quantity, lead_time_days, offer_valid_until)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .run(
        input.supplierId, input.inputId, input.supplierSku ?? null, input.packageSize ?? null,
        input.offeredUnit, input.unitPrice ?? null, input.currency ?? "INR",
        input.minOrderQuantity ?? null, input.availableQuantity ?? null,
        input.leadTimeDays ?? null, input.offerValidUntil ?? null
      );
    return getSupplierProductById(Number(info.lastInsertRowid))!;
  },
  () => -1,
  (row) => ({ supplierProductId: row.id }),
);

export const updateSupplierProduct = withAuditUpdate(
  "SUPPLIER_PRODUCT_UPDATED",
  (id: number, input: {
    supplierSku?: string | null;
    packageSize?: number | null;
    offeredUnit?: string;
    unitPrice?: number | null;
    currency?: string;
    minOrderQuantity?: number | null;
    availableQuantity?: number | null;
    leadTimeDays?: number | null;
    offerValidUntil?: string | null;
    status?: string;
  }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (input.supplierSku !== undefined) { fields.push("supplier_sku = ?"); values.push(input.supplierSku ?? null); }
    if (input.packageSize !== undefined) { fields.push("package_size = ?"); values.push(input.packageSize ?? null); }
    if (input.offeredUnit !== undefined) { fields.push("offered_unit = ?"); values.push(input.offeredUnit); }
    if (input.unitPrice !== undefined) { fields.push("unit_price = ?"); values.push(input.unitPrice ?? null); }
    if (input.currency !== undefined) { fields.push("currency = ?"); values.push(input.currency); }
    if (input.minOrderQuantity !== undefined) { fields.push("min_order_quantity = ?"); values.push(input.minOrderQuantity ?? null); }
    if (input.availableQuantity !== undefined) { fields.push("available_quantity = ?"); values.push(input.availableQuantity ?? null); }
    if (input.leadTimeDays !== undefined) { fields.push("lead_time_days = ?"); values.push(input.leadTimeDays ?? null); }
    if (input.offerValidUntil !== undefined) { fields.push("offer_valid_until = ?"); values.push(input.offerValidUntil ?? null); }
    if (input.status !== undefined) { fields.push("status = ?"); values.push(input.status); }
    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(id);
      db.prepare(`UPDATE supplier_products SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }
  },
  (id) => ({ supplierProductId: id }),
);

// --- Input Supply Requests ---

export function listInputSupplyRequests(userId: number) {
  return getDb().prepare(
    "SELECT * FROM input_supply_requests WHERE user_id = ? ORDER BY created_at DESC"
  ).all(userId) as InputSupplyRequestRow[];
}

export function listInputSupplyRequestsByFarm(farmId: number) {
  return getDb().prepare(
    "SELECT * FROM input_supply_requests WHERE farm_id = ? ORDER BY created_at DESC"
  ).all(farmId) as InputSupplyRequestRow[];
}

export function getInputSupplyRequestById(id: number): InputSupplyRequestRow | undefined {
  return getDb().prepare("SELECT * FROM input_supply_requests WHERE id = ?").get(id) as InputSupplyRequestRow | undefined;
}

export const createInputSupplyRequest = withAuditCreate(
  "INPUT_SUPPLY_REQUEST_CREATED",
  (input: {
    userId: number;
    farmId: number;
    cropCycleId?: number | null;
    deliveryLocation?: string | null;
    requestedDate?: string | null;
    notes?: string | null;
  }): InputSupplyRequestRow => {
    const db = getDb();
    const info = db
      .prepare(`INSERT INTO input_supply_requests (user_id, farm_id, crop_cycle_id, delivery_location, requested_date, notes)
        VALUES (?,?,?,?,?,?)`)
      .run(input.userId, input.farmId, input.cropCycleId ?? null, input.deliveryLocation ?? null, input.requestedDate ?? null, input.notes ?? null);
    return getInputSupplyRequestById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ requestId: row.id }),
);

export function submitInputSupplyRequest(id: number, userId: number): void {
  const db = getDb();
  db.prepare("UPDATE input_supply_requests SET status = 'submitted', submitted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(id);
  logAudit("INPUT_SUPPLY_REQUEST_SUBMITTED", userId, { requestId: id });
}

export function reviewInputSupplyRequest(id: number, input: {
  status: string;
  reviewedBy: number;
  reviewNotes?: string | null;
}): void {
  const db = getDb();
  const fields = ["status = ?", "reviewed_by = ?", "reviewed_at = datetime('now')", "updated_at = datetime('now')"];
  const values: (string | number | null)[] = [input.status, input.reviewedBy];
  if (input.reviewNotes !== undefined) { fields.push("review_notes = ?"); values.push(input.reviewNotes ?? null); }
  values.push(id);
  db.prepare(`UPDATE input_supply_requests SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  logAudit("INPUT_SUPPLY_REQUEST_REVIEWED", input.reviewedBy, { requestId: id, status: input.status });
}

// --- Input Supply Request Items ---

export function listInputSupplyRequestItems(requestId: number) {
  return getDb().prepare(
    "SELECT * FROM input_supply_request_items WHERE request_id = ? ORDER BY id"
  ).all(requestId) as InputSupplyRequestItemRow[];
}

export const addInputSupplyRequestItem = withAuditCreate(
  "INPUT_SUPPLY_REQUEST_ITEM_CREATED",
  (input: {
    requestId: number;
    inputId: number;
    quantity: number;
    unit: string;
    inputRequirementId?: number | null;
    requestedDate?: string | null;
    notes?: string | null;
  }): InputSupplyRequestItemRow => {
    const db = getDb();
    const info = db
      .prepare(`INSERT INTO input_supply_request_items (request_id, input_requirement_id, input_id, quantity, unit, requested_date, notes)
        VALUES (?,?,?,?,?,?,?)`)
      .run(
        input.requestId, input.inputRequirementId ?? null, input.inputId,
        input.quantity, input.unit, input.requestedDate ?? null, input.notes ?? null
      );
    return db.prepare("SELECT * FROM input_supply_request_items WHERE id = ?").get(Number(info.lastInsertRowid)) as InputSupplyRequestItemRow;
  },
  () => -1,
  (row) => ({ itemId: row.id }),
);

// --- Goods Receipts ---

export function listGoodsReceiptsByOrder(orderId: number) {
  return getDb().prepare(
    "SELECT * FROM goods_receipts WHERE procurement_order_id = ? ORDER BY receipt_date DESC"
  ).all(orderId) as GoodsReceiptRow[];
}

export function getGoodsReceiptById(id: number): GoodsReceiptRow | undefined {
  return getDb().prepare("SELECT * FROM goods_receipts WHERE id = ?").get(id) as GoodsReceiptRow | undefined;
}

export const createGoodsReceipt = withAuditCreate(
  "GOODS_RECEIPT_CREATED",
  (input: {
    userId: number;
    procurementOrderId: number;
    receiptDate?: string;
    receivingLocation?: string | null;
    deliveryReference?: string | null;
    batchNumber?: string | null;
    expiryDate?: string | null;
    inspectionNotes?: string | null;
  }): GoodsReceiptRow => {
    const db = getDb();
    const info = db
      .prepare(`INSERT INTO goods_receipts (user_id, procurement_order_id, receipt_date, receiving_location, delivery_reference, batch_number, expiry_date, inspection_notes)
        VALUES (?,?,?,?,?,?,?,?)`)
      .run(
        input.userId, input.procurementOrderId, input.receiptDate ?? dateNow(),
        input.receivingLocation ?? null, input.deliveryReference ?? null,
        input.batchNumber ?? null, input.expiryDate ?? null, input.inspectionNotes ?? null
      );
    return getGoodsReceiptById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ receiptId: row.id }),
);

export const addGoodsReceiptItem = withAuditCreate(
  "GOODS_RECEIPT_ITEM_CREATED",
  (input: {
    receiptId: number;
    orderItemId: number;
    receivedQuantity: number;
    acceptedQuantity: number;
    rejectedQuantity?: number;
    damagedQuantity?: number;
    unit: string;
    notes?: string | null;
  }): GoodsReceiptItemRow => {
    const db = getDb();
    const info = db
      .prepare(`INSERT INTO goods_receipt_items (receipt_id, order_item_id, received_quantity, accepted_quantity, rejected_quantity, damaged_quantity, unit, notes)
        VALUES (?,?,?,?,?,?,?,?)`)
      .run(
        input.receiptId, input.orderItemId, input.receivedQuantity, input.acceptedQuantity,
        input.rejectedQuantity ?? 0, input.damagedQuantity ?? 0, input.unit, input.notes ?? null
      );
    return db.prepare("SELECT * FROM goods_receipt_items WHERE id = ?").get(Number(info.lastInsertRowid)) as GoodsReceiptItemRow;
  },
  () => -1,
  (row) => ({ receiptItemId: row.id }),
);

// --- Fulfilment Records ---

export function listFulfilmentRecordsByRequest(requestId: number) {
  return getDb().prepare(
    "SELECT * FROM fulfilment_records WHERE request_id = ? ORDER BY allocated_at DESC"
  ).all(requestId) as FulfilmentRecordRow[];
}

export function listFulfilmentRecordsByFarm(farmId: number) {
  return getDb().prepare(
    "SELECT * FROM fulfilment_records WHERE farm_id = ? ORDER BY allocated_at DESC"
  ).all(farmId) as FulfilmentRecordRow[];
}

export function getFulfilmentRecordById(id: number): FulfilmentRecordRow | undefined {
  return getDb().prepare("SELECT * FROM fulfilment_records WHERE id = ?").get(id) as FulfilmentRecordRow | undefined;
}

export const createFulfilmentRecord = withAuditCreate(
  "FULFILMENT_ALLOCATED",
  (input: {
    userId: number;
    requestId: number;
    inputId: number;
    inventoryId: number;
    farmId: number;
    quantity: number;
    unit: string;
    requestItemId?: number | null;
    batchNumber?: string | null;
  }): FulfilmentRecordRow => {
    const db = getDb();
    const info = db
      .prepare(`INSERT INTO fulfilment_records (user_id, request_id, request_item_id, input_id, inventory_id, farm_id, quantity, unit, batch_number)
        VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(
        input.userId, input.requestId, input.requestItemId ?? null, input.inputId,
        input.inventoryId, input.farmId, input.quantity, input.unit, input.batchNumber ?? null
      );
    return getFulfilmentRecordById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ fulfilmentId: row.id }),
);

export function dispatchFulfilment(id: number, userId: number): void {
  const db = getDb();
  db.prepare("UPDATE fulfilment_records SET status = 'dispatched', dispatched_at = datetime('now') WHERE id = ?").run(id);
  logAudit("FULFILMENT_DISPATCHED", userId, { fulfilmentId: id });
}

export function deliverFulfilment(id: number, userId: number, notes?: string | null): void {
  const db = getDb();
  const fields = ["status = 'delivered'", "delivered_at = datetime('now')"];
  const values: (string | number | null)[] = [];
  if (notes !== undefined) { fields.push("delivery_notes = ?"); values.push(notes ?? null); }
  values.push(id);
  db.prepare(`UPDATE fulfilment_records SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  logAudit("FULFILMENT_DELIVERED", userId, { fulfilmentId: id });
}

// --- Helper ---

function dateNow(): string {
  return new Date().toISOString().slice(0, 10);
}
