import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { createDeviceService, updateDeviceService, deleteDeviceService } from "./devices";
import { getDeviceById } from "../db/devices";

describe("devices service", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
  });

  afterEach(() => teardownTestDb());

  it("creates a device through the service", async () => {
    const row = await createDeviceService(userId, {
      name: "Soil Sensor",
      kind: "sensor",
      status: "online",
    });
    expect(row.name).toBe("Soil Sensor");
    expect(row.kind).toBe("sensor");
  });

  it("rejects invalid device data", async () => {
    await expect(
      createDeviceService(userId, { name: "", kind: "sensor", status: "online" }),
    ).rejects.toThrow();
  });

  it("updates a device through the service", async () => {
    const created = await createDeviceService(userId, {
      name: "Old Device",
      kind: "sensor",
      status: "online",
    });
    const result = await updateDeviceService(userId, created.id, {
      name: "New Device",
      kind: "sensor",
      status: "online",
    });
    expect(result).toBe(true);
    expect(getDeviceById(created.id)!.name).toBe("New Device");
  });

  it("deletes a device through the service", async () => {
    const created = await createDeviceService(userId, {
      name: "To Delete",
      kind: "sensor",
      status: "online",
    });
    const result = await deleteDeviceService(userId, created.id);
    expect(result).toBe(true);
    expect(getDeviceById(created.id)).toBeUndefined();
  });
});
