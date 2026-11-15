import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listFacilities, getFacilityById, createFacility, listStorageLocations, createStorageLocation, addStorageMovement, listStorageMovements, getStorageLocationQuantity } from "./storage";

describe("storage module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
  });

  afterAll(() => teardownTestDb());

  describe("createFacility", () => {
    it("creates a facility", () => {
      const facility = createFacility({
        userId,
        name: "Main Warehouse",
        facilityType: "warehouse",
        address: "Village 42",
        capacity: 500,
        capacityUnit: "tonnes",
      });
      expect(facility.id).toBeGreaterThan(0);
      expect(facility.user_id).toBe(userId);
      expect(facility.facility_type).toBe("warehouse");
      expect(facility.status).toBe("active");
    });
  });

  describe("createStorageLocation", () => {
    it("creates a storage location", () => {
      const facility = createFacility({ userId, name: "Warehouse", facilityType: "warehouse" });
      const loc = createStorageLocation({
        userId,
        facilityId: facility.id,
        name: "Bin A",
        capacity: 100,
        capacityUnit: "tonnes",
        commodityType: "wheat",
      });
      expect(loc.id).toBeGreaterThan(0);
      expect(loc.facility_id).toBe(facility.id);
      expect(loc.status).toBe("available");
    });
  });

  describe("addStorageMovement", () => {
    it("records receive movement", () => {
      const facility = createFacility({ userId, name: "Warehouse", facilityType: "warehouse" });
      const loc = createStorageLocation({ userId, facilityId: facility.id, name: "Bin A" });
      addStorageMovement({
        userId,
        storageLocationId: loc.id,
        movementType: "receive",
        quantity: 50,
        unit: "tonnes",
        notes: "From harvest",
      });
      expect(listStorageMovements(loc.id)).toHaveLength(1);
    });
  });

  describe("getStorageLocationQuantity", () => {
    it("calculates quantity from movements", () => {
      const facility = createFacility({ userId, name: "Warehouse", facilityType: "warehouse" });
      const loc = createStorageLocation({ userId, facilityId: facility.id, name: "Bin A" });
      addStorageMovement({ userId, storageLocationId: loc.id, movementType: "receive", quantity: 100, unit: "tonnes" });
      addStorageMovement({ userId, storageLocationId: loc.id, movementType: "receive", quantity: 50, unit: "tonnes" });
      addStorageMovement({ userId, storageLocationId: loc.id, movementType: "dispatch", quantity: 30, unit: "tonnes" });
      expect(getStorageLocationQuantity(loc.id)).toBe(120); // 150 - 30
    });

    it("returns 0 for empty location", () => {
      const facility = createFacility({ userId, name: "Warehouse", facilityType: "warehouse" });
      const loc = createStorageLocation({ userId, facilityId: facility.id, name: "Bin B" });
      expect(getStorageLocationQuantity(loc.id)).toBe(0);
    });
  });

  describe("partial withdrawals", () => {
    it("tracks partial dispatches", () => {
      const facility = createFacility({ userId, name: "Warehouse", facilityType: "warehouse" });
      const loc = createStorageLocation({ userId, facilityId: facility.id, name: "Bin A" });
      addStorageMovement({ userId, storageLocationId: loc.id, movementType: "receive", quantity: 100, unit: "tonnes" });
      addStorageMovement({ userId, storageLocationId: loc.id, movementType: "dispatch", quantity: 40, unit: "tonnes" });
      addStorageMovement({ userId, storageLocationId: loc.id, movementType: "dispatch", quantity: 30, unit: "tonnes" });
      expect(getStorageLocationQuantity(loc.id)).toBe(30);
    });
  });
});
