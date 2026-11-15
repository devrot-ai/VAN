import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listFarms, getFarmById, createFarm, updateFarm, deleteFarm } from "./farms";

describe("farms module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
  });

  afterAll(() => teardownTestDb());

  describe("listFarms", () => {
    it("returns empty array when no farms exist", () => {
      expect(listFarms(userId)).toEqual([]);
    });

    it("returns farms for the user", () => {
      createFarm({ userId, name: "Green Valley", totalAreaHa: 50 });
      createFarm({ userId, name: "Sunrise Farm", totalAreaHa: 30 });
      const farms = listFarms(userId);
      expect(farms).toHaveLength(2);
      expect(farms[0].name).toBe("Green Valley");
    });

    it("does not return farms for other users", () => {
      createFarm({ userId, name: "My Farm", totalAreaHa: 10 });
      const otherId = createTestUser(db, "farmer", "Other", "other@test.com");
      createFarm({ userId: otherId, name: "Other Farm", totalAreaHa: 20 });
      expect(listFarms(userId)).toHaveLength(1);
    });
  });

  describe("createFarm", () => {
    it("creates a farm and returns it with an id", () => {
      const farm = createFarm({
        userId,
        name: "Test Farm",
        address: "Village 42",
        totalAreaHa: 25,
      });
      expect(farm.id).toBeGreaterThan(0);
      expect(farm.user_id).toBe(userId);
      expect(farm.name).toBe("Test Farm");
      expect(farm.address).toBe("Village 42");
      expect(farm.total_area_ha).toBe(25);
      expect(farm.status).toBe("active");
    });

    it("creates a farm with default values", () => {
      const farm = createFarm({ userId, name: "Minimal" });
      expect(farm.address).toBeNull();
      expect(farm.total_area_ha).toBe(0);
      expect(farm.status).toBe("active");
    });
  });

  describe("getFarmById", () => {
    it("returns undefined for non-existent id", () => {
      expect(getFarmById(999)).toBeUndefined();
    });

    it("returns the farm by id", () => {
      const created = createFarm({ userId, name: "Lookup", totalAreaHa: 10 });
      const farm = getFarmById(created.id);
      expect(farm).toBeDefined();
      expect(farm!.name).toBe("Lookup");
    });
  });

  describe("updateFarm", () => {
    it("updates farm name", () => {
      const farm = createFarm({ userId, name: "Old", totalAreaHa: 10 });
      updateFarm(farm.id, { name: "New" }, userId);
      expect(getFarmById(farm.id)!.name).toBe("New");
    });

    it("updates multiple fields", () => {
      const farm = createFarm({ userId, name: "Old", totalAreaHa: 10 });
      updateFarm(farm.id, { name: "Updated", totalAreaHa: 20, status: "inactive" }, userId);
      const updated = getFarmById(farm.id)!;
      expect(updated.name).toBe("Updated");
      expect(updated.total_area_ha).toBe(20);
      expect(updated.status).toBe("inactive");
    });

    it("does nothing when no fields provided", () => {
      const farm = createFarm({ userId, name: "Unchanged", totalAreaHa: 10 });
      updateFarm(farm.id, {}, userId);
      expect(getFarmById(farm.id)!.name).toBe("Unchanged");
    });
  });

  describe("deleteFarm", () => {
    it("deletes a farm", () => {
      const farm = createFarm({ userId, name: "To Delete", totalAreaHa: 10 });
      deleteFarm(farm.id, userId);
      expect(getFarmById(farm.id)).toBeUndefined();
    });
  });
});
