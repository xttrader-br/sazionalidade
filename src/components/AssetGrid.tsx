"use client";

import React, { useState } from "react";
import { AssetWithBias, MONTH_NAMES } from "@/types/seasonality";
import {
  ChevronRight,
  ShieldCheck,
  Calendar,
  Grid,
  List
} from "lucide-react";
import BiasBadge from "./BiasBadge";

interface AssetGridProps {
  assets: AssetWithBias[];
  onSelectAsset: (ticker: string) => void;
  selectedCategory: string;
  searchQuery: string;
}

export default function AssetGrid({
  assets,
  onSelectAsset,
  selectedCategory,
  searchQuery,
}: AssetGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const currentMonthName = MONTH_NAMES[new Date().getMonth()];

  const filteredAssets = assets.filter((asset) => {
    if (selectedCategory !== "All" && asset.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTicker = asset.ticker.toLowerCase().includes(q);
      const matchName = asset.name.toLowerCase().includes(q);
      const matchSector = asset.sector ? asset.sector.toLowerCase().includes(q) : false;
      if (!matchTicker && !matchName && !matchSector) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Action Bar & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>
            Exibindo <strong className="text-white">{filteredAssets.length}</strong> de{" "}
            <strong className="text-slate-200">{assets.length}</strong> ativos rastreados
          </span>
          <span className="hidden sm:inline">• Mês Atual: <strong className="text-amber-400 font-semibold">{currentMonthName}</strong></span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "grid" ? "bg-slate-800 text-emerald-400" : "text-slate-500 hover:text-slate-300"
              }`}
              title="Visualização em Cards"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "table" ? "bg-slate-800 text-emerald-400" : "text-slate-500 hover:text-slate-300"
              }`}
              title="Visualização em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(asset.ticker)}
              className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 shadow-lg transition duration-200 hover:shadow-emerald-500/5 flex flex-col justify-between cursor-pointer space-y-4"
            >
              {/* Card Top Row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-white group-hover:text-emerald-400 transition">
                      {asset.ticker}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {asset.category}
                    </span>
                  </div>
                  <h3 className="text-xs text-slate-300 font-medium line-clamp-1 mt-0.5">
                    {asset.name}
                  </h3>
                </div>

                <BiasBadge bias={asset.currentBias} size="sm" />
              </div>

              {/* Price & Confluence */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Preço / Variação</span>
                  <div className="font-mono font-bold text-slate-100 mt-0.5">
                    ${asset.lastPrice}
                    <span
                      className={`ml-1 text-[11px] font-normal ${
                        asset.dayChangePct >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {asset.dayChangePct >= 0 ? "+" : ""}
                      {asset.dayChangePct}%
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block">Score Confluência</span>
                  <div className="font-mono font-bold text-amber-400 mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{asset.confluenceScore}</span>
                    <span className="text-[10px] text-slate-500 font-normal">/100</span>
                  </div>
                </div>
              </div>

              {/* Current Month Seasonality Metrics */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400 font-sans">Histórico {currentMonthName}:</span>
                  <span className="font-bold text-emerald-400">
                    {asset.currentMonthWinRate}% Win Rate
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400 font-sans">Retorno Médio no Mês:</span>
                  <span
                    className={`font-semibold ${
                      asset.currentMonthAvgReturn >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {asset.currentMonthAvgReturn >= 0 ? "+" : ""}
                    {asset.currentMonthAvgReturn}%
                  </span>
                </div>

                {asset.activeWindowTitle && (
                  <div className="pt-1 text-[11px] text-amber-300/90 font-sans flex items-center gap-1 truncate">
                    <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{asset.activeWindowTitle}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Button */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="group-hover:text-slate-200 transition font-medium text-[11px]">
                  Ver Análise 12 Meses
                </span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 text-emerald-400 transition" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-xs font-mono uppercase border-b border-slate-800">
                  <th className="p-3">Ticker / Nome</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Bias Ativo</th>
                  <th className="p-3 text-right">Preço</th>
                  <th className="p-3 text-right">{currentMonthName} Win Rate</th>
                  <th className="p-3 text-right">{currentMonthName} Ret. Médio</th>
                  <th className="p-3 text-right">Confluência</th>
                  <th className="p-3 text-right">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs font-mono">
                {filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => onSelectAsset(asset.ticker)}
                    className="hover:bg-slate-800/50 transition cursor-pointer"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{asset.ticker}</span>
                        <span className="font-sans text-xs text-slate-400 truncate max-w-[150px]">
                          {asset.name}
                        </span>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[11px] font-sans">
                        {asset.category}
                      </span>
                    </td>

                    <td className="p-3">
                      <BiasBadge bias={asset.currentBias} size="sm" />
                    </td>

                    <td className="p-3 text-right font-bold text-slate-200">
                      ${asset.lastPrice}
                    </td>

                    <td className="p-3 text-right font-bold text-emerald-400">
                      {asset.currentMonthWinRate}%
                    </td>

                    <td className="p-3 text-right font-semibold">
                      <span className={asset.currentMonthAvgReturn >= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {asset.currentMonthAvgReturn >= 0 ? "+" : ""}
                        {asset.currentMonthAvgReturn}%
                      </span>
                    </td>

                    <td className="p-3 text-right font-bold text-amber-400">
                      {asset.confluenceScore}/100
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAsset(asset.ticker);
                        }}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredAssets.length === 0 && (
        <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 space-y-2">
          <p className="font-semibold text-white">Nenhum ativo encontrado.</p>
          <p className="text-xs">Tente ajustar a busca por termo ou selecione &quot;All&quot; nas categorias.</p>
        </div>
      )}
    </div>
  );
}
