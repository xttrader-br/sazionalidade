import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const assets = sqliteTable("assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticker: text("ticker").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'Indices' | 'Sectors' | 'Commodities' | 'Forex' | 'Bonds' | 'Crypto'
  sector: text("sector"),
  description: text("description"),
  equityclockUrl: text("equityclock_url"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const monthlySeasonality = sqliteTable("monthly_seasonality", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assetId: integer("asset_id").references(() => assets.id, { onDelete: "cascade" }).notNull(),
  month: integer("month").notNull(), // 1 - 12
  winRate: real("win_rate").notNull(), // e.g. 75.0 (%)
  avgReturn: real("avg_return").notNull(), // e.g. 2.1 (%)
  medianReturn: real("median_return"),
  maxGain: real("max_gain"),
  maxLoss: real("max_loss"),
  sampleYears: integer("sample_years").default(20).notNull(),
});

export const seasonalWindows = sqliteTable("seasonal_windows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assetId: integer("asset_id").references(() => assets.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  bias: text("bias").notNull(), // 'bullish' | 'bearish' | 'neutral'
  startMonth: integer("start_month").notNull(),
  startDay: integer("start_day").notNull(),
  endMonth: integer("end_month").notNull(),
  endDay: integer("end_day").notNull(),
  winRate: real("win_rate").notNull(),
  avgReturn: real("avg_return").notNull(),
  description: text("description"),
});

export const assetTechnicals = sqliteTable("asset_technicals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assetId: integer("asset_id").references(() => assets.id, { onDelete: "cascade" }).notNull(),
  lastPrice: real("last_price").notNull(),
  dayChangePct: real("day_change_pct").notNull(),
  rsi14: real("rsi_14"),
  aboveSma50: integer("above_sma50", { mode: "boolean" }).default(true),
  aboveSma200: integer("above_sma200", { mode: "boolean" }).default(true),
  confluenceScore: integer("confluence_score").default(75),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const seasonalUpdates = sqliteTable("seasonal_updates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticker: text("ticker"),
  title: text("title").notNull(),
  snippet: text("snippet").notNull(),
  bias: text("bias").notNull(),
  publishDate: text("publish_date").notNull(),
  sourceUrl: text("source_url"),
});
