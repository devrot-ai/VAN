import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { createTransactionService, updateTransactionService, deleteTransactionService } from "./transactions";
import { getTransactionById } from "../db/transactions";

describe("transactions service", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
  });

  afterEach(() => teardownTestDb());

  it("creates a transaction through the service", async () => {
    const row = await createTransactionService(userId, {
      description: "Seed purchase",
      amount: 150,
      type: "expense",
      date: "2025-05-01",
      category: "seeds",
    });
    expect(row.description).toBe("Seed purchase");
    expect(row.amount).toBe(150);
  });

  it("rejects invalid transaction data", async () => {
    await expect(
      createTransactionService(userId, { description: "", amount: 0, type: "expense", date: "2025-05-01" }),
    ).rejects.toThrow();
  });

  it("updates a transaction through the service", async () => {
    const created = await createTransactionService(userId, {
      description: "Old",
      amount: 100,
      type: "expense",
      date: "2025-05-01",
    });
    const result = await updateTransactionService(userId, created.id, {
      description: "New",
      amount: 100,
      type: "expense",
      date: "2025-05-01",
    });
    expect(result).toBe(true);
    expect(getTransactionById(created.id)!.description).toBe("New");
  });

  it("deletes a transaction through the service", async () => {
    const created = await createTransactionService(userId, {
      description: "To Delete",
      amount: 50,
      type: "expense",
      date: "2025-05-01",
    });
    const result = await deleteTransactionService(userId, created.id);
    expect(result).toBe(true);
    expect(getTransactionById(created.id)).toBeUndefined();
  });
});
