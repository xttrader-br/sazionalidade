import { NextResponse } from "next/server";
import { db } from "@/db";
import { assetTechnicals } from "@/db/schema";
import { fetchAllAssetsWithBias } from "@/lib/seasonality";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const assetsList = await fetchAllAssetsWithBias();
    
    let updatedCount = 0;
    for (const item of assetsList) {
      const randomPriceShift = (Math.random() - 0.48) * 1.5;
      const newPrice = Number((item.lastPrice * (1 + randomPriceShift / 100)).toFixed(2));
      const newDayChange = Number((item.dayChangePct + (Math.random() - 0.5) * 0.4).toFixed(2));
      const newRsi = Math.min(85, Math.max(25, Number(((item.rsi14 || 50) + (Math.random() - 0.5) * 3).toFixed(1))));
      const newConfluence = Math.min(99, Math.max(30, Math.round(item.confluenceScore + (Math.random() - 0.5) * 4)));

      await db
        .update(assetTechnicals)
        .set({
          lastPrice: newPrice,
          dayChangePct: newDayChange,
          rsi14: newRsi,
          confluenceScore: newConfluence,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(assetTechnicals.assetId, item.id));

      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: `Atualizados ${updatedCount} ativos (simulação local de cotações). Sem feed externo.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
