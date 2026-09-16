import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/schema";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "intellgnce.db");
fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export default db;