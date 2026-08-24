"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  BarChart3,
  Search,
  RefreshCw,
  Code2,
  Sliders,
  Layers,
  PlusCircle,
  HelpCircle,
  Sparkles,
  Zap
} from "lucide-react";

interface HeaderProps {
  activeTab: "explorer" | "heatmap" | "screener" | "compare" | "apidocs";
  setActiveTab: (tab: "explorer" | "heatmap" | "screener" | "compare" | "apidocs") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  onOpenAddModal: () => void;
}

const CATEGORIES = ["All", "Indices", "Sectors", "Commodities", "Forex", "Bonds", "Crypto"];

export default function Header({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onSync,
  isSyncing,
  onOpenAddModal,
}: HeaderProps) {
  const currentMonthName = new Date().toLocaleString("en-US", { month: "long" });

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  EquityClock Bias & Analytics
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Zap className="w-3 h-3" /> Live Bias Tracker
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sazonalidade Histórica & Análise de Tendências de Ativos Financiadores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
              title="Sincronizar com feeds de cotações e tabelas do EquityClock"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Sincronizando..." : "Sincronizar Feeds"}</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Adicionar Ativo</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs and Filters */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab("explorer")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === "explorer"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Explorador de Bias</span>
            </button>

            <button
              onClick={() => setActiveTab("heatmap")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === "heatmap"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Heatmap 12 Meses</span>
            </button>

            <button
              onClick={() => setActiveTab("screener")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === "screener"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Screener Sazonal</span>
            </button>

            <button
              onClick={() => setActiveTab("compare")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === "compare"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Comparador de Curvas</span>
            </button>

            <button
              onClick={() => setActiveTab("apidocs")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === "apidocs"
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Como Funciona & API</span>
            </button>
          </nav>

          {/* Search & Category Filter Bar */}
          {activeTab === "explorer" && (
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Category selector */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded-md transition font-medium ${
                      selectedCategory === cat
                        ? "bg-slate-800 text-emerald-400 font-semibold shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative flex-1 min-w-[160px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar ticker, nome (ex: SPX, GLD)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
