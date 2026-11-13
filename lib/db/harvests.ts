import { getDb } from "./getDb";
import { HarvestRow, HarvestWithField, HarvestAvailabilityRow } from "./types";
import { withAuditCreate, withAuditUpdate, withAuditDelete } from "@/lib/audit";

export function listHarvests(userId: number): HarvestWithField[] {
  return getDb()
    .prepare(
      `SELECT h.*, f.name AS field_name
       FROM harvests h
       LEFT JOIN fields f ON f.id = h.field_id
       WHERE h.user_id = ?
       ORDER BY h.date DESC`,
    )
    .all(userId) as HarvestWithField[];
}

export function getHarvestById(id: number): HarvestRow | undefined {
  return getDb().prepare("SELECT * FROM harvests WHERE id = ?").get(id) as HarvestRow | undefined;
}

export const createHarvest = withAuditCreate(
  "HARVEST_CREATED",
  (input: {
    userId: number;
    fieldId: number;
    crop: string;
    quantityTonnes: number;
    date: string;
    quality?: string | null;
    status?: string;
  }): HarvestRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO harvests (user_id, field_id, crop, quantity_tonnes, date, quality, status) VALUES (?,?,?,?,?,?,?)")
      .run(input.userId, input.fieldId, input.crop, input.quantityTonnes, input.date, input.quality ?? null, input.status ?? "planned");
    return getHarvestById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ harvestId: row.id }),
);

export const updateHarvest = withAuditUpdate(
  "HARVEST_UPDATED",
  (id: number, input: {
    crop?: string;
    quantityTonnes?: number;
    date?: string;
    quality?: string | null;
    status?: string;
  }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (input.crop !== undefined) { fields.push("crop = ?"); values.push(input.crop); }
    if (input.quantityTonnes !== undefined) { fields.push("quantity_tonnes = ?"); values.push(input.quantityTonnes); }
    if (input.date !== undefined) { fields.push("date = ?"); values.push(input.date); }
    if (input.quality !== undefined) { fields.push("quality = ?"); values.push(input.quality); }
    if (input.status !== undefined) { fields.push("status = ?"); values.push(input.status); }
    if (fields.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE harvests SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ harvestId: id }),
);

export const deleteHarvest = withAuditDelete(
  "HARVEST_DELETED",
  (id: number, _userId: number): void => {
    getDb().prepare("DELETE FROM harvests WHERE id = ?").run(id);
  },
  (id) => ({ harvestId: id }),
);

/* ---------- Harvest availability for buyers (from harvests table) ---------- */

export function listHarvestAvailabilityRows(): HarvestAvailabilityRow[] {
  return getDb()
    .prepare(
      `SELECT h.id AS harvest_id, u.name AS farmer_name, u.farm_name,
              h.crop, h.quantity_tonnes, h.date, h.quality, h.status
       FROM harvests h
       JOIN users u ON u.id = h.user_id
       WHERE h.status IN ('ready', 'available')
       ORDER BY h.date`,
    )
    .all() as HarvestAvailabilityRow[];
}
