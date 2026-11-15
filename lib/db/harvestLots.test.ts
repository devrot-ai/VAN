import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listHarvestLots, listHarvestLotsByCropCycle, getHarvestLotById, createHarvestLot, updateHarvestLotStatus } from "./harvestLots";
import { createField } from "./fields";
import { createCropCycle } from "./cropCycles";

describe("harvestLots module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;
  let fieldId: number;
  let cropCycleId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
    const field = createField({ userId, name: "North Field", areaHa: 5 });
    fieldId = field.id;
    const cycle = createCropCycle({ userId, fieldId, cropType: "Wheat" });
    cropCycleId = cycle.id;
  });

  afterAll(() => teardownTestDb());

  describe("createHarvestLot", () => {
    it("creates a harvest lot", () => {
      const lot = createHarvestLot({
        userId,
        cropCycleId,
        fieldId,
        harvestDate: "2026-03-15",
        quantity: 12.5,
        unit: "tonnes",
        qualityGrade: "A",
        moistureContent: 12.5,
        location: "Field",
      });
      expect(lot.id).toBeGreaterThan(0);
      expect(lot.user_id).toBe(userId);
      expect(lot.crop_cycle_id).toBe(cropCycleId);
      expect(lot.field_id).toBe(fieldId);
      expect(lot.quantity).toBe(12.5);
      expect(lot.status).toBe("created");
    });

    it("defaults unit to tonnes", () => {
      const lot = createHarvestLot({
        userId,
        cropCycleId,
        fieldId,
        harvestDate: "2026-03-15",
        quantity: 10,
      });
      expect(lot.unit).toBe("tonnes");
    });
  });

  describe("updateHarvestLotStatus", () => {
    it("updates status through workflow", () => {
      const lot = createHarvestLot({
        userId,
        cropCycleId,
        fieldId,
        harvestDate: "2026-03-15",
        quantity: 10,
      });
      updateHarvestLotStatus(lot.id, { status: "weighed" }, userId);
      expect(getHarvestLotById(lot.id)!.status).toBe("weighed");
      updateHarvestLotStatus(lot.id, { status: "graded" }, userId);
      expect(getHarvestLotById(lot.id)!.status).toBe("graded");
      updateHarvestLotStatus(lot.id, { status: "available", location: "Warehouse" }, userId);
      const updated = getHarvestLotById(lot.id)!;
      expect(updated.status).toBe("available");
      expect(updated.location).toBe("Warehouse");
    });
  });

  describe("listHarvestLots", () => {
    it("returns lots for user", () => {
      createHarvestLot({ userId, cropCycleId, fieldId, harvestDate: "2026-03-15", quantity: 10 });
      createHarvestLot({ userId, cropCycleId, fieldId, harvestDate: "2026-03-16", quantity: 8 });
      expect(listHarvestLots(userId)).toHaveLength(2);
    });
  });

  describe("listHarvestLotsByCropCycle", () => {
    it("returns lots for a crop cycle", () => {
      createHarvestLot({ userId, cropCycleId, fieldId, harvestDate: "2026-03-15", quantity: 10 });
      expect(listHarvestLotsByCropCycle(cropCycleId)).toHaveLength(1);
    });
  });

  describe("multiple lots from one field", () => {
    it("supports multiple harvest lots from the same field", () => {
      createHarvestLot({ userId, cropCycleId, fieldId, harvestDate: "2026-03-15", quantity: 5 });
      createHarvestLot({ userId, cropCycleId, fieldId, harvestDate: "2026-03-16", quantity: 7 });
      createHarvestLot({ userId, cropCycleId, fieldId, harvestDate: "2026-03-17", quantity: 3 });
      expect(listHarvestLotsByCropCycle(cropCycleId)).toHaveLength(3);
    });
  });
});
