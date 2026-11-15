import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listInventory, getInventoryById, getOrCreateInventory, addInventoryMovement, listInventoryMovements } from "./inventory";
import { createInput } from "./procurement";

describe("inventory module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;
  let inputId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
    const input = createInput({ name: "Urea", category: "fertilizer", unit: "kg" });
    inputId = input.id;
  });

  afterAll(() => teardownTestDb());

  describe("getOrCreateInventory", () => {
    it("creates inventory record when none exists", () => {
      const inv = getOrCreateInventory(userId, inputId, "Warehouse A", "kg");
      expect(inv.id).toBeGreaterThan(0);
      expect(inv.user_id).toBe(userId);
      expect(inv.input_id).toBe(inputId);
      expect(inv.quantity_available).toBe(0);
    });

    it("returns existing inventory record", () => {
      const inv1 = getOrCreateInventory(userId, inputId, "Warehouse A", "kg");
      const inv2 = getOrCreateInventory(userId, inputId, "Warehouse A", "kg");
      expect(inv1.id).toBe(inv2.id);
    });
  });

  describe("addInventoryMovement", () => {
    it("records receive movement and increases available quantity", () => {
      const inv = getOrCreateInventory(userId, inputId, "Warehouse A", "kg");
      addInventoryMovement({
        userId,
        inventoryId: inv.id,
        movementType: "receive",
        quantity: 500,
        unit: "kg",
        notes: "Initial stock",
      });
      const updated = getInventoryById(inv.id)!;
      expect(updated.quantity_available).toBe(500);
    });

    it("records consume movement and decreases available quantity", () => {
      const inv = getOrCreateInventory(userId, inputId, "Warehouse A", "kg");
      addInventoryMovement({ userId, inventoryId: inv.id, movementType: "receive", quantity: 500, unit: "kg" });
      addInventoryMovement({ userId, inventoryId: inv.id, movementType: "consume", quantity: 100, unit: "kg" });
      const updated = getInventoryById(inv.id)!;
      expect(updated.quantity_available).toBe(400);
    });

    it("records reserve movement", () => {
      const inv = getOrCreateInventory(userId, inputId, "Warehouse A", "kg");
      addInventoryMovement({ userId, inventoryId: inv.id, movementType: "receive", quantity: 500, unit: "kg" });
      addInventoryMovement({ userId, inventoryId: inv.id, movementType: "reserve", quantity: 200, unit: "kg" });
      const updated = getInventoryById(inv.id)!;
      expect(updated.quantity_reserved).toBe(200);
    });

    it("throws when inventory not found", () => {
      expect(() => addInventoryMovement({
        userId,
        inventoryId: 999,
        movementType: "receive",
        quantity: 100,
        unit: "kg",
      })).toThrow("Inventory record not found");
    });
  });

  describe("listInventoryMovements", () => {
    it("returns movements for an inventory record", () => {
      const inv = getOrCreateInventory(userId, inputId, "Warehouse A", "kg");
      addInventoryMovement({ userId, inventoryId: inv.id, movementType: "receive", quantity: 500, unit: "kg" });
      addInventoryMovement({ userId, inventoryId: inv.id, movementType: "consume", quantity: 100, unit: "kg" });
      expect(listInventoryMovements(inv.id)).toHaveLength(2);
    });
  });

  describe("stock ledger", () => {
    it("balance is traceable to movements", () => {
      const inv = getOrCreateInventory(userId, inputId, "Warehouse A", "kg");
      addInventoryMovement({ userId, inventoryId: inv.id, movementType: "receive", quantity: 1000, unit: "kg" });
      addInventoryMovement({ userId, inventoryId: inv.id, movementType: "receive", quantity: 500, unit: "kg" });
      addInventoryMovement({ userId, inventoryId: inv.id, movementType: "consume", quantity: 200, unit: "kg" });
      addInventoryMovement({ userId, inventoryId: inv.id, movementType: "consume", quantity: 300, unit: "kg" });
      const updated = getInventoryById(inv.id)!;
      expect(updated.quantity_available).toBe(1000); // 1500 - 500
      const movements = listInventoryMovements(inv.id);
      expect(movements).toHaveLength(4);
    });
  });
});
