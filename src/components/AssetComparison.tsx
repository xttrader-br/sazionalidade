"use client";

import React, { useState } from "react";
import { AssetWithBias, MONTH_NAMES } from "@/types/seasonality";
import { Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import BiasBadge from "./BiasBadge";

interface AssetComparisonProps {
  assets: AssetWithBias[];
}

export default function AssetComparison({ assets }: AssetComparisonProps) {
  const [selectedTickers, setSelectedTickers] = useState<string[]>(["SPX", "XLK", "GLD"]);

  const toggleTicker = (ticker: string) => {
    if (selectedTickers.includes(ticker)) {
      if (selectedTickers.length > 1) {
        setSelectedTickers(selectedTickers.filter((t) => t !== ticker));
      }
    } else {
      if (selectedTickers.length < 4) {
        setSelectedTickers([...selectedTickers, ticker]);
      }
    }
  };

  // Build combined 12-month chart data
  const chartData = MONTH_NAMES.map((mName, idx) => {
    const monthNum = idx + 1;
    const row: any = { monthName: mName };

    selectedTickers.forEach((t) => {
      const asset = assets.find((a) => a.ticker === t);
      if (asset) {
        let cumulative = 100;
        for (let i = 1; i <= monthNum; i++) {
          const mStat = asset.monthlyStats.find((m) => m.month === i);
          if (mStat) {
            cumulative = cumulative * (1 + mStat.avgReturn / 100);
          }
        }
        row[t] = Number(cumulative.toFixed(2));
      }
    });

    return row;
  });

  const LINE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899"];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-cyan-500 p-0.5 shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Comparador de Curvas Sazonais</h2>
            <p className="text-xs text-slate-400">
              Selecione até 4 ativos para comparar o desempenho acumulado de Janeiro a Dezembro.
            </p>
          </div>
        </div>

        {/* Ticker Selector Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold mr-1">Ativos Selecionados:</span>
          {assets.map((asset) => {
            const isSelected = selectedTickers.includes(asset.ticker);
            return (
              <button
                key={asset.id}
                onClick={() => toggleTicker(asset.ticker)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition border ${
                  isSelected
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {asset.ticker}
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-Line Recharts Component */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200">
          Progresso do Índice Acumulado Base 100 (Janeiro = 100)
        </h3>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#f8fafc",
                }}
              />
              <Legend />
              {selectedTickers.map((t, idx) => (
                <Line
                  key={t}
                  type="monotone"
                  dataKey={t}
                  stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {selectedTickers.map((t, idx) => {
          const asset = assets.find((a) => a.ticker === t);
          if (!asset) return null;

          return (
            <div
              key={t}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: LINE_COLORS[idx % LINE_COLORS.length] }}
                  ></div>
                  <h4 className="font-mono font-bold text-base text-white">{asset.ticker}</h4>
                </div>
                <BiasBadge bias={asset.currentBias} size="sm" />
              </div>

              <p className="text-xs text-slate-400">{asset.name}</p>

              <div className="space-y-1 pt-2 border-t border-slate-800 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Win Rate Mês Atual:</span>
                  <span className="font-bold text-emerald-400">{asset.currentMonthWinRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Retorno Mês Atual:</span>
                  <span className={asset.currentMonthAvgReturn >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {asset.currentMonthAvgReturn >= 0 ? "+" : ""}
                    {asset.currentMonthAvgReturn}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Score Confluência:</span>
                  <span className="font-bold text-amber-400">{asset.confluenceScore}/100</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
