import { describe, it, expect } from "vitest";
import { presentFarmPage } from "./farm";
import type { FieldRow, ActivityRow } from "@/lib/db/types";

describe("presentFarmPage", () => {
  const fields: FieldRow[] = [
    { id: 1, user_id: 1, name: "Field A", area_ha: 2, crop: "Rice", status: "planted", notes: null, created_at: "2025-01-01" },
    { id: 2, user_id: 1, name: "Field B", area_ha: 3, crop: "Wheat", status: "growing", notes: null, created_at: "2025-01-01" },
  ];
  const activities: ActivityRow[] = [
    { id: 1, user_id: 1, title: "Plant", due_date: "2025-06-01", category: "planting", done: 0, notes: null, created_at: "2025-01-01" },
    { id: 2, user_id: 1, title: "Harvest", due_date: "2025-10-01", category: "harvesting", done: 1, notes: null, created_at: "2025-01-01" },
  ];

  it("computes field and activity counts", () => {
    const data = presentFarmPage(fields, activities);
    expect(data.stats.fieldsCount).toBe(2);
    expect(data.stats.activitiesCount).toBe(2);
    expect(data.stats.totalAreaHa).toBe(5);
  });

  it("returns all fields", () => {
    const data = presentFarmPage(fields, activities);
    expect(data.fields).toHaveLength(2);
    expect(data.fields[0].name).toBe("Field A");
  });

  it("returns all activities with done flag", () => {
    const data = presentFarmPage(fields, activities);
    expect(data.activities).toHaveLength(2);
    expect(data.activities[0].done).toBe(0);
    expect(data.activities[1].done).toBe(1);
  });

  it("handles empty data", () => {
    const data = presentFarmPage([], []);
    expect(data.stats.fieldsCount).toBe(0);
    expect(data.fields).toHaveLength(0);
    expect(data.activities).toHaveLength(0);
  });
});
