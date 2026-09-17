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

export const db = drizzle(sqlite, { schema });
export default db;