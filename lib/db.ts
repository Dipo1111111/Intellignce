import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/schema";
import path from "path";
import fs from "fs";

// Vercel serverless functions have a read-only filesystem except /tmp.
// Local dev keeps using ./data so the database persists on disk.
const dbDir = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "intellgnce.db");
fs.mkdirSync(dbDir, { recursive: true });
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Self-contained schema: fresh databases (e.g. Vercel /tmp) get their
// tables on first boot. IF NOT EXISTS keeps this safe on existing DBs.
sqlite.exec(`
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
`);

export const db = drizzle(sqlite, { schema });
export default db;