export interface MonthlyStat {
  month: number;
  winRate: number;
  avgReturn: number;
}

export interface AssetWithBias {
  id: number;
  ticker: string;
  name: string;
  category: string;
  sector?: string | null;
  description?: string | null;
  equityclockUrl?: string | null;
  lastPrice: number;
  dayChangePct: number;
  rsi14: number | null;
  aboveSma50: boolean | null;
  aboveSma200: boolean | null;
  confluenceScore: number;
  currentMonthWinRate: number;
  currentMonthAvgReturn: number;
  currentBias: "bullish" | "bearish" | "neutral";
  activeWindowTitle?: string;
  activeWindowReturn?: number;
  monthlyStats: MonthlyStat[];
}

export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
