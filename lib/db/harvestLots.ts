import { getDb } from "./getDb";
import { HarvestLotRow } from "./types";
import { withAuditCreate, withAuditUpdate } from "@/lib/audit";

export function listHarvestLots(userId: number) {
  return getDb().prepare(`SELECT * FROM harvest_lots WHERE user_id = ? ORDER BY harvest_date DESC`).all(userId) as HarvestLotRow[];
}

export function listHarvestLotsByCropCycle(cropCycleId: number) {
  return getDb().prepare(`SELECT * FROM harvest_lots WHERE crop_cycle_id = ? ORDER BY harvest_date DESC`).all(cropCycleId) as HarvestLotRow[];
}

export function getHarvestLotById(id: number): HarvestLotRow | undefined {
  return getDb().prepare("SELECT * FROM harvest_lots WHERE id = ?").get(id) as HarvestLotRow | undefined;
}

export const createHarvestLot = withAuditCreate(
  "HARVEST_LOT_CREATED",
  (input: {
    userId: number;
    cropCycleId: number;
    fieldId: number;
    harvestId?: number | null;
    harvestDate: string;
    quantity: number;
    unit?: string;
    qualityGrade?: string | null;
    moistureContent?: number | null;
    location?: string | null;
  }): HarvestLotRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO harvest_lots (user_id, crop_cycle_id, field_id, harvest_id, harvest_date, quantity, unit, quality_grade, moisture_content, location) VALUES (?,?,?,?,?,?,?,?,?,?)")
      .run(input.userId, input.cropCycleId, input.fieldId, input.harvestId ?? null, input.harvestDate, input.quantity, input.unit ?? "tonnes", input.qualityGrade ?? null, input.moistureContent ?? null, input.location ?? null);
    return getHarvestLotById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ lotId: row.id }),
);

export const updateHarvestLotStatus = withAuditUpdate(
  "HARVEST_LOT_STATUS_UPDATED",
  (id: number, input: { status: string; location?: string | null }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = ["status = ?"];
    const values: (string | number | null)[] = [input.status];
    if (input.location !== undefined) { fields.push("location = ?"); values.push(input.location); }
    values.push(id);
    db.prepare(`UPDATE harvest_lots SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ lotId: id }),
);
