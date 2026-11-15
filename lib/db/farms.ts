import { getDb } from "./getDb";
import { FarmRow } from "./types";
import { withAuditCreate, withAuditUpdate, withAuditDelete } from "@/lib/audit";

export function listFarms(userId: number) {
  return getDb().prepare(`SELECT * FROM farms WHERE user_id = ? ORDER BY name`).all(userId) as FarmRow[];
}

export function getFarmById(id: number): FarmRow | undefined {
  return getDb().prepare("SELECT * FROM farms WHERE id = ?").get(id) as FarmRow | undefined;
}

export const createFarm = withAuditCreate(
  "FARM_CREATED",
  (input: {
    userId: number;
    name: string;
    address?: string | null;
    totalAreaHa?: number;
  }): FarmRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO farms (user_id, name, address, total_area_ha) VALUES (?,?,?,?)")
      .run(input.userId, input.name, input.address ?? null, input.totalAreaHa ?? 0);
    return getFarmById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ farmId: row.id }),
);

export const updateFarm = withAuditUpdate(
  "FARM_UPDATED",
  (id: number, input: {
    name?: string;
    address?: string | null;
    totalAreaHa?: number;
    status?: string;
  }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (input.name !== undefined) { fields.push("name = ?"); values.push(input.name); }
    if (input.address !== undefined) { fields.push("address = ?"); values.push(input.address); }
    if (input.totalAreaHa !== undefined) { fields.push("total_area_ha = ?"); values.push(input.totalAreaHa); }
    if (input.status !== undefined) { fields.push("status = ?"); values.push(input.status); }
    if (fields.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE farms SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ farmId: id }),
);

export const deleteFarm = withAuditDelete(
  "FARM_DELETED",
  (id: number, _userId: number): void => {
    getDb().prepare("DELETE FROM farms WHERE id = ?").run(id);
  },
  (id) => ({ farmId: id }),
);
