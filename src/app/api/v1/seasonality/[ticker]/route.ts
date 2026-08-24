import { NextResponse } from "next/server";
import { fetchAssetDetails } from "@/lib/seasonality";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const details = await fetchAssetDetails(ticker);

    if (!details) {
      return NextResponse.json(
        { success: false, error: `Asset with ticker '${ticker}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: details,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
