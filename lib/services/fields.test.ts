import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { createFieldService, updateFieldService, deleteFieldService } from "./fields";
import { getFieldById } from "../db/fields";

describe("fields service", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
  });

  afterEach(() => teardownTestDb());

  it("creates a field through the service", async () => {
    const row = await createFieldService(userId, {
      name: "Service Field",
      areaHa: 3.0,
      status: "planted",
      crop: "Rice",
    });
    expect(row.name).toBe("Service Field");
    expect(row.area_ha).toBe(3.0);
  });

  it("rejects invalid field data", async () => {
    await expect(
      createFieldService(userId, { name: "", areaHa: 0, status: "planted" }),
    ).rejects.toThrow();
  });

  it("updates a field through the service", async () => {
    const created = await createFieldService(userId, {
      name: "Old",
      areaHa: 1,
      status: "planted",
    });
    const result = await updateFieldService(userId, created.id, {
      name: "New",
      areaHa: 1,
      status: "planted",
    });
    expect(result).toBe(true);
    expect(getFieldById(created.id)!.name).toBe("New");
  });

  it("deletes a field through the service", async () => {
    const created = await createFieldService(userId, {
      name: "To Delete",
      areaHa: 1,
      status: "planted",
    });
    const result = await deleteFieldService(userId, created.id);
    expect(result).toBe(true);
    expect(getFieldById(created.id)).toBeUndefined();
  });
});
