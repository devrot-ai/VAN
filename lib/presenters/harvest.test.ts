import { describe, it, expect } from "vitest";
import { presentHarvestPage } from "./harvest";
import type { FieldRow, BookingRow, HarvestWithField } from "@/lib/db/types";

describe("presentHarvestPage", () => {
  const fields: FieldRow[] = [
    { id: 1, user_id: 1, name: "Field A", area_ha: 2, crop: "Rice", status: "growing", notes: null, created_at: "2025-01-01" },
    { id: 2, user_id: 1, name: "Field B", area_ha: 3, crop: "Wheat", status: "harvesting", notes: null, created_at: "2025-01-01" },
  ];
  const bookings: BookingRow[] = [
    { id: 1, user_id: 1, pair_id: 2, equipment_id: 1, title: "Truck", when_date: "2025-10-01", end_date: "2025-10-02", status: "confirmed", amount: 500, note: null, kind: "logistics", created_at: "2025-01-01" },
  ];
  const harvests: HarvestWithField[] = [
    { id: 1, user_id: 1, field_id: 1, crop: "Rice", quantity_tonnes: 5, date: "2025-10-15", quality: "good", status: "ready", created_at: "2025-01-01", field_name: "Field A" },
    { id: 2, user_id: 1, field_id: 2, crop: "Wheat", quantity_tonnes: 3, date: "2025-10-20", quality: null, status: "planned", created_at: "2025-01-01", field_name: "Field B" },
  ];

  it("computes total tonnes and ready for market", () => {
    const data = presentHarvestPage(fields, bookings, harvests);
    expect(data.stats.totalTonnes).toBe(8);
    expect(data.stats.readyForMarket).toBe(1); // count of ready harvests
  });

  it("returns crop fields with crops", () => {
    const data = presentHarvestPage(fields, bookings, harvests);
    expect(data.cropFields).toHaveLength(2);
  });

  it("returns logistics bookings", () => {
    const data = presentHarvestPage(fields, bookings, harvests);
    expect(data.logistics).toHaveLength(1);
  });

  it("returns harvest records", () => {
    const data = presentHarvestPage(fields, bookings, harvests);
    expect(data.harvests).toHaveLength(2);
  });

  it("handles empty data", () => {
    const data = presentHarvestPage([], [], []);
    expect(data.stats.totalTonnes).toBe(0);
    expect(data.stats.readyForMarket).toBe(0);
    expect(data.harvests).toHaveLength(0);
  });
});
