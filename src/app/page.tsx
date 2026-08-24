"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import AssetGrid from "@/components/AssetGrid";
import SeasonalityHeatmap from "@/components/SeasonalityHeatmap";
import SeasonalScreener from "@/components/SeasonalScreener";
import AssetComparison from "@/components/AssetComparison";
import ScraperGuideAndApiDocs from "@/components/ScraperGuideAndApiDocs";
import AssetDetailModal from "@/components/AssetDetailModal";
import AddAssetModal from "@/components/AddAssetModal";
import { AssetWithBias } from "@/types/seasonality";
import { AlertCircle } from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"explorer" | "heatmap" | "screener" | "compare" | "apidocs">("explorer");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [assets, setAssets] = useState<AssetWithBias[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/assets");
      const data = await res.json();
      if (data.success) {
        setAssets(data.data);
      } else {
        setError(data.error || "Falha ao carregar ativos.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch("/api/v1/sync", { method: "POST" });
      await loadAssets();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onSync={handleSync}
        isSyncing={isSyncing}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-slate-400 font-medium">
              Carregando dados de bias sazonal e métricas locais...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="font-bold text-base">Ocorreu um erro ao carregar os dados</h3>
            <p className="text-xs text-rose-300/80">{error}</p>
            <button
              onClick={loadAssets}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <>
            {activeTab === "explorer" && (
              <AssetGrid
                assets={assets}
                onSelectAsset={(t) => setSelectedTicker(t)}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === "heatmap" && (
              <SeasonalityHeatmap
                assets={assets}
                onSelectAsset={(t) => setSelectedTicker(t)}
              />
            )}

            {activeTab === "screener" && (
              <SeasonalScreener
                assets={assets}
                onSelectAsset={(t) => setSelectedTicker(t)}
              />
            )}

            {activeTab === "compare" && (
              <AssetComparison assets={assets} />
            )}

            {activeTab === "apidocs" && (
              <ScraperGuideAndApiDocs />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>
            Sazionalidade • libSQL / SQLite + Drizzle ORM + Next.js App Router
          </p>
          <p className="text-[11px] text-slate-600">
            Aviso de Isenção: As análises estatísticas sazonais são baseadas em dados históricos de 20 anos e não constituem recomendação de investimento.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <AssetDetailModal
        ticker={selectedTicker}
        onClose={() => setSelectedTicker(null)}
      />

      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAssetAdded={loadAssets}
      />
    </div>
  );
}
