import { describe, it, expect } from "vitest";
import { presentEquipmentPage } from "./equipment";
import type { EquipmentRow } from "@/lib/db/types";

describe("presentEquipmentPage", () => {
  const equipment: EquipmentRow[] = [
    { id: 1, user_id: 1, name: "Tractor", category: "tractor", daily_rate: 500, location: null, status: "available", created_at: "2025-01-01" },
    { id: 2, user_id: 1, name: "Harvester", category: "harvester", daily_rate: 800, location: null, status: "booked", created_at: "2025-01-01" },
    { id: 3, user_id: 1, name: "Plow", category: "plow", daily_rate: 300, location: null, status: "maintenance", created_at: "2025-01-01" },
  ];

  it("computes equipment stats", () => {
    const data = presentEquipmentPage(equipment);
    expect(data.stats.total).toBe(3);
    expect(data.stats.available).toBe(1);
    expect(data.stats.booked).toBe(1);
    // No maintenance stat in presenter, only total/available/booked
  });

  it("returns all equipment", () => {
    const data = presentEquipmentPage(equipment);
    expect(data.equipment).toHaveLength(3);
  });

  it("handles empty data", () => {
    const data = presentEquipmentPage([]);
    expect(data.stats.total).toBe(0);
    expect(data.equipment).toHaveLength(0);
  });
});
