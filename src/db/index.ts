import { drizzle } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client";
import * as schema from "./schema";
import path from "path";

const SCHEMA_SQL = `
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
`;

const globalForDb = globalThis as typeof globalThis & {
  __libsqlClient?: Client;
  __drizzleDb?: ReturnType<typeof drizzle<typeof schema>>;
  __schemaReady?: Promise<void>;
};

function isServerlessRuntime(): boolean {
  return (
    process.env.VERCEL === "1" ||
    process.env.NOW_BUILD === "1" ||
    process.env.CF_PAGES === "1"
  );
}

function resolveDbUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Serverless filesystems are read-only except /tmp. Prefer memory so a
  // Vercel import works with zero env vars; seed runs on cold start.
  if (isServerlessRuntime() && !process.env.SQLITE_DB_PATH) {
    return "file::memory:?cache=shared";
  }

  const dbDir = isServerlessRuntime() ? "/tmp" : process.cwd();
  const dbPath = process.env.SQLITE_DB_PATH || path.join(dbDir, "sqlite.db");
  return dbPath.startsWith("file:") ? dbPath : `file:${path.resolve(dbPath)}`;
}

export function getSqliteClient(): Client {
  if (!globalForDb.__libsqlClient) {
    globalForDb.__libsqlClient = createClient({
      url: resolveDbUrl(),
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  }
  return globalForDb.__libsqlClient;
}

export async function ensureSchema(): Promise<void> {
  if (!globalForDb.__schemaReady) {
    globalForDb.__schemaReady = (async () => {
      const client = getSqliteClient();
      const statements = SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean);
      for (const sql of statements) {
        await client.execute(sql);
      }
    })();
  }
  await globalForDb.__schemaReady;
}

export function getDb() {
  if (!globalForDb.__drizzleDb) {
    globalForDb.__drizzleDb = drizzle(getSqliteClient(), { schema });
  }
  return globalForDb.__drizzleDb;
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    const instance = getDb();
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(instance) : value;
  },
});
