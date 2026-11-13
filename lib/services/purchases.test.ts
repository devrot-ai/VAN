import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { createPurchaseService, updatePurchaseService, deletePurchaseService } from "./purchases";
import { getPurchaseById } from "../db/purchases";

describe("purchases service", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "buyer");
  });

  afterEach(() => teardownTestDb());

  it("creates a purchase through the service", async () => {
    const row = await createPurchaseService(userId, {
      lot: "Rice Batch A",
      status: "enquiry",
    });
    expect(row.lot).toBe("Rice Batch A");
    expect(row.status).toBe("enquiry");
  });

  it("rejects invalid purchase data", async () => {
    await expect(
      createPurchaseService(userId, { lot: "", status: "enquiry" }),
    ).rejects.toThrow();
  });

  it("updates a purchase through the service", async () => {
    const created = await createPurchaseService(userId, {
      lot: "Old Lot",
      status: "enquiry",
    });
    const result = await updatePurchaseService(userId, created.id, {
      lot: "New Lot",
      status: "enquiry",
    });
    expect(result).toBe(true);
    expect(getPurchaseById(created.id)!.lot).toBe("New Lot");
  });

  it("deletes a purchase through the service", async () => {
    const created = await createPurchaseService(userId, {
      lot: "To Delete",
      status: "enquiry",
    });
    const result = await deletePurchaseService(userId, created.id);
    expect(result).toBe(true);
    expect(getPurchaseById(created.id)).toBeUndefined();
  });
});
