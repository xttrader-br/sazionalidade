import { db } from "@/db";
import { assets, monthlySeasonality, seasonalWindows, assetTechnicals, seasonalUpdates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSeedData } from "./seedData";
import { AssetWithBias, MONTH_NAMES } from "@/types/seasonality";

export type { AssetWithBias };
export { MONTH_NAMES };

function groupByAssetId<T extends { assetId: number }>(rows: T[]): Map<number, T[]> {
  const map = new Map<number, T[]>();
  for (const row of rows) {
    const list = map.get(row.assetId);
    if (list) list.push(row);
    else map.set(row.assetId, [row]);
  }
  return map;
}

function resolveBias(
  winRate: number,
  avgReturn: number,
  windowBias?: string
): "bullish" | "bearish" | "neutral" {
  if (windowBias === "bullish" || windowBias === "bearish" || windowBias === "neutral") {
    return windowBias;
  }
  if (winRate >= 60 && avgReturn > 0.5) return "bullish";
  if (winRate <= 45 && avgReturn < -0.5) return "bearish";
  return "neutral";
}

async function requireSeed() {
  const seed = await ensureSeedData();
  if (!seed.success) {
    throw new Error(seed.error || "Falha ao inicializar o banco de dados.");
  }
}

export async function fetchAllAssetsWithBias(monthOverride?: number): Promise<AssetWithBias[]> {
  await requireSeed();

  const currentMonth = monthOverride ?? new Date().getMonth() + 1;
  const currentDay = new Date().getDate();

  const [allAssets, allTech, allMonths, allWindows] = await Promise.all([
    db.select().from(assets),
    db.select().from(assetTechnicals),
    db.select().from(monthlySeasonality),
    db.select().from(seasonalWindows),
  ]);

  const techByAsset = new Map(allTech.map((row) => [row.assetId, row]));
  const monthsByAsset = groupByAssetId(allMonths);
  const windowsByAsset = groupByAssetId(allWindows);

  return allAssets.map((asset) => {
    const techData = techByAsset.get(asset.id) ?? {
      lastPrice: 100,
      dayChangePct: 0,
      rsi14: 50,
      aboveSma50: true,
      aboveSma200: true,
      confluenceScore: 70,
    };

    const monthStats = [...(monthsByAsset.get(asset.id) ?? [])].sort((a, b) => a.month - b.month);
    const currentMonthStat = monthStats.find((m) => m.month === currentMonth) ?? {
      winRate: 50,
      avgReturn: 0,
    };

    const windows = windowsByAsset.get(asset.id) ?? [];
    const activeWindow = windows.find((w) =>
      isDateInWindow(currentMonth, currentDay, w.startMonth, w.startDay, w.endMonth, w.endDay)
    );

    return {
      id: asset.id,
      ticker: asset.ticker,
      name: asset.name,
      category: asset.category,
      sector: asset.sector,
      description: asset.description,
      equityclockUrl: asset.equityclockUrl,
      lastPrice: techData.lastPrice,
      dayChangePct: techData.dayChangePct,
      rsi14: techData.rsi14,
      aboveSma50: Boolean(techData.aboveSma50),
      aboveSma200: Boolean(techData.aboveSma200),
      confluenceScore: techData.confluenceScore ?? 70,
      currentMonthWinRate: currentMonthStat.winRate,
      currentMonthAvgReturn: currentMonthStat.avgReturn,
      currentBias: resolveBias(currentMonthStat.winRate, currentMonthStat.avgReturn, activeWindow?.bias),
      activeWindowTitle: activeWindow?.title,
      activeWindowReturn: activeWindow?.avgReturn,
      monthlyStats: monthStats.map((m) => ({
        month: m.month,
        winRate: m.winRate,
        avgReturn: m.avgReturn,
      })),
    };
  });
}

export async function fetchAssetDetails(ticker: string) {
  await requireSeed();

  const assetList = await db.select().from(assets).where(eq(assets.ticker, ticker.toUpperCase())).limit(1);
  if (assetList.length === 0) return null;

  const asset = assetList[0];
  const [monthly, windows, tech, updates] = await Promise.all([
    db.select().from(monthlySeasonality).where(eq(monthlySeasonality.assetId, asset.id)),
    db.select().from(seasonalWindows).where(eq(seasonalWindows.assetId, asset.id)),
    db.select().from(assetTechnicals).where(eq(assetTechnicals.assetId, asset.id)).limit(1),
    db.select().from(seasonalUpdates).where(eq(seasonalUpdates.ticker, asset.ticker)).limit(5),
  ]);

  monthly.sort((a, b) => a.month - b.month);

  let cumulative = 100;
  const cumulativeData = monthly.map((m) => {
    cumulative = cumulative * (1 + m.avgReturn / 100);
    return {
      month: m.month,
      monthName: MONTH_NAMES[m.month - 1],
      winRate: m.winRate,
      avgReturn: m.avgReturn,
      medianReturn: m.medianReturn ?? m.avgReturn,
      maxGain: m.maxGain ?? m.avgReturn * 2,
      maxLoss: m.maxLoss ?? m.avgReturn * -2,
      cumulativeIndex: Number(cumulative.toFixed(2)),
    };
  });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const activeWindow = windows.find((w) =>
    isDateInWindow(currentMonth, currentDay, w.startMonth, w.startDay, w.endMonth, w.endDay)
  );
  const currentStat = monthly.find((m) => m.month === currentMonth);

  return {
    asset,
    monthly: cumulativeData,
    windows,
    technicals: tech[0] || null,
    updates,
    activeBias: resolveBias(currentStat?.winRate ?? 50, currentStat?.avgReturn ?? 0, activeWindow?.bias),
    activeWindow,
  };
}

export function isDateInWindow(
  cMonth: number,
  cDay: number,
  sMonth: number,
  sDay: number,
  eMonth: number,
  eDay: number
): boolean {
  const currentVal = cMonth * 100 + cDay;
  const startVal = sMonth * 100 + sDay;
  const endVal = eMonth * 100 + eDay;

  if (startVal <= endVal) {
    return currentVal >= startVal && currentVal <= endVal;
  }
  return currentVal >= startVal || currentVal <= endVal;
}
