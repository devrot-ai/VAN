import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { createHarvestService, updateHarvestService, deleteHarvestService } from "./harvests";
import { getHarvestById } from "../db/harvests";
import { createField } from "../db/fields";

describe("harvests service", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;
  let fieldId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
    const field = createField({ userId, name: "Field 1", areaHa: 2, crop: "Rice", status: "growing", notes: null });
    fieldId = field.id;
  });

  afterEach(() => teardownTestDb());

  it("creates a harvest through the service", async () => {
    const row = await createHarvestService(userId, {
      crop: "Rice",
      quantityTonnes: 5.5,
      fieldId: fieldId,
      date: "2025-10-15",
      status: "ready",
    });
    expect(row.crop).toBe("Rice");
    expect(row.quantity_tonnes).toBe(5.5);
  });

  it("rejects invalid harvest data", async () => {
    await expect(
      createHarvestService(userId, { crop: "", quantityTonnes: 0, fieldId: fieldId, date: "2025-10-15", status: "ready" }),
    ).rejects.toThrow();
  });

  it("updates a harvest through the service", async () => {
    const created = await createHarvestService(userId, {
      crop: "Rice",
      quantityTonnes: 5,
      fieldId: fieldId,
      date: "2025-10-15",
      status: "ready",
    });
    const result = await updateHarvestService(userId, created.id, {
      crop: "Wheat",
      quantityTonnes: 5,
      fieldId: fieldId,
      date: "2025-10-15",
      status: "ready",
    });
    expect(result).toBe(true);
    expect(getHarvestById(created.id)!.crop).toBe("Wheat");
  });

  it("deletes a harvest through the service", async () => {
    const created = await createHarvestService(userId, {
      crop: "Rice",
      quantityTonnes: 3,
      fieldId: fieldId,
      date: "2025-10-15",
      status: "ready",
    });
    const result = await deleteHarvestService(userId, created.id);
    expect(result).toBe(true);
    expect(getHarvestById(created.id)).toBeUndefined();
  });
});
