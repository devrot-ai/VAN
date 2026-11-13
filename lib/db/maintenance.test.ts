import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listMaintenance, createMaintenance, updateMaintenance, deleteMaintenance } from "./maintenance";
import { createEquipment } from "./equipment";

describe("maintenance module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;
  let equipmentId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "provider", "Provider", "provider@example.com");
    const eq = createEquipment({ userId, name: "Tractor", status: "available" });
    equipmentId = eq.id;
  });

  afterAll(() => teardownTestDb());

  describe("listMaintenance", () => {
    it("returns empty array when no maintenance exists", () => {
      expect(listMaintenance(userId)).toEqual([]);
    });

    it("returns maintenance for the user", () => {
      createMaintenance({ userId, equipmentId, task: "Oil change", status: "scheduled" });
      expect(listMaintenance(userId)).toHaveLength(1);
    });
  });

  describe("createMaintenance", () => {
    it("creates a maintenance record", () => {
      const m = createMaintenance({
        userId,
        equipmentId,
        task: "Engine service",
        dueDate: "2025-06-01",
        status: "scheduled",
        notes: "Regular service",
      });
      expect(m.id).toBeGreaterThan(0);
      expect(m.task).toBe("Engine service");
      expect(m.status).toBe("scheduled");
    });
  });

  describe("updateMaintenance", () => {
    it("updates status", () => {
      const created = createMaintenance({ userId, equipmentId, task: "Test", status: "scheduled" });
      updateMaintenance(created.id, { status: "completed" }, userId);
      const updated = db.prepare("SELECT * FROM maintenance WHERE id = ?").get(created.id) as any;
      expect(updated.status).toBe("completed");
    });
  });

  describe("deleteMaintenance", () => {
    it("deletes a maintenance record", () => {
      const created = createMaintenance({ userId, equipmentId, task: "Test", status: "scheduled" });
      deleteMaintenance(created.id, userId);
      expect(listMaintenance(userId)).toHaveLength(0);
    });
  });
});
