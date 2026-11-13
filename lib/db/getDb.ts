import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { runMigrations } from "@/lib/migrate";
import { seedDemo } from "@/lib/seeds";

const DATA_DIR = path.join(process.cwd(), "data");
mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "van.db");

let _db: DatabaseSync | null = null;

/**
 * Mutable reference that tests can override to inject an in-memory database.
 * When set, getDb() returns this instead of creating a file-based connection.
 */
let _testDb: DatabaseSync | null = null;

/**
 * Set the test database. Used by test helpers to inject an in-memory DB.
 */
export function setTestDb(db: DatabaseSync | null) {
  _testDb = db;
}

export function getDb(): DatabaseSync {
  // Tests can inject an in-memory DB via _testDb
  if (_testDb) return _testDb;

  if (!_db) {
    _db = new DatabaseSync(DB_PATH);
    _db.exec("PRAGMA journal_mode = WAL;");
    _db.exec("PRAGMA foreign_keys = ON;");
    _db.exec("PRAGMA busy_timeout = 5000;");
    runMigrations(_db);
    if (process.env.VAN_SEED_DEMO === "true") {
      seedDemo(_db);
    }
  }
  return _db;
}

// Close the SQLite handle when the process exits. This matters when running
// `next start` (a long-lived server process): leaving the DB open can hold
// file handles past shutdown and surface "database is closed" warnings.
process.once("exit", () => _db?.close());

export function dbAll(sql: string, params: (string | number)[] = []) {
  return getDb().prepare(sql).all(...params);
}
