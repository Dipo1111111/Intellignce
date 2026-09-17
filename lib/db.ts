import initSqlJs, { type Database } from "sql.js";
import { drizzle, type SQLJsDatabase } from "drizzle-orm/sql-js";
import * as schema from "@/lib/schema";

// Static, local-first database: SQLite compiled to WASM running entirely in
// the browser. Bytes persist to IndexedDB after every mutation, so the data
// survives reloads with no server and no account.

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  baseline_iq INTEGER,
  target_iq INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL,
  expected_iq_gain_min REAL NOT NULL,
  expected_iq_gain_max REAL NOT NULL,
  core_weekdays TEXT NOT NULL,
  rest_weekdays TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS plan_modules (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  name TEXT NOT NULL,
  target_ability TEXT NOT NULL,
  minutes_per_session INTEGER NOT NULL,
  sessions_per_week INTEGER NOT NULL,
  start_week INTEGER NOT NULL,
  end_week INTEGER NOT NULL,
  expected_iq_contribution_min REAL NOT NULL,
  expected_iq_contribution_max REAL NOT NULL,
  primary_url TEXT NOT NULL,
  backup_url TEXT,
  evidence_level TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS user_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  plan_id TEXT NOT NULL REFERENCES plans(id),
  start_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS dayplans (
  id TEXT PRIMARY KEY,
  user_plan_id TEXT NOT NULL REFERENCES user_plans(id),
  date TEXT NOT NULL,
  is_rest_day INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS dayplans_userplan_date ON dayplans (user_plan_id, date);
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  dayplan_id TEXT NOT NULL REFERENCES dayplans(id),
  plan_module_id TEXT NOT NULL REFERENCES plan_modules(id),
  scheduled_minutes INTEGER NOT NULL,
  url TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  actual_minutes INTEGER,
  notes TEXT,
  completed_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS tasks_dayplan_module ON tasks (dayplan_id, plan_module_id);
CREATE TABLE IF NOT EXISTS iq_test_scores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  test_date TEXT NOT NULL,
  score REAL NOT NULL,
  source TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
`;

const IDB_NAME = "intellgnce";
const IDB_STORE = "kv";
const IDB_KEY = "sqlite-bytes";

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(): Promise<Uint8Array | null> {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") return null;
  try {
    const db = await openIdb();
    const bytes = await new Promise<Uint8Array | null>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
      req.onsuccess = () => resolve((req.result as Uint8Array | undefined) ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return bytes;
  } catch {
    return null;
  }
}

async function idbSet(bytes: Uint8Array): Promise<void> {
  const db = await openIdb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(bytes, IDB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

let sqlite: Database | null = null;
let orm: SQLJsDatabase<typeof schema> | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let initPromise: Promise<SQLJsDatabase<typeof schema>> | null = null;

async function init(): Promise<SQLJsDatabase<typeof schema>> {
  const SQL = await initSqlJs({
    locateFile: (f: string) =>
      typeof window === "undefined" ? `./node_modules/sql.js/dist/${f}` : `/${f}`,
  });
  const bytes = await idbGet();
  sqlite = bytes && bytes.length > 0 ? new SQL.Database(bytes) : new SQL.Database();
  sqlite.exec(SCHEMA_SQL);
  orm = drizzle(sqlite, { schema });
  return orm;
}

export function getDb(): Promise<SQLJsDatabase<typeof schema>> {
  if (orm) return Promise.resolve(orm);
  if (!initPromise) initPromise = init();
  return initPromise;
}

/** Persist the in-memory database to IndexedDB (debounced). Call after mutations. */
export function persistDb(): void {
  if (typeof window === "undefined" || !sqlite) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const bytes = sqlite!.export();
      void idbSet(bytes);
    } catch {
      // Persistence is best-effort; the live session keeps working.
    }
  }, 150);
}

export default getDb;
