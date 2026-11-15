import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listCropCycles, listCropCyclesByField, getCropCycleById, createCropCycle, updateCropCycle, deleteCropCycle } from "./cropCycles";
import { createField } from "./fields";

describe("cropCycles module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;
  let fieldId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
    const field = createField({ userId, name: "North Field", areaHa: 5 });
    fieldId = field.id;
  });

  afterAll(() => teardownTestDb());

  describe("createCropCycle", () => {
    it("creates a crop cycle linked to a field", () => {
      const cycle = createCropCycle({
        userId,
        fieldId,
        cropType: "Wheat",
        variety: "HD-2967",
        season: "Rabi",
        plannedStartDate: "2025-10-01",
        plannedPlantingDate: "2025-10-15",
        plannedHarvestDate: "2026-03-15",
        notes: "Demo cycle",
      });
      expect(cycle.id).toBeGreaterThan(0);
      expect(cycle.user_id).toBe(userId);
      expect(cycle.field_id).toBe(fieldId);
      expect(cycle.crop_type).toBe("Wheat");
      expect(cycle.status).toBe("planned");
      expect(cycle.stage).toBe("planned");
    });

    it("creates with minimal required fields", () => {
      const cycle = createCropCycle({ userId, fieldId, cropType: "Rice" });
      expect(cycle.variety).toBeNull();
      expect(cycle.season).toBeNull();
    });
  });

  describe("listCropCycles", () => {
    it("returns empty when no cycles exist", () => {
      expect(listCropCycles(userId)).toEqual([]);
    });

    it("returns cycles for the user", () => {
      createCropCycle({ userId, fieldId, cropType: "Wheat" });
      createCropCycle({ userId, fieldId, cropType: "Rice" });
      expect(listCropCycles(userId)).toHaveLength(2);
    });
  });

  describe("listCropCyclesByField", () => {
    it("returns cycles for a specific field", () => {
      const field2 = createField({ userId, name: "South Field", areaHa: 3 });
      createCropCycle({ userId, fieldId, cropType: "Wheat" });
      createCropCycle({ userId, fieldId: field2.id, cropType: "Rice" });
      expect(listCropCyclesByField(fieldId)).toHaveLength(1);
      expect(listCropCyclesByField(field2.id)).toHaveLength(1);
    });
  });

  describe("updateCropCycle", () => {
    it("updates status and stage", () => {
      const cycle = createCropCycle({ userId, fieldId, cropType: "Wheat" });
      updateCropCycle(cycle.id, { status: "active", stage: "sowing" }, userId);
      const updated = getCropCycleById(cycle.id)!;
      expect(updated.status).toBe("active");
      expect(updated.stage).toBe("sowing");
    });

    it("updates actual dates", () => {
      const cycle = createCropCycle({ userId, fieldId, cropType: "Wheat" });
      updateCropCycle(cycle.id, {
        actualStartDate: "2025-10-05",
        actualPlantingDate: "2025-10-18",
        status: "active",
      }, userId);
      const updated = getCropCycleById(cycle.id)!;
      expect(updated.actual_start_date).toBe("2025-10-05");
    });
  });

  describe("deleteCropCycle", () => {
    it("deletes a crop cycle", () => {
      const cycle = createCropCycle({ userId, fieldId, cropType: "Wheat" });
      deleteCropCycle(cycle.id, userId);
      expect(getCropCycleById(cycle.id)).toBeUndefined();
    });
  });

  describe("multiple historical cycles", () => {
    it("supports multiple cycles for the same field", () => {
      createCropCycle({ userId, fieldId, cropType: "Wheat", season: "Rabi 2024" });
      createCropCycle({ userId, fieldId, cropType: "Mustard", season: "Rabi 2025" });
      createCropCycle({ userId, fieldId, cropType: "Rice", season: "Kharif 2025" });
      expect(listCropCyclesByField(fieldId)).toHaveLength(3);
    });
  });
});
