"use client";

import React, { useState } from "react";
import { AssetWithBias, MONTH_NAMES } from "@/types/seasonality";
import { Flame, Percent, ArrowUpDown } from "lucide-react";
import BiasBadge from "./BiasBadge";

interface SeasonalityHeatmapProps {
  assets: AssetWithBias[];
  onSelectAsset: (ticker: string) => void;
}

export default function SeasonalityHeatmap({ assets, onSelectAsset }: SeasonalityHeatmapProps) {
  const [metric, setMetric] = useState<"winRate" | "avgReturn">("avgReturn");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const currentMonthNum = new Date().getMonth() + 1;

  const filteredAssets = assets.filter((a) => {
    if (selectedCategory === "All") return true;
    return a.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  function getCellBg(val: number, isWinRate: boolean) {
    if (isWinRate) {
      if (val >= 75) return "bg-emerald-600/80 text-white font-bold";
      if (val >= 65) return "bg-emerald-500/40 text-emerald-200 font-semibold";
      if (val >= 55) return "bg-emerald-950/40 text-emerald-300";
      if (val >= 48) return "bg-slate-900/60 text-slate-400";
      if (val >= 40) return "bg-rose-950/40 text-rose-300";
      return "bg-rose-600/80 text-white font-bold";
    } else {
      if (val >= 3.0) return "bg-emerald-600/85 text-white font-bold";
      if (val >= 1.5) return "bg-emerald-500/40 text-emerald-200 font-semibold";
      if (val > 0.0) return "bg-emerald-950/30 text-emerald-300";
      if (val === 0) return "bg-slate-900/60 text-slate-400";
      if (val >= -1.5) return "bg-rose-950/30 text-rose-300";
      return "bg-rose-600/85 text-white font-bold";
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Heatmap Control Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Heatmap Sazonal de 12 Meses
            </h2>
            <p className="text-xs text-slate-400">
              Visualização matricial do desempenho e taxas de ganho históricas mês a mês.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Toggle metric */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMetric("avgReturn")}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                metric === "avgReturn"
                  ? "bg-emerald-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Retorno Médio (%)
            </button>

            <button
              onClick={() => setMetric("winRate")}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                metric === "winRate"
                  ? "bg-emerald-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              Win Rate (%)
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">Todas Categorias ({assets.length})</option>
            <option value="Indices">Índices</option>
            <option value="Sectors">Setores US</option>
            <option value="Commodities">Commodities</option>
            <option value="Forex">Forex</option>
            <option value="Bonds">Títulos & Bonds</option>
            <option value="Crypto">Criptomoedas</option>
          </select>
        </div>
      </div>

      {/* Heatmap Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 text-xs uppercase font-mono border-b border-slate-800">
                <th className="p-3 sticky left-0 z-10 bg-slate-950 border-r border-slate-800 min-w-[140px]">
                  Ativo / Ticker
                </th>
                <th className="p-3 border-r border-slate-800 text-center min-w-[90px]">
                  Bias Hoje
                </th>
                {MONTH_NAMES.map((mName, idx) => {
                  const mNum = idx + 1;
                  const isCurrent = mNum === currentMonthNum;
                  return (
                    <th
                      key={mName}
                      className={`p-3 text-center border-r border-slate-800/80 ${
                        isCurrent ? "bg-amber-500/20 text-amber-300 font-bold border-t-2 border-t-amber-400" : ""
                      }`}
                    >
                      {mName}
                      {isCurrent && <span className="block text-[9px] font-mono text-amber-400">(Hoje)</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  onClick={() => onSelectAsset(asset.ticker)}
                  className="hover:bg-slate-800/40 transition cursor-pointer group"
                >
                  <td className="p-3 sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-800/90 border-r border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 group-hover:text-emerald-400 transition">
                        {asset.ticker}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[90px]">
                        {asset.name}
                      </span>
                    </div>
                  </td>

                  <td className="p-2 border-r border-slate-800 text-center bg-slate-950/40">
                    <BiasBadge bias={asset.currentBias} size="sm" showLabel={false} />
                  </td>

                  {MONTH_NAMES.map((_, idx) => {
                    const monthNum = idx + 1;
                    const isCurrent = monthNum === currentMonthNum;
                    const monthStat = asset.monthlyStats.find((m) => m.month === monthNum);
                    const val = monthStat
                      ? metric === "winRate"
                        ? monthStat.winRate
                        : monthStat.avgReturn
                      : 0;

                    const cellBgClass = getCellBg(val, metric === "winRate");

                    return (
                      <td
                        key={monthNum}
                        className={`p-2 text-center border-r border-slate-800/60 transition ${cellBgClass} ${
                          isCurrent ? "ring-1 ring-amber-400/50" : ""
                        }`}
                      >
                        {metric === "winRate" ? `${val}%` : `${val > 0 ? "+" : ""}${val}%`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend Footer */}
        <div className="bg-slate-950/90 p-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-300">Legenda de Cores ({metric === "winRate" ? "Win Rate" : "Retorno Médio"}):</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">Alta Forte</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/40 text-emerald-200">Moderado</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-400">Neutro</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600 text-white font-bold">Baixa Forte</span>
          </div>

          <p className="text-[11px] text-slate-500">
            Dica: Clique em qualquer ativo para abrir o gráfico sazonal detalhado.
          </p>
        </div>
      </div>
    </div>
  );
}
