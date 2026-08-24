import { db } from "@/db";
import { assets, monthlySeasonality, seasonalWindows, assetTechnicals, seasonalUpdates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSeedData } from "./seedData";
import { AssetWithBias, MONTH_NAMES } from "@/types/seasonality";

export type { AssetWithBias };
export { MONTH_NAMES };

export async function fetchAllAssetsWithBias(monthOverride?: number): Promise<AssetWithBias[]> {
  await ensureSeedData();

  const currentMonth = monthOverride || (new Date().getMonth() + 1); // 1-12
  const currentDay = new Date().getDate();

  const allAssets = await db.select().from(assets);
  const results: AssetWithBias[] = [];

  for (const asset of allAssets) {
    // Get technicals
    const tech = await db.select().from(assetTechnicals).where(eq(assetTechnicals.assetId, asset.id)).limit(1);
    const techData = tech[0] || {
      lastPrice: 100,
      dayChangePct: 0,
      rsi14: 50,
      aboveSma50: true,
      aboveSma200: true,
      confluenceScore: 70,
    };

    // Get 12-month stats
    const monthStats = await db.select().from(monthlySeasonality).where(eq(monthlySeasonality.assetId, asset.id));
    monthStats.sort((a, b) => a.month - b.month);

    const currentMonthStat = monthStats.find((m) => m.month === currentMonth) || {
      winRate: 50,
      avgReturn: 0,
    };

    // Check active seasonal windows
    const windows = await db.select().from(seasonalWindows).where(eq(seasonalWindows.assetId, asset.id));
    
    let activeWindow: typeof windows[0] | undefined;
    for (const w of windows) {
      if (isDateInWindow(currentMonth, currentDay, w.startMonth, w.startDay, w.endMonth, w.endDay)) {
        activeWindow = w;
        break;
      }
    }

    // Determine bias: priority to active window, else monthly avg return & win rate
    let currentBias: "bullish" | "bearish" | "neutral" = "neutral";
    if (activeWindow) {
      currentBias = activeWindow.bias as "bullish" | "bearish" | "neutral";
    } else {
      if (currentMonthStat.winRate >= 60 && currentMonthStat.avgReturn > 0.5) {
        currentBias = "bullish";
      } else if (currentMonthStat.winRate <= 45 && currentMonthStat.avgReturn < -0.5) {
        currentBias = "bearish";
      }
    }

    results.push({
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
      aboveSma50: techData.aboveSma50,
      aboveSma200: techData.aboveSma200,
      confluenceScore: techData.confluenceScore ?? 70,
      currentMonthWinRate: currentMonthStat.winRate,
      currentMonthAvgReturn: currentMonthStat.avgReturn,
      currentBias,
      activeWindowTitle: activeWindow?.title,
      activeWindowReturn: activeWindow?.avgReturn,
      monthlyStats: monthStats.map((m) => ({
        month: m.month,
        winRate: m.winRate,
        avgReturn: m.avgReturn,
      })),
    });
  }

  return results;
}

export async function fetchAssetDetails(ticker: string) {
  await ensureSeedData();

  const assetList = await db.select().from(assets).where(eq(assets.ticker, ticker.toUpperCase())).limit(1);
  if (assetList.length === 0) return null;

  const asset = assetList[0];
  const monthly = await db.select().from(monthlySeasonality).where(eq(monthlySeasonality.assetId, asset.id));
  monthly.sort((a, b) => a.month - b.month);

  const windows = await db.select().from(seasonalWindows).where(eq(seasonalWindows.assetId, asset.id));
  const tech = await db.select().from(assetTechnicals).where(eq(assetTechnicals.assetId, asset.id)).limit(1);
  const updates = await db.select().from(seasonalUpdates).where(eq(seasonalUpdates.ticker, asset.ticker)).limit(5);

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

  let activeWindow = windows.find((w) =>
    isDateInWindow(currentMonth, currentDay, w.startMonth, w.startDay, w.endMonth, w.endDay)
  );

  const currentStat = monthly.find((m) => m.month === currentMonth);
  let bias: "bullish" | "bearish" | "neutral" = "neutral";
  if (activeWindow) {
    bias = activeWindow.bias as any;
  } else if (currentStat) {
    if (currentStat.winRate >= 60 && currentStat.avgReturn > 0.5) bias = "bullish";
    else if (currentStat.winRate <= 45 && currentStat.avgReturn < -0.5) bias = "bearish";
  }

  return {
    asset,
    monthly: cumulativeData,
    windows,
    technicals: tech[0] || null,
    updates,
    activeBias: bias,
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
  } else {
    return currentVal >= startVal || currentVal <= endVal;
  }
}
