import { describe, it, expect } from "vitest";
import { presentFarmerDashboard } from "./farmerDashboard";
import type { FieldRow, ActivityRow, BookingRow, DeviceRow } from "@/lib/db/types";

describe("presentFarmerDashboard", () => {
  const fields: FieldRow[] = [
    { id: 1, user_id: 1, name: "Field A", area_ha: 2, crop: "Rice", status: "planted", notes: null, created_at: "2025-01-01" },
    { id: 2, user_id: 1, name: "Field B", area_ha: 3, crop: "Wheat", status: "growing", notes: null, created_at: "2025-01-01" },
  ];
  const activities: ActivityRow[] = [
    { id: 1, user_id: 1, title: "Plant", due_date: "2025-06-01", category: "planting", done: 0, notes: null, created_at: "2025-01-01" },
    { id: 2, user_id: 1, title: "Harvest", due_date: "2025-10-01", category: "harvesting", done: 1, notes: null, created_at: "2025-01-01" },
  ];
  const bookings: BookingRow[] = [
    { id: 1, user_id: 1, pair_id: 2, equipment_id: 1, title: "Tractor", when_date: "2025-06-01", end_date: "2025-06-03", status: "confirmed", amount: 1000, note: null, kind: "request", created_at: "2025-01-01" },
  ];
  const devices: DeviceRow[] = [
    { id: 1, user_id: 1, name: "Sensor 1", kind: "soil", status: "online", location: null, last_reading: null, created_at: "2025-01-01" },
    { id: 2, user_id: 1, name: "Sensor 2", kind: "weather", status: "offline", location: null, last_reading: null, created_at: "2025-01-01" },
  ];

  it("computes correct stats", () => {
    const data = presentFarmerDashboard(fields, activities, bookings, devices);
    expect(data.stats.fieldsCount).toBe(2);
    expect(data.stats.areaHa).toBe(5);
    expect(data.stats.activeBookings).toBe(0); // kind=request filtered out
    expect(data.stats.devicesOnline).toBe("1/2");
  });

  it("returns open activities only", () => {
    const data = presentFarmerDashboard(fields, activities, bookings, devices);
    expect(data.openActivities.length).toBe(1);
    expect(data.openActivities[0].title).toBe("Plant");
  });

  it("computes field status analytics", () => {
    const data = presentFarmerDashboard(fields, activities, bookings, devices);
    expect(data.fieldAnalytics).toHaveLength(2);
    expect(data.fieldAnalytics.find((a) => a.label === "planted")?.value).toBe(1);
    expect(data.fieldAnalytics.find((a) => a.label === "growing")?.value).toBe(1);
  });

  it("computes activity category analytics", () => {
    const data = presentFarmerDashboard(fields, activities, bookings, devices);
    expect(data.activityAnalytics).toHaveLength(2);
    expect(data.activityAnalytics.find((a) => a.label === "planting")?.value).toBe(1);
    expect(data.activityAnalytics.find((a) => a.label === "harvesting")?.value).toBe(1);
  });

  it("handles empty data", () => {
    const data = presentFarmerDashboard([], [], [], []);
    expect(data.stats.fieldsCount).toBe(0);
    expect(data.stats.areaHa).toBe(0);
    expect(data.openActivities).toHaveLength(0);
    expect(data.fieldAnalytics).toHaveLength(0);
  });
});
