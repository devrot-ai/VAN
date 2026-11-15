import { getDb } from "./getDb";
import { InventoryRow, InventoryMovementRow } from "./types";
import { withAuditCreate } from "@/lib/audit";

// --- Inventory ---

export function listInventory(userId: number) {
  return getDb().prepare(`SELECT * FROM inventory WHERE user_id = ? ORDER BY id`).all(userId) as InventoryRow[];
}

export function getInventoryById(id: number): InventoryRow | undefined {
  return getDb().prepare("SELECT * FROM inventory WHERE id = ?").get(id) as InventoryRow | undefined;
}

export function getOrCreateInventory(userId: number, inputId: number, location: string | null, unit: string): InventoryRow {
  const existing = getDb().prepare(
    "SELECT * FROM inventory WHERE user_id = ? AND input_id = ? AND (location = ? OR (location IS NULL AND ? IS NULL))"
  ).all(userId, inputId, location, location) as InventoryRow[];
  
  if (existing.length > 0) return existing[0];
  
  const db = getDb();
  const info = db
    .prepare("INSERT INTO inventory (user_id, input_id, location, quantity_available, quantity_reserved, unit) VALUES (?,?,?,?,?,?)")
    .run(userId, inputId, location ?? null, 0, 0, unit);
  return getInventoryById(Number(info.lastInsertRowid))!;
}

export const addInventoryMovement = withAuditCreate(
  "INVENTORY_MOVEMENT",
  (input: {
    userId: number;
    inventoryId: number;
    movementType: string;
    quantity: number;
    unit: string;
    referenceType?: string | null;
    referenceId?: number | null;
    notes?: string | null;
  }): InventoryMovementRow => {
    const db = getDb();
    const inventory = getInventoryById(input.inventoryId);
    if (!inventory) throw new Error("Inventory record not found");
    
    // Record the movement
    const info = db
      .prepare("INSERT INTO inventory_movements (user_id, inventory_id, movement_type, quantity, unit, reference_type, reference_id, notes) VALUES (?,?,?,?,?,?,?,?)")
      .run(input.userId, input.inventoryId, input.movementType, input.quantity, input.unit, input.referenceType ?? null, input.referenceId ?? null, input.notes ?? null);
    
    // Update inventory quantity
    if (input.movementType === "receive" || input.movementType === "adjustment_in") {
      db.prepare("UPDATE inventory SET quantity_available = quantity_available + ?, updated_at = datetime('now') WHERE id = ?")
        .run(input.quantity, input.inventoryId);
    } else if (input.movementType === "consume" || input.movementType === "adjustment_out") {
      db.prepare("UPDATE inventory SET quantity_available = quantity_available - ?, updated_at = datetime('now') WHERE id = ?")
        .run(input.quantity, input.inventoryId);
    } else if (input.movementType === "reserve") {
      db.prepare("UPDATE inventory SET quantity_reserved = quantity_reserved + ?, updated_at = datetime('now') WHERE id = ?")
        .run(input.quantity, input.inventoryId);
    } else if (input.movementType === "unreserve") {
      db.prepare("UPDATE inventory SET quantity_reserved = quantity_reserved - ?, updated_at = datetime('now') WHERE id = ?")
        .run(input.quantity, input.inventoryId);
    }
    
    return db.prepare("SELECT * FROM inventory_movements WHERE id = ?").get(Number(info.lastInsertRowid)) as InventoryMovementRow;
  },
  (input) => input.userId,
  (row) => ({ movementId: row.id }),
);

export function listInventoryMovements(inventoryId: number) {
  return getDb().prepare(`SELECT * FROM inventory_movements WHERE inventory_id = ? ORDER BY date DESC`).all(inventoryId) as InventoryMovementRow[];
}
