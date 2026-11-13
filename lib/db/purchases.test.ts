import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listPurchases, createPurchase, updatePurchase, deletePurchase } from "./purchases";

describe("purchases module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "buyer", "Buyer", "buyer@example.com");
  });

  afterAll(() => teardownTestDb());

  describe("listPurchases", () => {
    it("returns empty array when no purchases exist", () => {
      expect(listPurchases(userId)).toEqual([]);
    });

    it("returns purchases for the user", () => {
      createPurchase({ userId, lot: "Wheat A", quantityTonnes: 10, amount: 50000, status: "enquiry" });
      expect(listPurchases(userId)).toHaveLength(1);
    });
  });

  describe("createPurchase", () => {
    it("creates a purchase", () => {
      const p = createPurchase({
        userId,
        lot: "Rice Batch 1",
        buyer: "Mills Inc",
        quantityTonnes: 20,
        amount: 100000,
        status: "confirmed",
      });
      expect(p.id).toBeGreaterThan(0);
      expect(p.lot).toBe("Rice Batch 1");
      expect(p.quantity_tonnes).toBe(20);
      expect(p.status).toBe("confirmed");
    });
  });

  describe("updatePurchase", () => {
    it("updates status", () => {
      const created = createPurchase({ userId, lot: "Test", quantityTonnes: 5, amount: 25000, status: "enquiry" });
      updatePurchase(created.id, { status: "confirmed" }, userId);
      const updated = db.prepare("SELECT * FROM purchases WHERE id = ?").get(created.id) as any;
      expect(updated.status).toBe("confirmed");
    });
  });

  describe("deletePurchase", () => {
    it("deletes a purchase", () => {
      const created = createPurchase({ userId, lot: "Test", quantityTonnes: 5, amount: 25000 });
      deletePurchase(created.id, userId);
      expect(listPurchases(userId)).toHaveLength(0);
    });
  });
});
