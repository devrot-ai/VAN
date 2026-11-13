/**
 * Maintenance page presenter (provider portal).
 */

import type { MaintenanceRow } from "@/lib/db/types";

export interface MaintenanceListItem {
  id: number;
  equipment_id: number;
  task: string;
  due_date: string | null;
  status: string;
  notes: string | null;
}

export interface MaintenancePageData {
  stats: {
    total: number;
    scheduled: number;
    inProgress: number;
    completed: number;
  };
  records: MaintenanceListItem[];
}

export function presentMaintenancePage(records: MaintenanceRow[]): MaintenancePageData {
  return {
    stats: {
      total: records.length,
      scheduled: records.filter((r) => r.status === "scheduled").length,
      inProgress: records.filter((r) => r.status === "in_progress").length,
      completed: records.filter((r) => r.status === "completed").length,
    },
    records: records.map((r) => ({
      id: r.id,
      equipment_id: r.equipment_id,
      task: r.task,
      due_date: r.due_date,
      status: r.status,
      notes: r.notes,
    })),
  };
}
