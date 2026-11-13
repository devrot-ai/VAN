import { getDb } from "./getDb";
import { ActivityRow } from "./types";
import { withAuditCreate, withAuditUpdate, withAuditDelete } from "@/lib/audit";

export function listActivities(userId: number) {
  return getDb()
    .prepare("SELECT * FROM activities WHERE user_id = ? ORDER BY done, due_date")
    .all(userId) as ActivityRow[];
}

export function getActivityById(id: number): ActivityRow | undefined {
  return getDb().prepare("SELECT * FROM activities WHERE id = ?").get(id) as ActivityRow | undefined;
}

export const createActivity = withAuditCreate(
  "ACTIVITY_CREATED",
  (input: {
    userId: number;
    title: string;
    dueDate?: string | null;
    category?: string | null;
    done?: boolean;
  }): ActivityRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO activities (user_id, title, due_date, category, done) VALUES (?,?,?,?,?)")
      .run(input.userId, input.title, input.dueDate ?? null, input.category ?? null, input.done ? 1 : 0);
    return getActivityById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ activityId: row.id }),
);

export const updateActivity = withAuditUpdate(
  "ACTIVITY_UPDATED",
  (id: number, input: {
    title?: string;
    dueDate?: string | null;
    category?: string | null;
    done?: boolean;
  }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (input.title !== undefined) { fields.push("title = ?"); values.push(input.title); }
    if (input.dueDate !== undefined) { fields.push("due_date = ?"); values.push(input.dueDate); }
    if (input.category !== undefined) { fields.push("category = ?"); values.push(input.category); }
    if (input.done !== undefined) { fields.push("done = ?"); values.push(input.done ? 1 : 0); }
    if (fields.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE activities SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ activityId: id }),
);

export const deleteActivity = withAuditDelete(
  "ACTIVITY_DELETED",
  (id: number, _userId: number): void => {
    getDb().prepare("DELETE FROM activities WHERE id = ?").run(id);
  },
  (id) => ({ activityId: id }),
);
