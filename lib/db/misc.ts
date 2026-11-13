import { getDb } from "./getDb";
import { ProviderInfo, CooperativeBooking, HarvestAvailability } from "./types";

export function platformMetrics() {
  const db = getDb();
  const one = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  return {
    users: one("SELECT COUNT(*) AS n FROM users"),
    earlyAccess: one("SELECT COUNT(*) AS n FROM early_access"),
    fields: one("SELECT COUNT(*) AS n FROM fields"),
    bookings: one("SELECT COUNT(*) AS n FROM bookings"),
    devices: one("SELECT COUNT(*) AS n FROM devices"),
    members: one("SELECT COUNT(*) AS n FROM members"),
    engagements: one("SELECT COUNT(*) AS n FROM contact_messages"),
  };
}

export function addEarlyAccess(input: { name: string; email: string; role: string; farm?: string }) {
  const db = getDb();
  const dup = db
    .prepare("SELECT id FROM early_access WHERE lower(email) = lower(?)")
    .get(input.email);
  if (dup) return { duplicate: true };
  db.prepare("INSERT INTO early_access (name, email, role, farm) VALUES (?,?,?,?)").run(
    input.name,
    input.email.toLowerCase(),
    input.role,
    input.farm ?? null,
  );
  return { duplicate: false };
}

export function addContactMessage(input: { name: string; email: string; subject: string; body: string }) {
  getDb()
    .prepare("INSERT INTO contact_messages (name, email, subject, body) VALUES (?,?,?,?)")
    .run(input.name, input.email, input.subject, input.body);
}

/* ---------- Provider directory ---------- */

export function listProviders(): ProviderInfo[] {
  return getDb()
    .prepare(
      `SELECT u.id, u.name, u.location, u.farm_name,
              (SELECT COUNT(*) FROM equipment WHERE user_id = u.id) AS equipment_count
       FROM users u
       WHERE u.role = 'provider'
       ORDER BY u.name`,
    )
    .all() as ProviderInfo[];
}

/* ---------- Cooperative cross-member bookings ---------- */

export function listCooperativeBookings(coopUserId: number): CooperativeBooking[] {
  return getDb()
    .prepare(
      `SELECT b.id AS booking_id, m.name AS member_name, m.farm, b.title, b.when_date, b.status
       FROM members m
       JOIN users u ON u.id = m.user_id
       JOIN bookings b ON b.user_id = u.id
       WHERE m.user_id = ?
       ORDER BY b.when_date`,
    )
    .all(coopUserId) as CooperativeBooking[];
}

/* ---------- Harvest availability (from farmer fields) ---------- */

export function listHarvestAvailability(): HarvestAvailability[] {
  return getDb()
    .prepare(
      `SELECT f.id AS field_id, u.farm_name, u.location, f.crop, f.area_ha,
              ROUND(f.area_ha * 3.0, 0) AS estimated_tonnes,
              f.status
       FROM fields f
       JOIN users u ON u.id = f.user_id
       WHERE f.crop IS NOT NULL AND f.crop != ''
       ORDER BY f.status, u.farm_name`,
    )
    .all() as HarvestAvailability[];
}
