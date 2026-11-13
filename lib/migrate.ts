import { DatabaseSync } from "node:sqlite";

/**
 * Versioned migration system.
 *
 * Each migration has a unique version string (e.g. "001_initial"). The
 * `migrations` tracker table records which versions have already been applied.
 * `runMigrations()` checks the tracker and runs only the new migrations,
 * making the process idempotent and traceable.
 */

type Migration = {
  version: string;
  up(db: DatabaseSync): void;
};

/* ---------- Migration definitions ---------- */

const migrations: Migration[] = [
  {
    version: "001_initial",
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'farmer',
          farm_name TEXT,
          location TEXT,
          verified_at TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS early_access (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL,
          farm TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS contact_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT NOT NULL,
          body TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS fields (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          area_ha REAL NOT NULL,
          crop TEXT,
          status TEXT,
          notes TEXT
        );
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          due_date TEXT,
          category TEXT,
          done INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          kind TEXT NOT NULL,
          title TEXT NOT NULL,
          counterparty TEXT,
          when_date TEXT,
          end_date TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          amount REAL,
          note TEXT,
          pair_id TEXT,
          partner_user_id INTEGER
        );
        CREATE TABLE IF NOT EXISTS devices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          kind TEXT NOT NULL,
          status TEXT NOT NULL,
          location TEXT
        );
        CREATE TABLE IF NOT EXISTS equipment (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          category TEXT,
          status TEXT NOT NULL DEFAULT 'available',
          daily_rate REAL,
          location TEXT
        );
        CREATE TABLE IF NOT EXISTS members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          farm TEXT,
          status TEXT NOT NULL DEFAULT 'active',
          fields_count INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS purchases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          lot TEXT NOT NULL,
          buyer TEXT,
          quantity_tonnes REAL NOT NULL DEFAULT 0,
          amount REAL NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'enquiry'
        );
        CREATE TABLE IF NOT EXISTS auth_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL UNIQUE,
          kind TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          used_at TEXT
        );
      `);
    },
  },
  {
    version: "002_add_indexes",
    up(db) {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_fields_user_id ON fields(user_id);
        CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
        CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
        CREATE INDEX IF NOT EXISTS idx_bookings_pair_id ON bookings(pair_id);
        CREATE INDEX IF NOT EXISTS idx_bookings_kind ON bookings(kind);
        CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
        CREATE INDEX IF NOT EXISTS idx_equipment_user_id ON equipment(user_id);
        CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
        CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
        CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_kind ON auth_tokens(user_id, kind);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      `);
    },
  },
  {
    version: "003_transactions_and_maintenance",
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          description TEXT NOT NULL,
          amount REAL NOT NULL,
          type TEXT NOT NULL DEFAULT 'expense',
          category TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS maintenance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
          task TEXT NOT NULL,
          due_date TEXT,
          status TEXT NOT NULL DEFAULT 'scheduled',
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_maintenance_user_id ON maintenance(user_id);
        CREATE INDEX IF NOT EXISTS idx_maintenance_equipment_id ON maintenance(equipment_id);
      `);
    },
  },
  {
    version: "004_harvests_and_notifications",
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS harvests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
          crop TEXT NOT NULL,
          quantity_tonnes REAL NOT NULL,
          date TEXT NOT NULL,
          quality TEXT,
          status TEXT NOT NULL DEFAULT 'planned',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          message TEXT NOT NULL,
          read INTEGER NOT NULL DEFAULT 0,
          related_id INTEGER,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_harvests_user_id ON harvests(user_id);
        CREATE INDEX IF NOT EXISTS idx_harvests_field_id ON harvests(field_id);
        CREATE INDEX IF NOT EXISTS idx_harvests_status ON harvests(status);
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
      `);
    },
  },
];

/* ---------- Tracker table ---------- */

function ensureTrackerTable(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT UNIQUE NOT NULL,
      applied_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function appliedVersions(db: DatabaseSync): Set<string> {
  const rows = db
    .prepare("SELECT version FROM migrations")
    .all() as { version: string }[];
  return new Set(rows.map((r) => r.version));
}

function recordApplied(db: DatabaseSync, version: string) {
  db.prepare("INSERT OR IGNORE INTO migrations (version) VALUES (?)").run(version);
}

/* ---------- Public API ---------- */

/**
 * Run any migrations that have not yet been applied.
 * Idempotent: safe to call on every server start.
 */
export function runMigrations(db: DatabaseSync) {
  ensureTrackerTable(db);
  const applied = appliedVersions(db);
  for (const migration of migrations) {
    if (!applied.has(migration.version)) {
      migration.up(db);
      recordApplied(db, migration.version);
    }
  }
}
