import { getDb } from "./getDb";
import { PurchaseRow } from "./types";
import { withAuditCreate, withAuditUpdate, withAuditDelete } from "@/lib/audit";

export function listPurchases(userId: number) {
  return getDb().prepare("SELECT * FROM purchases WHERE user_id = ? ORDER BY status").all(userId) as PurchaseRow[];
}

export function getPurchaseById(id: number): PurchaseRow | undefined {
  return getDb().prepare("SELECT * FROM purchases WHERE id = ?").get(id) as PurchaseRow | undefined;
}

export const createPurchase = withAuditCreate(
  "PURCHASE_CREATED",
  (input: {
    userId: number;
    lot: string;
    buyer?: string | null;
    quantityTonnes?: number;
    amount?: number;
    status?: string;
  }): PurchaseRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO purchases (user_id, lot, buyer, quantity_tonnes, amount, status) VALUES (?,?,?,?,?,?)")
      .run(input.userId, input.lot, input.buyer ?? null, input.quantityTonnes ?? 0, input.amount ?? 0, input.status ?? "enquiry");
    return getPurchaseById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ purchaseId: row.id }),
);

export const updatePurchase = withAuditUpdate(
  "PURCHASE_UPDATED",
  (id: number, input: {
    lot?: string;
    buyer?: string | null;
    quantityTonnes?: number;
    amount?: number;
    status?: string;
  }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (input.lot !== undefined) { fields.push("lot = ?"); values.push(input.lot); }
    if (input.buyer !== undefined) { fields.push("buyer = ?"); values.push(input.buyer); }
    if (input.quantityTonnes !== undefined) { fields.push("quantity_tonnes = ?"); values.push(input.quantityTonnes); }
    if (input.amount !== undefined) { fields.push("amount = ?"); values.push(input.amount); }
    if (input.status !== undefined) { fields.push("status = ?"); values.push(input.status); }
    if (fields.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE purchases SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ purchaseId: id }),
);

export const deletePurchase = withAuditDelete(
  "PURCHASE_DELETED",
  (id: number, _userId: number): void => {
    getDb().prepare("DELETE FROM purchases WHERE id = ?").run(id);
  },
  (id) => ({ purchaseId: id }),
);
