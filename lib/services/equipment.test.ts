import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { createEquipmentService, updateEquipmentService, deleteEquipmentService } from "./equipment";
import { getEquipmentById } from "../db/equipment";

describe("equipment service", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "provider");
  });

  afterEach(() => teardownTestDb());

  it("creates equipment through the service", async () => {
    const row = await createEquipmentService(userId, {
      name: "Tractor",
      category: "tractor",
      status: "available",
    });
    expect(row.name).toBe("Tractor");
    expect(row.category).toBe("tractor");
  });

  it("rejects invalid equipment data", async () => {
    await expect(
      createEquipmentService(userId, { name: "", category: "tractor", status: "available" }),
    ).rejects.toThrow();
  });

  it("updates equipment through the service", async () => {
    const created = await createEquipmentService(userId, {
      name: "Old Tractor",
      category: "tractor",
      status: "available",
    });
    const result = await updateEquipmentService(userId, created.id, {
      name: "New Tractor",
      category: "tractor",
      status: "available",
    });
    expect(result).toBe(true);
    expect(getEquipmentById(created.id)!.name).toBe("New Tractor");
  });

  it("deletes equipment through the service", async () => {
    const created = await createEquipmentService(userId, {
      name: "To Delete",
      category: "tractor",
      status: "available",
    });
    const result = await deleteEquipmentService(userId, created.id);
    expect(result).toBe(true);
    expect(getEquipmentById(created.id)).toBeUndefined();
  });
});
