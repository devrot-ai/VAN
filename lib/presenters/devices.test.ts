import { describe, it, expect } from "vitest";
import { presentDevicesPage } from "./devices";
import type { DeviceRow } from "@/lib/db/types";

describe("presentDevicesPage", () => {
  const devices: DeviceRow[] = [
    { id: 1, user_id: 1, name: "Sensor 1", kind: "soil", status: "online", location: null, last_reading: null, created_at: "2025-01-01" },
    { id: 2, user_id: 1, name: "Sensor 2", kind: "weather", status: "offline", location: null, last_reading: null, created_at: "2025-01-01" },
    { id: 3, user_id: 1, name: "Sensor 3", kind: "soil", status: "online", location: null, last_reading: null, created_at: "2025-01-01" },
  ];

  it("computes online and offline counts", () => {
    const data = presentDevicesPage(devices);
    expect(data.stats.totalDevices).toBe(3);
    expect(data.stats.online).toBe(2);
    expect(data.stats.offline).toBe(1);
  });

  it("returns all devices", () => {
    const data = presentDevicesPage(devices);
    expect(data.devices).toHaveLength(3);
  });

  it("handles empty data", () => {
    const data = presentDevicesPage([]);
    expect(data.stats.totalDevices).toBe(0);
    expect(data.devices).toHaveLength(0);
  });
});
