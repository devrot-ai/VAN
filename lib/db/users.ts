import { getDb } from "./getDb";
import { User, SafeUser, Role } from "./types";
import { hashPassword } from "@/lib/password";

export function toSafeUser(u: User): SafeUser {
  const { password_hash: _ph, ...safe } = u;
  return safe;
}

export function findUserByEmail(email: string): User | undefined {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE lower(email) = lower(?)").get(email) as User | undefined;
  return row;
}

export function getUserById(id: number): User | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
}

export function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  farmName?: string | null;
}): User {
  const db = getDb();
  const info = db
    .prepare("INSERT INTO users (name, email, password_hash, role, farm_name) VALUES (?,?,?,?,?)")
    .run(input.name, input.email.toLowerCase(), input.passwordHash, input.role, input.farmName ?? null);
  return getUserById(Number(info.lastInsertRowid))!;
}

export function listAllUsers(): SafeUser[] {
  const rows = getDb().prepare("SELECT * FROM users ORDER BY id").all() as User[];
  return rows.map(toSafeUser);
}

export function updateFarmProfile(
  userId: number,
  input: { farmName?: string | null; location?: string | null },
) {
  const db = getDb();
  db.prepare("UPDATE users SET farm_name = ?, location = ? WHERE id = ?").run(
    input.farmName?.trim() || null,
    input.location?.trim() || null,
    userId,
  );
}
