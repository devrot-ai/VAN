import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";
import { hashPassword } from "@/lib/password";
import type { Role } from "@/lib/db";

/**
 * Seed data for demo accounts.
 *
 * Extracted from `lib/db.ts` so that seeding is a separate concern from
 * schema and queries. Call `seedDemo()` only when `VAN_SEED_DEMO=true`.
 */

const DEMO_EMAIL = "demo@van.farm";

function randomPairId(): string {
  return "req_" + randomBytes(16).toString("hex");
}

function insertUserIfMissing(
  db: DatabaseSync,
  name: string,
  email: string,
  role: Role,
  farmName: string | null,
): number | null {
  const exists = db.prepare("SELECT id FROM users WHERE lower(email) = lower(?)").get(email);
  if (exists) return null;
  return addUser(db, name, email, role, farmName);
}

function addUser(
  db: DatabaseSync,
  name: string,
  email: string,
  role: Role,
  farmName: string | null,
): number {
  const info = db
    .prepare("INSERT INTO users (name, email, password_hash, role, farm_name) VALUES (?,?,?,?,?)")
    .run(name, email, hashPassword("demo1234"), role, farmName);
  return Number(info.lastInsertRowid);
}

function seedDemoFarmer(db: DatabaseSync) {
  const userId = insertUserIfMissing(
    db,
    "Morgan Fields (demo)",
    DEMO_EMAIL,
    "farmer",
    "Morgan Fields Farm",
  );
  if (userId == null) return;

  const fields = [
    ["North Field", 42, "Winter wheat", "growing", "Loam, well drained"],
    ["Riverside", 28, "Maize", "growing", "Irrigated"],
    ["Hilltop", 19, "Barley", "planted", "Recently sown"],
    ["South Pasture", 34, "Pasture", "fallow", "Resting this season"],
  ];
  const insField = db.prepare(
    "INSERT INTO fields (user_id, name, area_ha, crop, status, notes) VALUES (?,?,?,?,?,?)",
  );
  for (const f of fields) insField.run(userId, ...f);

  const activities = [
    ["Irrigate Riverside", "2026-06-14", "Irrigation", 0],
    ["Spray Hilltop — post-emergence", "2026-06-18", "Crop care", 0],
    ["Soil sample North Field", "2026-06-22", "Intelligence", 0],
    ["Service tractor T-3", "2026-06-25", "Machinery", 0],
    ["Harvest plan review", "2026-07-02", "Harvest", 0],
  ];
  const insAct = db.prepare(
    "INSERT INTO activities (user_id, title, due_date, category, done) VALUES (?,?,?,?,?)",
  );
  for (const a of activities) insAct.run(userId, ...a);

  const bookings = [
    ["machinery", "Tractor hire — North Field ploughing", "River Valley Machinery", "2026-07-10", "confirmed", 480],
    ["service", "Agricultural consultant field walk", "A. Njoroge Consulting", "2026-06-20", "confirmed", 220],
    ["logistics", "Grain trailer — transport to depot", "Midland Haulage", "2026-08-05", "pending", 310],
  ];
  const insB = db.prepare(
    "INSERT INTO bookings (user_id, kind, title, counterparty, when_date, status, amount) VALUES (?,?,?,?,?,?,?)",
  );
  for (const b of bookings) insB.run(userId, ...b);

  const devices = [
    ["Weather station — North", "weather", "online", "North Field"],
    ["Soil moisture probe 3", "sensor", "online", "Riverside"],
    ["Gate hub — main", "hub", "online", "Main gate"],
    ["Pump controller — Riverside", "machine", "maintenance", "Riverside"],
  ];
  const insD = db.prepare(
    "INSERT INTO devices (user_id, name, kind, status, location) VALUES (?,?,?,?,?)",
  );
  for (const d of devices) insD.run(userId, ...d);
}

function seedDemoProvider(
  db: DatabaseSync,
  opts: { farmerUser?: number | null; farmerName?: string | null } = {},
) {
  const providerId =
    insertUserIfMissing(
      db,
      "Riverside Machinery (demo)",
      "provider@van.farm",
      "provider",
      "Riverside Machinery & Services",
    ) ??
    (db.prepare("SELECT id FROM users WHERE lower(email) = lower(?)").get("provider@van.farm") as
      | { id: number }
      | undefined)?.id;

  if (providerId != null) {
    const count = db.prepare("SELECT COUNT(*) AS n FROM equipment WHERE user_id = ?").get(
      providerId,
    ) as { n: number };
    if (count.n === 0) {
      const insEq = db.prepare(
        "INSERT INTO equipment (user_id, name, category, status, daily_rate, location) VALUES (?,?,?,?,?,?)",
      );
      const eq = [
        ["Tractor — 120 HP", "tractor", "available", 380, "Riverside depot"],
        ["Sprayer — 24m", "implements", "available", 190, "Riverside depot"],
        ["Grain trailer — 22 t", "trailer", "booked", 140, "North depot"],
        ["Muck spreader — 14 t", "implements", "available", 160, "Riverside depot"],
        ["Laser leveller", "implements", "available", 210, "North depot"],
        ["Harvester — 30t grain", "harvester", "available", 520, "Riverside depot"],
      ];
      for (const r of eq) insEq.run(providerId, ...r);
    }
    db.prepare("UPDATE users SET location = COALESCE(location, ?) WHERE id = ?").run(
      "Stratford-upon-Avon, United Kingdom",
      providerId,
    );
  }

  if (providerId == null) return;

  const farmerId =
    opts.farmerUser ??
    (db.prepare("SELECT id FROM users WHERE lower(email) = lower(?)").get(DEMO_EMAIL) as
      | { id: number }
      | undefined)?.id;
  if (farmerId == null) return;

  const pairExists = db
    .prepare("SELECT id FROM bookings WHERE pair_id IS NOT NULL LIMIT 1")
    .get();
  if (!pairExists && opts.farmerName) {
    const pair = randomPairId();
    const insB = db.prepare(
      "INSERT INTO bookings (user_id, kind, title, counterparty, when_date, end_date, status, amount, note, pair_id, partner_user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    );
    insB.run(
      farmerId,
      "machinery",
      "Sprayer — Hilltop, spray round 2",
      "Riverside Machinery & Services",
      "2026-06-28",
      "2026-06-29",
      "pending",
      190,
      "Herbicide application across 19 ha",
      pair,
      providerId,
    );
    insB.run(
      providerId,
      "request",
      "Sprayer — Hilltop, spray round 2",
      opts.farmerName,
      "2026-06-28",
      "2026-06-29",
      "pending",
      190,
      "Herbicide application across 19 ha",
      pair,
      farmerId,
    );
  }
}

function seedDemoCooperative(db: DatabaseSync) {
  const cid = insertUserIfMissing(
    db,
    "Valley Cooperative (demo)",
    "coop@van.farm",
    "cooperative",
    "Valley Farmers Cooperative",
  );
  if (cid == null) return;
  const insM = db.prepare(
    "INSERT INTO members (user_id, name, farm, status, fields_count) VALUES (?,?,?,?,?)",
  );
  insM.run(cid, "Morgan Fields", "Morgan Fields Farm", "active", 4);
  insM.run(cid, "Green Valley Farms", "Green Valley", "active", 6);
  insM.run(cid, "Ashbrook Estate", "Ashbrook", "active", 3);
  insM.run(cid, "Mills Family Farm", "Mills", "pending", 0);
}

function seedDemoBuyer(db: DatabaseSync) {
  const bid = insertUserIfMissing(
    db,
    "Northwind Grain (demo)",
    "buyer@van.farm",
    "buyer",
    "Northwind Grain Co.",
  );
  if (bid == null) return;
  const insP = db.prepare(
    "INSERT INTO purchases (user_id, lot, buyer, quantity_tonnes, amount, status) VALUES (?,?,?,?,?,?)",
  );
  insP.run(bid, "Winter wheat — lot 1", "Morgan Fields Farm", 120, 26400, "scheduled");
  insP.run(bid, "Barley — Hilltop", "Green Valley Farms", 64, 10880, "confirmed");
  insP.run(bid, "Maize — Riverside", "Ashbrook Estate", 0, 0, "enquiry");
}

function seedDemoOperations(db: DatabaseSync) {
  insertUserIfMissing(db, "VAN Operations (demo)", "ops@van.farm", "operations", null);
}

/**
 * Seed all demo accounts and sample data.
 * Call only when `process.env.VAN_SEED_DEMO === 'true'`.
 */
export function seedDemo(db: DatabaseSync) {
  seedDemoFarmer(db);
  seedDemoProvider(db, { farmerName: "Morgan Fields (demo)" });
  seedDemoCooperative(db);
  seedDemoBuyer(db);
  seedDemoOperations(db);
}
