import { getDb } from "./getDb";
import { FacilityRow, ProcessingRecordRow, StorageLocationRow, StorageMovementRow } from "./types";
import { withAuditCreate, withAuditUpdate } from "@/lib/audit";

// --- Facilities ---

export function listFacilities(userId: number) {
  return getDb().prepare(`SELECT * FROM facilities WHERE user_id = ? AND status = 'active' ORDER BY name`).all(userId) as FacilityRow[];
}

export function getFacilityById(id: number): FacilityRow | undefined {
  return getDb().prepare("SELECT * FROM facilities WHERE id = ?").get(id) as FacilityRow | undefined;
}

export const createFacility = withAuditCreate(
  "FACILITY_CREATED",
  (input: {
    userId: number;
    name: string;
    facilityType: string;
    address?: string | null;
    capacity?: number | null;
    capacityUnit?: string | null;
  }): FacilityRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO facilities (user_id, name, facility_type, address, capacity, capacity_unit) VALUES (?,?,?,?,?,?)")
      .run(input.userId, input.name, input.facilityType, input.address ?? null, input.capacity ?? null, input.capacityUnit ?? null);
    return getFacilityById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ facilityId: row.id }),
);

// --- Processing Records ---

export function listProcessingRecords(userId: number) {
  return getDb().prepare(`SELECT * FROM processing_records WHERE user_id = ? ORDER BY processing_date DESC`).all(userId) as ProcessingRecordRow[];
}

export function getProcessingRecordById(id: number): ProcessingRecordRow | undefined {
  return getDb().prepare("SELECT * FROM processing_records WHERE id = ?").get(id) as ProcessingRecordRow | undefined;
}

export const createProcessingRecord = withAuditCreate(
  "PROCESSING_RECORD_CREATED",
  (input: {
    userId: number;
    facilityId?: number | null;
    inputLotId?: number | null;
    processType: string;
    inputQuantity: number;
    inputUnit: string;
    outputQuantity: number;
    outputUnit: string;
    lossQuantity?: number;
    grade?: string | null;
    operator?: string | null;
    notes?: string | null;
  }): ProcessingRecordRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO processing_records (user_id, facility_id, input_lot_id, process_type, input_quantity, input_unit, output_quantity, output_unit, loss_quantity, grade, operator, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(input.userId, input.facilityId ?? null, input.inputLotId ?? null, input.processType, input.inputQuantity, input.inputUnit, input.outputQuantity, input.outputUnit, input.lossQuantity ?? 0, input.grade ?? null, input.operator ?? null, input.notes ?? null);
    return getProcessingRecordById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ processingId: row.id }),
);

// --- Storage Locations ---

export function listStorageLocations(userId: number) {
  return getDb().prepare(`SELECT * FROM storage_locations WHERE user_id = ? ORDER BY name`).all(userId) as StorageLocationRow[];
}

export function getStorageLocationById(id: number): StorageLocationRow | undefined {
  return getDb().prepare("SELECT * FROM storage_locations WHERE id = ?").get(id) as StorageLocationRow | undefined;
}

export const createStorageLocation = withAuditCreate(
  "STORAGE_LOCATION_CREATED",
  (input: {
    userId: number;
    facilityId?: number | null;
    name: string;
    capacity?: number | null;
    capacityUnit?: string | null;
    commodityType?: string | null;
  }): StorageLocationRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO storage_locations (user_id, facility_id, name, capacity, capacity_unit, commodity_type) VALUES (?,?,?,?,?,?)")
      .run(input.userId, input.facilityId ?? null, input.name, input.capacity ?? null, input.capacityUnit ?? null, input.commodityType ?? null);
    return getStorageLocationById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ storageLocationId: row.id }),
);

// --- Storage Movements ---

export const addStorageMovement = withAuditCreate(
  "STORAGE_MOVEMENT",
  (input: {
    userId: number;
    storageLocationId: number;
    lotId?: number | null;
    movementType: string;
    quantity: number;
    unit: string;
    referenceType?: string | null;
    referenceId?: number | null;
    notes?: string | null;
  }): StorageMovementRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO storage_movements (user_id, storage_location_id, lot_id, movement_type, quantity, unit, reference_type, reference_id, notes) VALUES (?,?,?,?,?,?,?,?,?)")
      .run(input.userId, input.storageLocationId, input.lotId ?? null, input.movementType, input.quantity, input.unit, input.referenceType ?? null, input.referenceId ?? null, input.notes ?? null);
    return db.prepare("SELECT * FROM storage_movements WHERE id = ?").get(Number(info.lastInsertRowid)) as StorageMovementRow;
  },
  (input) => input.userId,
  (row) => ({ movementId: row.id }),
);

export function listStorageMovements(storageLocationId: number) {
  return getDb().prepare(`SELECT * FROM storage_movements WHERE storage_location_id = ? ORDER BY date DESC`).all(storageLocationId) as StorageMovementRow[];
}

export function getStorageLocationQuantity(storageLocationId: number): number {
  const rows = getDb().prepare(
    `SELECT COALESCE(SUM(CASE WHEN movement_type IN ('receive', 'transfer_in') THEN quantity ELSE 0 END), 0) as in_qty,
            COALESCE(SUM(CASE WHEN movement_type IN ('dispatch', 'transfer_out') THEN quantity ELSE 0 END), 0) as out_qty
     FROM storage_movements WHERE storage_location_id = ?`
  ).all(storageLocationId) as { in_qty: number; out_qty: number }[];
  if (rows.length === 0) return 0;
  return rows[0].in_qty - rows[0].out_qty;
}
