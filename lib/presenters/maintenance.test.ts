import { describe, it, expect } from "vitest";
import { presentMaintenancePage } from "./maintenance";
import type { MaintenanceRow } from "@/lib/db/types";

describe("presentMaintenancePage", () => {
  const maintenance: MaintenanceRow[] = [
    { id: 1, user_id: 1, equipment_id: 1, task: "Oil change", due_date: "2025-06-01", status: "scheduled", notes: null, created_at: "2025-01-01" },
    { id: 2, user_id: 1, equipment_id: 1, task: "Tire rotation", due_date: "2025-07-01", status: "in_progress", notes: null, created_at: "2025-01-01" },
    { id: 3, user_id: 1, equipment_id: 2, task: "Filter replace", due_date: "2025-05-01", status: "completed", notes: null, created_at: "2025-01-01" },
  ];

  it("computes status breakdown", () => {
    const data = presentMaintenancePage(maintenance);
    expect(data.stats.scheduled).toBe(1);
    expect(data.stats.inProgress).toBe(1);
    expect(data.stats.completed).toBe(1);
  });

  it("returns all maintenance records", () => {
    const data = presentMaintenancePage(maintenance);
    expect(data.records).toHaveLength(3);
  });

  it("handles empty data", () => {
    const data = presentMaintenancePage([]);
    expect(data.stats.scheduled).toBe(0);
    expect(data.records).toHaveLength(0);
  });
});
