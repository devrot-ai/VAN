import { getDb } from "./getDb";
import { MemberRow } from "./types";
import { withAuditCreate, withAuditUpdate, withAuditDelete } from "@/lib/audit";

export function listMembers(userId: number) {
  return getDb().prepare("SELECT * FROM members WHERE user_id = ? ORDER BY name").all(userId) as MemberRow[];
}

export function getMemberById(id: number): MemberRow | undefined {
  return getDb().prepare("SELECT * FROM members WHERE id = ?").get(id) as MemberRow | undefined;
}

export const createMember = withAuditCreate(
  "MEMBER_CREATED",
  (input: {
    userId: number;
    name: string;
    farm?: string | null;
    status?: string;
    fieldsCount?: number;
  }): MemberRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO members (user_id, name, farm, status, fields_count) VALUES (?,?,?,?,?)")
      .run(input.userId, input.name, input.farm ?? null, input.status ?? "active", input.fieldsCount ?? 0);
    return getMemberById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ memberId: row.id }),
);

export const updateMember = withAuditUpdate(
  "MEMBER_UPDATED",
  (id: number, input: {
    name?: string;
    farm?: string | null;
    status?: string;
    fieldsCount?: number;
  }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (input.name !== undefined) { fields.push("name = ?"); values.push(input.name); }
    if (input.farm !== undefined) { fields.push("farm = ?"); values.push(input.farm); }
    if (input.status !== undefined) { fields.push("status = ?"); values.push(input.status); }
    if (input.fieldsCount !== undefined) { fields.push("fields_count = ?"); values.push(input.fieldsCount); }
    if (fields.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE members SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ memberId: id }),
);

export const deleteMember = withAuditDelete(
  "MEMBER_DELETED",
  (id: number, _userId: number): void => {
    getDb().prepare("DELETE FROM members WHERE id = ?").run(id);
  },
  (id) => ({ memberId: id }),
);
