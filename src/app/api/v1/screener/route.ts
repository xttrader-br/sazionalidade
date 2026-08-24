import { NextResponse } from "next/server";
import { fetchAllAssetsWithBias } from "@/lib/seasonality";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!, 10) : undefined;
    const minWinRate = searchParams.get("minWinRate") ? parseFloat(searchParams.get("minWinRate")!) : 0;
    const bias = searchParams.get("bias");

    let assets = await fetchAllAssetsWithBias(month);

    if (minWinRate > 0) {
      assets = assets.filter((a) => a.currentMonthWinRate >= minWinRate);
    }

    if (bias) {
      assets = assets.filter((a) => a.currentBias.toLowerCase() === bias.toLowerCase());
    }

    assets.sort((a, b) => b.confluenceScore - a.confluenceScore);

    return NextResponse.json({
      success: true,
      count: assets.length,
      screenerResults: assets,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
