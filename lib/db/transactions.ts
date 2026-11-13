import { getDb } from "./getDb";
import { TransactionRow } from "./types";
import { withAuditCreate, withAuditUpdate, withAuditDelete } from "@/lib/audit";

export function listTransactions(userId: number): TransactionRow[] {
  return getDb()
    .prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC")
    .all(userId) as TransactionRow[];
}

export function getTransactionById(id: number): TransactionRow | undefined {
  return getDb().prepare("SELECT * FROM transactions WHERE id = ?").get(id) as TransactionRow | undefined;
}

export const createTransaction = withAuditCreate(
  "TRANSACTION_CREATED",
  (input: {
    userId: number;
    date: string;
    description: string;
    amount: number;
    type: string;
    category?: string | null;
  }): TransactionRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO transactions (user_id, date, description, amount, type, category) VALUES (?,?,?,?,?,?)")
      .run(input.userId, input.date, input.description, input.amount, input.type, input.category ?? null);
    return getTransactionById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ transactionId: row.id }),
);

export const updateTransaction = withAuditUpdate(
  "TRANSACTION_UPDATED",
  (id: number, input: {
    date?: string;
    description?: string;
    amount?: number;
    type?: string;
    category?: string | null;
  }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (input.date !== undefined) { fields.push("date = ?"); values.push(input.date); }
    if (input.description !== undefined) { fields.push("description = ?"); values.push(input.description); }
    if (input.amount !== undefined) { fields.push("amount = ?"); values.push(input.amount); }
    if (input.type !== undefined) { fields.push("type = ?"); values.push(input.type); }
    if (input.category !== undefined) { fields.push("category = ?"); values.push(input.category); }
    if (fields.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE transactions SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ transactionId: id }),
);

export const deleteTransaction = withAuditDelete(
  "TRANSACTION_DELETED",
  (id: number, _userId: number): void => {
    getDb().prepare("DELETE FROM transactions WHERE id = ?").run(id);
  },
  (id) => ({ transactionId: id }),
);
