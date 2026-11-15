import { getDb } from "./getDb";
import { BuyerRow, BuyerOrderRow, ShipmentRow, ShipmentLotRow, SaleRow, FinancialTransactionRow } from "./types";
import { withAuditCreate, withAuditUpdate } from "@/lib/audit";

// --- Buyers ---

export function listBuyers(userId: number) {
  return getDb().prepare(`SELECT * FROM buyers WHERE user_id = ? AND status = 'active' ORDER BY name`).all(userId) as BuyerRow[];
}

export function getBuyerById(id: number): BuyerRow | undefined {
  return getDb().prepare("SELECT * FROM buyers WHERE id = ?").get(id) as BuyerRow | undefined;
}

export const createBuyer = withAuditCreate(
  "BUYER_CREATED",
  (input: {
    userId: number;
    name: string;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    buyerType?: string | null;
    paymentTerms?: string | null;
  }): BuyerRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO buyers (user_id, name, contact_name, email, phone, address, buyer_type, payment_terms) VALUES (?,?,?,?,?,?,?,?)")
      .run(input.userId, input.name, input.contactName ?? null, input.email ?? null, input.phone ?? null, input.address ?? null, input.buyerType ?? null, input.paymentTerms ?? null);
    return getBuyerById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ buyerId: row.id }),
);

// --- Buyer Orders ---

export function listBuyerOrders(userId: number) {
  return getDb().prepare(`SELECT * FROM buyer_orders WHERE user_id = ? ORDER BY created_at DESC`).all(userId) as BuyerOrderRow[];
}

export function getBuyerOrderById(id: number): BuyerOrderRow | undefined {
  return getDb().prepare("SELECT * FROM buyer_orders WHERE id = ?").get(id) as BuyerOrderRow | undefined;
}

export const createBuyerOrder = withAuditCreate(
  "BUYER_ORDER_CREATED",
  (input: {
    userId: number;
    buyerId: number;
    commodity: string;
    quantity: number;
    unit: string;
    grade?: string | null;
    agreedPrice?: number | null;
    currency?: string;
    deliveryAddress?: string | null;
    expectedDate?: string | null;
  }): BuyerOrderRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO buyer_orders (user_id, buyer_id, commodity, quantity, unit, grade, agreed_price, currency, delivery_address, expected_date) VALUES (?,?,?,?,?,?,?,?,?,?)")
      .run(input.userId, input.buyerId, input.commodity, input.quantity, input.unit, input.grade ?? null, input.agreedPrice ?? null, input.currency ?? "INR", input.deliveryAddress ?? null, input.expectedDate ?? null);
    return getBuyerOrderById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ buyerOrderId: row.id }),
);

export const updateBuyerOrderStatus = withAuditUpdate(
  "BUYER_ORDER_STATUS_UPDATED",
  (id: number, input: { status: string }, _userId: number): void => {
    getDb().prepare("UPDATE buyer_orders SET status = ? WHERE id = ?").run(input.status, id);
  },
  (id) => ({ buyerOrderId: id }),
);

// --- Shipments ---

export function listShipments(userId: number) {
  return getDb().prepare(`SELECT * FROM shipments WHERE user_id = ? ORDER BY created_at DESC`).all(userId) as ShipmentRow[];
}

export function getShipmentById(id: number): ShipmentRow | undefined {
  return getDb().prepare("SELECT * FROM shipments WHERE id = ?").get(id) as ShipmentRow | undefined;
}

export function listShipmentLots(shipmentId: number) {
  return getDb().prepare(`SELECT * FROM shipment_lots WHERE shipment_id = ?`).all(shipmentId) as ShipmentLotRow[];
}

export const createShipment = withAuditCreate(
  "SHIPMENT_CREATED",
  (input: {
    userId: number;
    buyerOrderId?: number | null;
    originFacilityId?: number | null;
    destination?: string | null;
    carrier?: string | null;
    vehicle?: string | null;
    driver?: string | null;
    plannedQuantity: number;
    unit?: string;
    plannedDispatchDate?: string | null;
    notes?: string | null;
  }): ShipmentRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO shipments (user_id, buyer_order_id, origin_facility_id, destination, carrier, vehicle, driver, planned_quantity, unit, planned_dispatch_date, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
      .run(input.userId, input.buyerOrderId ?? null, input.originFacilityId ?? null, input.destination ?? null, input.carrier ?? null, input.vehicle ?? null, input.driver ?? null, input.plannedQuantity, input.unit ?? "tonnes", input.plannedDispatchDate ?? null, input.notes ?? null);
    return getShipmentById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ shipmentId: row.id }),
);

export const addShipmentLot = withAuditCreate(
  "SHIPMENT_LOT_ADDED",
  (input: {
    shipmentId: number;
    lotId: number;
    quantity: number;
    unit: string;
  }): ShipmentLotRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO shipment_lots (shipment_id, lot_id, quantity, unit) VALUES (?,?,?,?)")
      .run(input.shipmentId, input.lotId, input.quantity, input.unit);
    return db.prepare("SELECT * FROM shipment_lots WHERE id = ?").get(Number(info.lastInsertRowid)) as ShipmentLotRow;
  },
  () => -1,
  (row) => ({ shipmentLotId: row.id }),
);

export const updateShipmentStatus = withAuditUpdate(
  "SHIPMENT_STATUS_UPDATED",
  (id: number, input: {
    status: string;
    dispatchedQuantity?: number;
    deliveredQuantity?: number;
    actualDispatchDate?: string | null;
    actualDeliveryDate?: string | null;
  }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = ["status = ?"];
    const values: (string | number | null)[] = [input.status];
    if (input.dispatchedQuantity !== undefined) { fields.push("dispatched_quantity = ?"); values.push(input.dispatchedQuantity); }
    if (input.deliveredQuantity !== undefined) { fields.push("delivered_quantity = ?"); values.push(input.deliveredQuantity); }
    if (input.actualDispatchDate !== undefined) { fields.push("actual_dispatch_date = ?"); values.push(input.actualDispatchDate); }
    if (input.actualDeliveryDate !== undefined) { fields.push("actual_delivery_date = ?"); values.push(input.actualDeliveryDate); }
    values.push(id);
    db.prepare(`UPDATE shipments SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ shipmentId: id }),
);

// --- Sales ---

export function listSales(userId: number) {
  return getDb().prepare(`SELECT * FROM sales WHERE user_id = ? ORDER BY sale_date DESC`).all(userId) as SaleRow[];
}

export function getSaleById(id: number): SaleRow | undefined {
  return getDb().prepare("SELECT * FROM sales WHERE id = ?").get(id) as SaleRow | undefined;
}

export const createSale = withAuditCreate(
  "SALE_CREATED",
  (input: {
    userId: number;
    buyerId?: number | null;
    buyerOrderId?: number | null;
    shipmentId?: number | null;
    commodity: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    currency?: string;
    charges?: number;
  }): SaleRow => {
    const db = getDb();
    const grossAmount = input.quantity * input.unitPrice;
    const charges = input.charges ?? 0;
    const netAmount = grossAmount - charges;
    const info = db
      .prepare("INSERT INTO sales (user_id, buyer_id, buyer_order_id, shipment_id, commodity, quantity, unit, unit_price, gross_amount, currency, charges, net_amount) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(input.userId, input.buyerId ?? null, input.buyerOrderId ?? null, input.shipmentId ?? null, input.commodity, input.quantity, input.unit, input.unitPrice, grossAmount, input.currency ?? "INR", charges, netAmount);
    return getSaleById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ saleId: row.id }),
);

// --- Financial Transactions ---

export function listFinancialTransactions(userId: number) {
  return getDb().prepare(`SELECT * FROM financial_transactions WHERE user_id = ? ORDER BY date DESC`).all(userId) as FinancialTransactionRow[];
}

export function listFinancialTransactionsByCropCycle(cropCycleId: number) {
  return getDb().prepare(`SELECT * FROM financial_transactions WHERE crop_cycle_id = ? ORDER BY date`).all(cropCycleId) as FinancialTransactionRow[];
}

export function getFinancialTransactionById(id: number): FinancialTransactionRow | undefined {
  return getDb().prepare("SELECT * FROM financial_transactions WHERE id = ?").get(id) as FinancialTransactionRow | undefined;
}

export const createFinancialTransaction = withAuditCreate(
  "FINANCIAL_TRANSACTION_CREATED",
  (input: {
    userId: number;
    farmId?: number | null;
    fieldId?: number | null;
    cropCycleId?: number | null;
    transactionType: string;
    category: string;
    amount: number;
    currency?: string;
    date?: string;
    description?: string | null;
    sourceType?: string | null;
    sourceId?: number | null;
    counterparty?: string | null;
  }): FinancialTransactionRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO financial_transactions (user_id, farm_id, field_id, crop_cycle_id, transaction_type, category, amount, currency, date, description, source_type, source_id, counterparty) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(input.userId, input.farmId ?? null, input.fieldId ?? null, input.cropCycleId ?? null, input.transactionType, input.category, input.amount, input.currency ?? "INR", input.date ?? new Date().toISOString().slice(0, 10), input.description ?? null, input.sourceType ?? null, input.sourceId ?? null, input.counterparty ?? null);
    return getFinancialTransactionById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ transactionId: row.id }),
);

// --- Crop Cycle Financial Summary ---

export function getCropCycleFinancialSummary(cropCycleId: number) {
  const rows = getDb().prepare(
    `SELECT 
      COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
      COUNT(*) as transaction_count
     FROM financial_transactions WHERE crop_cycle_id = ?`
  ).all(cropCycleId) as { total_income: number; total_expense: number; transaction_count: number }[];
  
  if (rows.length === 0) return { totalIncome: 0, totalExpense: 0, netResult: 0, transactionCount: 0 };
  const { total_income, total_expense, transaction_count } = rows[0];
  return {
    totalIncome: total_income,
    totalExpense: total_expense,
    netResult: total_income - total_expense,
    transactionCount: transaction_count,
  };
}
