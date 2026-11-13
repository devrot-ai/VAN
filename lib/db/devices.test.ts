import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listDevices, createDevice, updateDevice, deleteDevice, getDeviceById } from "./devices";

describe("devices module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
  });

  afterAll(() => teardownTestDb());

  describe("listDevices", () => {
    it("returns empty array when no devices exist", () => {
      expect(listDevices(userId)).toEqual([]);
    });

    it("returns devices for the user", () => {
      createDevice({ userId, name: "Sensor 1", kind: "sensor", status: "online" });
      createDevice({ userId, name: "Weather", kind: "weather", status: "online" });
      expect(listDevices(userId)).toHaveLength(2);
    });
  });

  describe("createDevice", () => {
    it("creates a device", () => {
      const device = createDevice({
        userId,
        name: "Test Sensor",
        kind: "sensor",
        status: "online",
        location: "Field A",
      });
      expect(device.id).toBeGreaterThan(0);
      expect(device.name).toBe("Test Sensor");
      expect(device.kind).toBe("sensor");
      expect(device.status).toBe("online");
      expect(device.location).toBe("Field A");
    });

    it("creates with null location", () => {
      const device = createDevice({ userId, name: "No Loc", kind: "hub", status: "offline" });
      expect(device.location).toBeNull();
    });
  });

  describe("updateDevice", () => {
    it("updates status", () => {
      const created = createDevice({ userId, name: "Test", kind: "sensor", status: "online" });
      updateDevice(created.id, { status: "maintenance" }, userId);
      expect(getDeviceById(created.id)!.status).toBe("maintenance");
    });
  });

  describe("deleteDevice", () => {
    it("deletes a device", () => {
      const created = createDevice({ userId, name: "Test", kind: "sensor", status: "online" });
      deleteDevice(created.id, userId);
      expect(getDeviceById(created.id)).toBeUndefined();
    });
  });
});
