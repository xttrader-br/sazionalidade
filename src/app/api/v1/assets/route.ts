import { NextResponse } from "next/server";
import { fetchAllAssetsWithBias } from "@/lib/seasonality";
import { db, ensureSchema } from "@/db";
import { assets, monthlySeasonality, assetTechnicals } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let allAssets = await fetchAllAssetsWithBias();

    if (category && category !== "All") {
      allAssets = allAssets.filter((a) => a.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      allAssets = allAssets.filter(
        (a) => a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || (a.sector && a.sector.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      count: allAssets.length,
      data: allAssets,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticker, name, category, sector, description, equityclockUrl, lastPrice } = body;

    if (!ticker || !name || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields: ticker, name, category" }, { status: 400 });
    }

    const uppercaseTicker = ticker.toUpperCase();

    await ensureSchema();
    const existing = await db.select().from(assets).where(eq(assets.ticker, uppercaseTicker)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: `Asset ${uppercaseTicker} already exists.` }, { status: 409 });
    }

    const insertedRows = await db.insert(assets).values({
      ticker: uppercaseTicker,
      name,
      category,
      sector: sector || "General",
      description: description || `Historical seasonal analysis for ${name}`,
      equityclockUrl: equityclockUrl || `https://equityclock.com/charts/${uppercaseTicker.toLowerCase()}-seasonal-chart/`,
    }).returning();
    const inserted = insertedRows[0];
    if (!inserted) {
      return NextResponse.json({ success: false, error: "Failed to insert asset." }, { status: 500 });
    }

    const months = [1,2,3,4,5,6,7,8,9,10,11,12];
    for (const m of months) {
      await db.insert(monthlySeasonality).values({
        assetId: inserted.id,
        month: m,
        winRate: 55,
        avgReturn: 0.5,
        sampleYears: 20,
      });
    }

    await db.insert(assetTechnicals).values({
      assetId: inserted.id,
      lastPrice: Number(lastPrice) || 100.0,
      dayChangePct: 0.1,
      rsi14: 52.0,
      aboveSma50: true,
      aboveSma200: true,
      confluenceScore: 75,
    });

    return NextResponse.json({
      success: true,
      message: `Asset ${uppercaseTicker} added successfully.`,
      asset: inserted,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
