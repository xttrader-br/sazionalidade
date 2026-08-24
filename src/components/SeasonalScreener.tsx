"use client";

import React, { useState } from "react";
import { AssetWithBias, MONTH_NAMES } from "@/types/seasonality";
import { Sliders, ArrowUpRight } from "lucide-react";
import BiasBadge from "./BiasBadge";

interface SeasonalScreenerProps {
  assets: AssetWithBias[];
  onSelectAsset: (ticker: string) => void;
}

export default function SeasonalScreener({ assets, onSelectAsset }: SeasonalScreenerProps) {
  const currentMonthNum = new Date().getMonth() + 1;

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthNum);
  const [minWinRate, setMinWinRate] = useState<number>(60);
  const [biasFilter, setBiasFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [minConfluence, setMinConfluence] = useState<number>(70);

  // Compute screener results
  const results = assets
    .map((asset) => {
      const monthStat = asset.monthlyStats.find((m) => m.month === selectedMonth) || {
        winRate: 50,
        avgReturn: 0,
      };

      let evaluatedBias: "bullish" | "bearish" | "neutral" = "neutral";
      if (monthStat.winRate >= 65 && monthStat.avgReturn > 0.5) evaluatedBias = "bullish";
      else if (monthStat.winRate <= 45 && monthStat.avgReturn < -0.5) evaluatedBias = "bearish";

      return {
        ...asset,
        targetMonthWinRate: monthStat.winRate,
        targetMonthAvgReturn: monthStat.avgReturn,
        evaluatedBias,
      };
    })
    .filter((a) => {
      if (a.targetMonthWinRate < minWinRate) return false;
      if (biasFilter !== "All" && a.evaluatedBias.toLowerCase() !== biasFilter.toLowerCase()) return false;
      if (categoryFilter !== "All" && a.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (a.confluenceScore < minConfluence) return false;
      return true;
    })
    .sort((a, b) => b.targetMonthWinRate - a.targetMonthWinRate);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-0.5 shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sliders className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Screener de Oportunidades Sazonais</h2>
            <p className="text-xs text-slate-400">
              Filtre ativos com alta taxa de acerto histórica (Win Rate) e sinal técnico confluente.
            </p>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Select Month */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Mês Alvo de Operação
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name} {idx + 1 === currentMonthNum ? "(Mês Atual)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Win Rate Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Win Rate Mínimo
              </label>
              <span className="text-xs font-mono font-bold text-emerald-400">{minWinRate}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="80"
              step="5"
              value={minWinRate}
              onChange={(e) => setMinWinRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Bias Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Direção / Bias
            </label>
            <select
              value={biasFilter}
              onChange={(e) => setBiasFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">Todos (Bullish + Bearish)</option>
              <option value="bullish">Apenas Bullish (🟢)</option>
              <option value="bearish">Apenas Bearish (🔴)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Classe de Ativo
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">Todas as Classes</option>
              <option value="Indices">Índices</option>
              <option value="Sectors">Setores US</option>
              <option value="Commodities">Commodities</option>
              <option value="Forex">Forex</option>
              <option value="Bonds">Títulos / Bonds</option>
              <option value="Crypto">Cripto</option>
            </select>
          </div>

          {/* Confluence Score Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Score Mínimo Confluência
            </label>
            <select
              value={minConfluence}
              onChange={(e) => setMinConfluence(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="50">50+ (Qualquer)</option>
              <option value="70">70+ (Moderado)</option>
              <option value="80">80+ (Alta Confluência)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Encontrados <strong className="text-emerald-400">{results.length}</strong> ativos com setup em{" "}
          <strong className="text-white">{MONTH_NAMES[selectedMonth - 1]}</strong>
        </span>
        <span>Ordenado por Taxa de Acerto (Win Rate)</span>
      </div>

      {/* Results Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-xs font-mono uppercase border-b border-slate-800">
                <th className="p-3">Ativo</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Bias no Mês</th>
                <th className="p-3 text-right">Win Rate (%)</th>
                <th className="p-3 text-right">Retorno Médio (%)</th>
                <th className="p-3 text-right">Confluência</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs font-mono">
              {results.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectAsset(item.ticker)}
                  className="hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <td className="p-3">
                    <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                      <span>{item.ticker}</span>
                      <span className="font-sans font-normal text-xs text-slate-400 truncate max-w-[150px]">
                        {item.name}
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-sans">
                      {item.category}
                    </span>
                  </td>

                  <td className="p-3">
                    <BiasBadge bias={item.evaluatedBias} size="sm" />
                  </td>

                  <td className="p-3 text-right font-bold text-emerald-400">
                    {item.targetMonthWinRate}%
                  </td>

                  <td className="p-3 text-right font-semibold">
                    <span className={item.targetMonthAvgReturn >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      {item.targetMonthAvgReturn >= 0 ? "+" : ""}
                      {item.targetMonthAvgReturn}%
                    </span>
                  </td>

                  <td className="p-3 text-right">
                    <span className="font-bold text-amber-400">{item.confluenceScore}</span>/100
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAsset(item.ticker);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-400 rounded-lg text-[11px] transition"
                    >
                      <span>Analisar</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}

              {results.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                    Nenhum ativo atendeu aos critérios de filtro selecionados. Tente reduzir o Win Rate mínimo ou alterar a categoria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
