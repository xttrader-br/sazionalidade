import { NextResponse } from "next/server";
import { fetchAllAssetsWithBias } from "@/lib/seasonality";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");
    const biasType = searchParams.get("bias");
    const monthStr = searchParams.get("month");
    const category = searchParams.get("category");

    const monthNum = monthStr ? parseInt(monthStr, 10) : undefined;
    let data = await fetchAllAssetsWithBias(monthNum);

    if (ticker) {
      data = data.filter((a) => a.ticker.toUpperCase() === ticker.toUpperCase());
    }

    if (biasType) {
      data = data.filter((a) => a.currentBias.toLowerCase() === biasType.toLowerCase());
    }

    if (category && category !== "All") {
      data = data.filter((a) => a.category.toLowerCase() === category.toLowerCase());
    }

    const summary = {
      total: data.length,
      bullishCount: data.filter((a) => a.currentBias === "bullish").length,
      bearishCount: data.filter((a) => a.currentBias === "bearish").length,
      neutralCount: data.filter((a) => a.currentBias === "neutral").length,
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
      assets: data.map((a) => ({
        ticker: a.ticker,
        name: a.name,
        category: a.category,
        sector: a.sector,
        currentBias: a.currentBias,
        activeWindow: a.activeWindowTitle || null,
        activeWindowAvgReturnPct: a.activeWindowReturn || null,
        currentMonthWinRatePct: a.currentMonthWinRate,
        currentMonthAvgReturnPct: a.currentMonthAvgReturn,
        confluenceScore: a.confluenceScore,
        lastPrice: a.lastPrice,
        dayChangePct: a.dayChangePct,
        equityclockUrl: a.equityclockUrl,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
