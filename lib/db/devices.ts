import { getDb } from "./getDb";
import { DeviceRow } from "./types";
import { withAuditCreate, withAuditUpdate, withAuditDelete } from "@/lib/audit";

export function listDevices(userId: number) {
  return getDb().prepare("SELECT * FROM devices WHERE user_id = ?").all(userId) as DeviceRow[];
}

export function getDeviceById(id: number): DeviceRow | undefined {
  return getDb().prepare("SELECT * FROM devices WHERE id = ?").get(id) as DeviceRow | undefined;
}

export const createDevice = withAuditCreate(
  "DEVICE_CREATED",
  (input: {
    userId: number;
    name: string;
    kind: string;
    status: string;
    location?: string | null;
  }): DeviceRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO devices (user_id, name, kind, status, location) VALUES (?,?,?,?,?)")
      .run(input.userId, input.name, input.kind, input.status, input.location ?? null);
    return getDeviceById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ deviceId: row.id }),
);

export const updateDevice = withAuditUpdate(
  "DEVICE_UPDATED",
  (id: number, input: {
    name?: string;
    kind?: string;
    status?: string;
    location?: string | null;
  }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (input.name !== undefined) { fields.push("name = ?"); values.push(input.name); }
    if (input.kind !== undefined) { fields.push("kind = ?"); values.push(input.kind); }
    if (input.status !== undefined) { fields.push("status = ?"); values.push(input.status); }
    if (input.location !== undefined) { fields.push("location = ?"); values.push(input.location); }
    if (fields.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE devices SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ deviceId: id }),
);

export const deleteDevice = withAuditDelete(
  "DEVICE_DELETED",
  (id: number, _userId: number): void => {
    getDb().prepare("DELETE FROM devices WHERE id = ?").run(id);
  },
  (id) => ({ deviceId: id }),
);
