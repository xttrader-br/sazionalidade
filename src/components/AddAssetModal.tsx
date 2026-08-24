"use client";

import React, { useState } from "react";
import { X, PlusCircle, AlertCircle } from "lucide-react";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded: () => void;
}

export default function AddAssetModal({ isOpen, onClose, onAssetAdded }: AddAssetModalProps) {
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Indices");
  const [sector, setSector] = useState("Broad Market");
  const [description, setDescription] = useState("");
  const [lastPrice, setLastPrice] = useState("100.00");
  const [equityclockUrl, setEquityclockUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim() || !name.trim()) {
      setError("Por favor preencha o Ticker e o Nome do ativo.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: ticker.trim().toUpperCase(),
          name: name.trim(),
          category,
          sector: sector.trim() || "Geral",
          description: description.trim(),
          lastPrice: parseFloat(lastPrice) || 100.0,
          equityclockUrl: equityclockUrl.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        onAssetAdded();
        onClose();
        // Reset form
        setTicker("");
        setName("");
      } else {
        setError(data.error || "Erro ao adicionar ativo.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            Adicionar Novo Ativo para Rastreamento Sazonal
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ticker / Símbolo *</label>
              <input
                type="text"
                placeholder="Ex: NVDA, TSLA, Btc"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 uppercase focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Preço Inicial ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="100.00"
                value={lastPrice}
                onChange={(e) => setLastPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nome Completo do Ativo *</label>
            <input
              type="text"
              placeholder="Ex: NVIDIA Corporation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Classe de Ativo</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Indices">Índices</option>
                <option value="Sectors">Setores US</option>
                <option value="Commodities">Commodities</option>
                <option value="Forex">Forex</option>
                <option value="Bonds">Títulos / Bonds</option>
                <option value="Crypto">Cripto</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Setor</label>
              <input
                type="text"
                placeholder="Ex: Semiconductors"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">URL Oficial do Gráfico no EquityClock (Opcional)</label>
            <input
              type="url"
              placeholder="https://equityclock.com/charts/..."
              value={equityclockUrl}
              onChange={(e) => setEquityclockUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Cadastrar Ativo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
