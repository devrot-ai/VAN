import { getDb } from "./getDb";
import { FieldRow } from "./types";
import { withAuditCreate, withAuditUpdate, withAuditDelete } from "@/lib/audit";

export function listFields(userId: number) {
  return getDb().prepare(`SELECT * FROM fields WHERE user_id = ? ORDER BY name`).all(userId) as FieldRow[];
}

export function getFieldById(id: number): FieldRow | undefined {
  return getDb().prepare("SELECT * FROM fields WHERE id = ?").get(id) as FieldRow | undefined;
}

export const createField = withAuditCreate(
  "FIELD_CREATED",
  (input: {
    userId: number;
    name: string;
    areaHa: number;
    crop?: string | null;
    status?: string | null;
    notes?: string | null;
  }): FieldRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO fields (user_id, name, area_ha, crop, status, notes) VALUES (?,?,?,?,?,?)")
      .run(input.userId, input.name, input.areaHa, input.crop ?? null, input.status ?? null, input.notes ?? null);
    return getFieldById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ fieldId: row.id }),
);

export const updateField = withAuditUpdate(
  "FIELD_UPDATED",
  (id: number, input: {
    name?: string;
    areaHa?: number;
    crop?: string | null;
    status?: string | null;
    notes?: string | null;
  }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (input.name !== undefined) { fields.push("name = ?"); values.push(input.name); }
    if (input.areaHa !== undefined) { fields.push("area_ha = ?"); values.push(input.areaHa); }
    if (input.crop !== undefined) { fields.push("crop = ?"); values.push(input.crop); }
    if (input.status !== undefined) { fields.push("status = ?"); values.push(input.status); }
    if (input.notes !== undefined) { fields.push("notes = ?"); values.push(input.notes); }
    if (fields.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE fields SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ fieldId: id }),
);

export const deleteField = withAuditDelete(
  "FIELD_DELETED",
  (id: number, _userId: number): void => {
    getDb().prepare("DELETE FROM fields WHERE id = ?").run(id);
  },
  (id) => ({ fieldId: id }),
);
