import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listHarvests, createHarvest, updateHarvest, deleteHarvest } from "./harvests";
import { createField } from "./fields";

describe("harvests module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;
  let fieldId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
    const field = createField({ userId, name: "North Field", areaHa: 2.5 });
    fieldId = field.id;
  });

  afterAll(() => teardownTestDb());

  describe("listHarvests", () => {
    it("returns empty array when no harvests exist", () => {
      expect(listHarvests(userId)).toEqual([]);
    });

    it("returns harvests for the user", () => {
      createHarvest({ userId, fieldId, crop: "Wheat", quantityTonnes: 5, date: "2025-06-01", status: "ready" });
      expect(listHarvests(userId)).toHaveLength(1);
    });
  });

  describe("createHarvest", () => {
    it("creates a harvest record", () => {
      const h = createHarvest({
        userId,
        fieldId,
        crop: "Rice",
        quantityTonnes: 10,
        date: "2025-07-15",
        quality: "premium",
        status: "planned",
      });
      expect(h.id).toBeGreaterThan(0);
      expect(h.crop).toBe("Rice");
      expect(h.quantity_tonnes).toBe(10);
      expect(h.status).toBe("planned");
    });
  });

  describe("updateHarvest", () => {
    it("updates status", () => {
      const created = createHarvest({ userId, fieldId, crop: "Wheat", quantityTonnes: 5, date: "2025-06-01", status: "planned" });
      updateHarvest(created.id, { status: "ready" }, userId);
      const updated = db.prepare("SELECT * FROM harvests WHERE id = ?").get(created.id) as any;
      expect(updated.status).toBe("ready");
    });
  });

  describe("deleteHarvest", () => {
    it("deletes a harvest", () => {
      const created = createHarvest({ userId, fieldId, crop: "Wheat", quantityTonnes: 5, date: "2025-06-01" });
      deleteHarvest(created.id, userId);
      expect(listHarvests(userId)).toHaveLength(0);
    });
  });
});
