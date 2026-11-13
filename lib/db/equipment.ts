import { getDb, dbAll } from "./getDb";
import { EquipmentRow, EquipmentWithOwner } from "./types";
import { withAuditCreate, withAuditUpdate, withAuditDelete } from "@/lib/audit";

export function listEquipment(userId: number) {
  return getDb().prepare("SELECT * FROM equipment WHERE user_id = ? ORDER BY category, name").all(userId) as EquipmentRow[];
}

export function getEquipmentById(id: number): EquipmentRow | undefined {
  return getDb().prepare("SELECT * FROM equipment WHERE id = ?").get(id) as EquipmentRow | undefined;
}

export const createEquipment = withAuditCreate(
  "EQUIPMENT_CREATED",
  (input: {
    userId: number;
    name: string;
    category?: string | null;
    status?: string;
    dailyRate?: number | null;
    location?: string | null;
  }): EquipmentRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO equipment (user_id, name, category, status, daily_rate, location) VALUES (?,?,?,?,?,?)")
      .run(input.userId, input.name, input.category ?? null, input.status ?? "available", input.dailyRate ?? null, input.location ?? null);
    return getEquipmentById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ equipmentId: row.id }),
);

export const updateEquipment = withAuditUpdate(
  "EQUIPMENT_UPDATED",
  (id: number, input: {
    name?: string;
    category?: string | null;
    status?: string;
    dailyRate?: number | null;
    location?: string | null;
  }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (input.name !== undefined) { fields.push("name = ?"); values.push(input.name); }
    if (input.category !== undefined) { fields.push("category = ?"); values.push(input.category); }
    if (input.status !== undefined) { fields.push("status = ?"); values.push(input.status); }
    if (input.dailyRate !== undefined) { fields.push("daily_rate = ?"); values.push(input.dailyRate); }
    if (input.location !== undefined) { fields.push("location = ?"); values.push(input.location); }
    if (fields.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE equipment SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ equipmentId: id }),
);

export const deleteEquipment = withAuditDelete(
  "EQUIPMENT_DELETED",
  (id: number, _userId: number): void => {
    getDb().prepare("DELETE FROM equipment WHERE id = ?").run(id);
  },
  (id) => ({ equipmentId: id }),
);

/* ---------- Equipment marketplace (cross-portal) ---------- */

export function listProviderEquipment(filters: {
  category?: string;
  location?: string;
  available?: boolean;
}): EquipmentWithOwner[] {
  const db = getDb();
  const clauses = ["u.role = 'provider'"];
  const params: (string | number)[] = [];
  if (filters.category) {
    clauses.push("e.category = ?");
    params.push(filters.category);
  }
  if (filters.location) {
    clauses.push(
      "(lower(e.location) LIKE lower(?) OR lower(u.location) LIKE lower(?) OR lower(u.farm_name) LIKE lower(?))",
    );
    const like = `%${filters.location}%`;
    params.push(like, like, like);
  }
  if (filters.available) {
    clauses.push("e.status = 'available'");
  }
  const rows = db
    .prepare(
      `SELECT e.id, e.name, e.category, e.status, e.daily_rate, e.location,
              u.id AS owner_user_id, u.name AS owner_name, u.farm_name AS owner_farm, u.location AS owner_location
       FROM equipment e JOIN users u ON u.id = e.user_id
       WHERE ${clauses.join(" AND ")}
       ORDER BY e.status, u.farm_name, e.name`,
    )
    .all(...params) as unknown as EquipmentWithOwner[];
  return rows;
}

export function getProviderEquipment(id: number): EquipmentWithOwner | undefined {
  const rows = dbAll(
    `SELECT e.id, e.name, e.category, e.status, e.daily_rate, e.location,
            u.id AS owner_user_id, u.name AS owner_name, u.farm_name AS owner_farm, u.location AS owner_location
     FROM equipment e JOIN users u ON u.id = e.user_id
     WHERE e.id = ?`,
    [id],
  ) as unknown as EquipmentWithOwner[];
  return rows[0];
}
