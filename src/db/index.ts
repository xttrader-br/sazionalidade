import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const globalForDb = globalThis as typeof globalThis & {
  __sqliteClient?: Database.Database;
  __drizzleDb?: ReturnType<typeof drizzle>;
};

export function getSqliteClient(): Database.Database {
  if (!globalForDb.__sqliteClient) {
    // Save sqlite.db in /tmp or local dir depending on environment
    const isVercel = process.env.VERCEL === "1" || process.env.NOW_BUILD === "1";
    const dbDir = isVercel ? "/tmp" : process.cwd();
    const dbPath = process.env.SQLITE_DB_PATH || path.join(dbDir, "sqlite.db");

    const sqlite = new Database(dbPath);
    try {
      sqlite.pragma("journal_mode = WAL");
    } catch {
      // memory fallback
    }

    // Auto-create tables if they don't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticker TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        sector TEXT,
        description TEXT,
        equityclock_url TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS monthly_seasonality (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
        month INTEGER NOT NULL,
        win_rate REAL NOT NULL,
        avg_return REAL NOT NULL,
        median_return REAL,
        max_gain REAL,
        max_loss REAL,
        sample_years INTEGER NOT NULL DEFAULT 20
      );

      CREATE TABLE IF NOT EXISTS seasonal_windows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        bias TEXT NOT NULL,
        start_month INTEGER NOT NULL,
        start_day INTEGER NOT NULL,
        end_month INTEGER NOT NULL,
        end_day INTEGER NOT NULL,
        win_rate REAL NOT NULL,
        avg_return REAL NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS asset_technicals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
        last_price REAL NOT NULL,
        day_change_pct REAL NOT NULL,
        rsi_14 REAL,
        above_sma50 INTEGER DEFAULT 1,
        above_sma200 INTEGER DEFAULT 1,
        confluence_score INTEGER DEFAULT 75,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS seasonal_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticker TEXT,
        title TEXT NOT NULL,
        snippet TEXT NOT NULL,
        bias TEXT NOT NULL,
        publish_date TEXT NOT NULL,
        source_url TEXT
      );
    `);

    globalForDb.__sqliteClient = sqlite;
  }
  return globalForDb.__sqliteClient;
}

export function getDb() {
  if (!globalForDb.__drizzleDb) {
    globalForDb.__drizzleDb = drizzle(getSqliteClient(), { schema });
  }
  return globalForDb.__drizzleDb;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const instance = getDb();
    const value = (instance as any)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
