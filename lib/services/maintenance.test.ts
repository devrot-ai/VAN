import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { createMaintenanceService, updateMaintenanceService, deleteMaintenanceService } from "./maintenance";
import { getMaintenanceById } from "../db/maintenance";
import { createEquipment } from "../db/equipment";

describe("maintenance service", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;
  let equipmentId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "provider");
    const eq = createEquipment({ userId, name: "Tractor", category: "tractor", dailyRate: 500, location: null, status: "available" });
    equipmentId = eq.id;
  });

  afterEach(() => teardownTestDb());

  it("creates a maintenance record through the service", async () => {
    const row = await createMaintenanceService(userId, {
      task: "Oil change",
      equipmentId: equipmentId,
      dueDate: "2025-06-01",
      status: "scheduled",
    });
    expect(row.task).toBe("Oil change");
    expect(row.status).toBe("scheduled");
  });

  it("rejects invalid maintenance data", async () => {
    await expect(
      createMaintenanceService(userId, { task: "", equipmentId: equipmentId, status: "scheduled" }),
    ).rejects.toThrow();
  });

  it("updates a maintenance record through the service", async () => {
    const created = await createMaintenanceService(userId, {
      task: "Old task",
      equipmentId: equipmentId,
      status: "scheduled",
    });
    const result = await updateMaintenanceService(userId, created.id, {
      task: "New task",
      equipmentId: equipmentId,
      status: "scheduled",
    });
    expect(result).toBe(true);
    expect(getMaintenanceById(created.id)!.task).toBe("New task");
  });

  it("deletes a maintenance record through the service", async () => {
    const created = await createMaintenanceService(userId, {
      task: "To delete",
      equipmentId: equipmentId,
      status: "scheduled",
    });
    const result = await deleteMaintenanceService(userId, created.id);
    expect(result).toBe(true);
    expect(getMaintenanceById(created.id)).toBeUndefined();
  });
});
