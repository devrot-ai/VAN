import { getDb } from "./getDb";
import { WorkOrderRow, OperatorRow } from "./types";
import { withAuditCreate, withAuditUpdate, withAuditDelete } from "@/lib/audit";

// --- Operators ---

export function listOperators(userId: number) {
  return getDb().prepare(`SELECT * FROM operators WHERE user_id = ? ORDER BY name`).all(userId) as OperatorRow[];
}

export function getOperatorById(id: number): OperatorRow | undefined {
  return getDb().prepare("SELECT * FROM operators WHERE id = ?").get(id) as OperatorRow | undefined;
}

export const createOperator = withAuditCreate(
  "OPERATOR_CREATED",
  (input: {
    userId: number;
    name: string;
    phone?: string | null;
    qualifications?: string | null;
    machineryPermissions?: string | null;
  }): OperatorRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO operators (user_id, name, phone, qualifications, machinery_permissions) VALUES (?,?,?,?,?)")
      .run(input.userId, input.name, input.phone ?? null, input.qualifications ?? null, input.machineryPermissions ?? null);
    return getOperatorById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ operatorId: row.id }),
);

// --- Work Orders ---

export function listWorkOrders(userId: number) {
  return getDb().prepare(`SELECT * FROM work_orders WHERE user_id = ? ORDER BY planned_start_date DESC`).all(userId) as WorkOrderRow[];
}

export function getWorkOrderById(id: number): WorkOrderRow | undefined {
  return getDb().prepare("SELECT * FROM work_orders WHERE id = ?").get(id) as WorkOrderRow | undefined;
}

export const createWorkOrder = withAuditCreate(
  "WORK_ORDER_CREATED",
  (input: {
    userId: number;
    farmId?: number | null;
    fieldId?: number | null;
    cropCycleId?: number | null;
    equipmentId?: number | null;
    operatorId?: number | null;
    activityType: string;
    description?: string | null;
    plannedStartDate?: string | null;
    plannedEndDate?: string | null;
    notes?: string | null;
  }): WorkOrderRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO work_orders (user_id, farm_id, field_id, crop_cycle_id, equipment_id, operator_id, activity_type, description, planned_start_date, planned_end_date, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
      .run(input.userId, input.farmId ?? null, input.fieldId ?? null, input.cropCycleId ?? null, input.equipmentId ?? null, input.operatorId ?? null, input.activityType, input.description ?? null, input.plannedStartDate ?? null, input.plannedEndDate ?? null, input.notes ?? null);
    return getWorkOrderById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ workOrderId: row.id }),
);

export const updateWorkOrder = withAuditUpdate(
  "WORK_ORDER_UPDATED",
  (id: number, input: {
    status?: string;
    actualStartDate?: string | null;
    actualEndDate?: string | null;
    cost?: number | null;
    notes?: string | null;
  }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (input.status !== undefined) { fields.push("status = ?"); values.push(input.status); }
    if (input.actualStartDate !== undefined) { fields.push("actual_start_date = ?"); values.push(input.actualStartDate); }
    if (input.actualEndDate !== undefined) { fields.push("actual_end_date = ?"); values.push(input.actualEndDate); }
    if (input.cost !== undefined) { fields.push("cost = ?"); values.push(input.cost); }
    if (input.notes !== undefined) { fields.push("notes = ?"); values.push(input.notes); }
    if (fields.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE work_orders SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ workOrderId: id }),
);

export const deleteWorkOrder = withAuditDelete(
  "WORK_ORDER_DELETED",
  (id: number, _userId: number): void => {
    getDb().prepare("DELETE FROM work_orders WHERE id = ?").run(id);
  },
  (id) => ({ workOrderId: id }),
);
