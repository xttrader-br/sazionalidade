"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface BiasBadgeProps {
  bias: "bullish" | "bearish" | "neutral";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function BiasBadge({ bias, size = "md", showLabel = true }: BiasBadgeProps) {
  if (bias === "bullish") {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${
          size === "sm"
            ? "px-1.5 py-0.5 text-[10px]"
            : size === "lg"
            ? "px-3 py-1 text-sm shadow-lg shadow-emerald-500/10"
            : "px-2 py-0.5 text-xs"
        }`}
      >
        <TrendingUp className={size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />
        {showLabel && <span>BULLISH BIAS</span>}
      </span>
    );
  }

  if (bias === "bearish") {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 ${
          size === "sm"
            ? "px-1.5 py-0.5 text-[10px]"
            : size === "lg"
            ? "px-3 py-1 text-sm shadow-lg shadow-rose-500/10"
            : "px-2 py-0.5 text-xs"
        }`}
      >
        <TrendingDown className={size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />
        {showLabel && <span>BEARISH BIAS</span>}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 ${
        size === "sm"
          ? "px-1.5 py-0.5 text-[10px]"
          : size === "lg"
          ? "px-3 py-1 text-sm"
          : "px-2 py-0.5 text-xs"
      }`}
    >
      <Minus className={size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />
      {showLabel && <span>NEUTRAL / CONSOLIDATION</span>}
    </span>
  );
}
