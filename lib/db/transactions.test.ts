import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listTransactions, createTransaction, updateTransaction, deleteTransaction } from "./transactions";

describe("transactions module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
  });

  afterAll(() => teardownTestDb());

  describe("listTransactions", () => {
    it("returns empty array when no transactions exist", () => {
      expect(listTransactions(userId)).toEqual([]);
    });

    it("returns transactions for the user", () => {
      createTransaction({ userId, date: "2025-01-01", description: "Seed purchase", amount: 5000, type: "expense" });
      createTransaction({ userId, date: "2025-01-02", description: "Crop sale", amount: 15000, type: "income" });
      expect(listTransactions(userId)).toHaveLength(2);
    });
  });

  describe("createTransaction", () => {
    it("creates an expense transaction", () => {
      const tx = createTransaction({
        userId,
        date: "2025-01-01",
        description: "Fertilizer",
        amount: 3000,
        type: "expense",
        category: "inputs",
      });
      expect(tx.id).toBeGreaterThan(0);
      expect(tx.amount).toBe(3000);
      expect(tx.type).toBe("expense");
      expect(tx.category).toBe("inputs");
    });

    it("creates an income transaction", () => {
      const tx = createTransaction({
        userId,
        date: "2025-01-01",
        description: "Wheat sale",
        amount: 20000,
        type: "income",
      });
      expect(tx.type).toBe("income");
      expect(tx.category).toBeNull();
    });
  });

  describe("updateTransaction", () => {
    it("updates amount", () => {
      const created = createTransaction({ userId, date: "2025-01-01", description: "Test", amount: 1000, type: "expense" });
      updateTransaction(created.id, { amount: 2000 }, userId);
      const updated = db.prepare("SELECT * FROM transactions WHERE id = ?").get(created.id) as any;
      expect(updated.amount).toBe(2000);
    });
  });

  describe("deleteTransaction", () => {
    it("deletes a transaction", () => {
      const created = createTransaction({ userId, date: "2025-01-01", description: "Test", amount: 1000, type: "expense" });
      deleteTransaction(created.id, userId);
      const txs = listTransactions(userId);
      expect(txs).toHaveLength(0);
    });
  });
});
