import { getDb } from "./getDb";
import { MaintenanceRow } from "./types";
import { withAuditCreate, withAuditUpdate, withAuditDelete } from "@/lib/audit";

export function listMaintenance(userId: number): MaintenanceRow[] {
  return getDb()
    .prepare("SELECT * FROM maintenance WHERE user_id = ? ORDER BY due_date")
    .all(userId) as MaintenanceRow[];
}

export function getMaintenanceById(id: number): MaintenanceRow | undefined {
  return getDb().prepare("SELECT * FROM maintenance WHERE id = ?").get(id) as MaintenanceRow | undefined;
}

export const createMaintenance = withAuditCreate(
  "MAINTENANCE_CREATED",
  (input: {
    userId: number;
    equipmentId: number;
    task: string;
    dueDate?: string | null;
    status?: string;
    notes?: string | null;
  }): MaintenanceRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO maintenance (user_id, equipment_id, task, due_date, status, notes) VALUES (?,?,?,?,?,?)")
      .run(input.userId, input.equipmentId, input.task, input.dueDate ?? null, input.status ?? "scheduled", input.notes ?? null);
    return getMaintenanceById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ maintenanceId: row.id }),
);

export const updateMaintenance = withAuditUpdate(
  "MAINTENANCE_UPDATED",
  (id: number, input: {
    task?: string;
    dueDate?: string | null;
    status?: string;
    notes?: string | null;
  }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (input.task !== undefined) { fields.push("task = ?"); values.push(input.task); }
    if (input.dueDate !== undefined) { fields.push("due_date = ?"); values.push(input.dueDate); }
    if (input.status !== undefined) { fields.push("status = ?"); values.push(input.status); }
    if (input.notes !== undefined) { fields.push("notes = ?"); values.push(input.notes); }
    if (fields.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE maintenance SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ maintenanceId: id }),
);

export const deleteMaintenance = withAuditDelete(
  "MAINTENANCE_DELETED",
  (id: number, _userId: number): void => {
    getDb().prepare("DELETE FROM maintenance WHERE id = ?").run(id);
  },
  (id) => ({ maintenanceId: id }),
);
