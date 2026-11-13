import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listEquipment, createEquipment, updateEquipment, deleteEquipment, getEquipmentById } from "./equipment";

describe("equipment module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "provider", "Provider", "provider@example.com");
  });

  afterAll(() => teardownTestDb());

  describe("listEquipment", () => {
    it("returns empty array when no equipment exists", () => {
      expect(listEquipment(userId)).toEqual([]);
    });

    it("returns equipment for the user", () => {
      createEquipment({ userId, name: "Tractor", category: "tractor", status: "available" });
      createEquipment({ userId, name: "Harvester", category: "harvester", status: "booked" });
      expect(listEquipment(userId)).toHaveLength(2);
    });
  });

  describe("createEquipment", () => {
    it("creates equipment", () => {
      const eq = createEquipment({
        userId,
        name: "Test Tractor",
        category: "tractor",
        status: "available",
        dailyRate: 5000,
        location: "Farm A",
      });
      expect(eq.id).toBeGreaterThan(0);
      expect(eq.name).toBe("Test Tractor");
      expect(eq.daily_rate).toBe(5000);
    });

    it("creates with null optional fields", () => {
      const eq = createEquipment({ userId, name: "Minimal", status: "available" });
      expect(eq.category).toBeNull();
      expect(eq.daily_rate).toBeNull();
    });
  });

  describe("updateEquipment", () => {
    it("updates status", () => {
      const created = createEquipment({ userId, name: "Test", status: "available" });
      updateEquipment(created.id, { status: "booked" }, userId);
      expect(getEquipmentById(created.id)!.status).toBe("booked");
    });
  });

  describe("deleteEquipment", () => {
    it("deletes equipment", () => {
      const created = createEquipment({ userId, name: "Test", status: "available" });
      deleteEquipment(created.id, userId);
      expect(getEquipmentById(created.id)).toBeUndefined();
    });
  });
});
