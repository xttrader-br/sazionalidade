"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  Calendar,
  Award,
  Activity,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Layers
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  ReferenceLine
} from "recharts";
import BiasBadge from "./BiasBadge";

interface AssetDetailModalProps {
  ticker: string | null;
  onClose: () => void;
}

export default function AssetDetailModal({ ticker, onClose }: AssetDetailModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartTab, setChartTab] = useState<"cumulative" | "winrate" | "monthlyReturn">("cumulative");

  useEffect(() => {
    if (!ticker) return;

    setLoading(true);
    setError(null);

    fetch(`/api/v1/seasonality/${ticker}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.error || "Erro ao carregar dados do ativo.");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (!ticker) return null;

  const currentMonthNum = new Date().getMonth() + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl font-mono text-lg font-bold text-emerald-400 shadow-inner">
              {ticker}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  {data?.asset?.name || ticker}
                </h2>
                {data?.asset?.category && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {data.asset.category}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {data?.asset?.sector ? `Setor: ${data.asset.sector} • ` : ""}
                Análise Sazonal Histórica (20 Anos)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {data?.asset?.equityclockUrl && (
              <a
                href={data.asset.equityclockUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg transition"
              >
                <span>EquityClock Original</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-slate-400">Carregando métricas e gráfico sazonal de {ticker}...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-center space-y-2">
              <p className="font-semibold">{error}</p>
            </div>
          ) : data ? (
            <>
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Bias Ativo Atual</span>
                  <BiasBadge bias={data.activeBias} size="md" />
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1">Preço Atual / Variação</span>
                  <div className="font-mono text-sm font-semibold text-white">
                    ${data.technicals?.lastPrice || data.asset?.lastPrice || "N/A"}
                    <span
                      className={`ml-2 text-xs ${
                        (data.technicals?.dayChangePct || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {(data.technicals?.dayChangePct || 0) >= 0 ? "+" : ""}
                      {data.technicals?.dayChangePct || 0}%
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1">Score de Confluência</span>
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-sm font-bold text-amber-400">
                      {data.technicals?.confluenceScore || 75} / 100
                    </div>
                    <span className="text-[10px] text-slate-500">(Técnico + Sazonal)</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1">Janela Sazonal Ativa</span>
                  <div className="text-xs font-medium text-emerald-300 truncate">
                    {data.activeWindow ? data.activeWindow.title : "Nenhuma janela específica hoje"}
                  </div>
                </div>
              </div>

              {/* Interactive Seasonal Charts Section */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Gráfico Histórico Sazonal de 12 Meses (20 Anos)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Progressão mensal média acumulada de Janeiro a Dezembro.
                    </p>
                  </div>

                  {/* Chart Tabs */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setChartTab("cumulative")}
                      className={`px-3 py-1 rounded-md transition font-medium ${
                        chartTab === "cumulative"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Tendência Acumulada
                    </button>
                    <button
                      onClick={() => setChartTab("winrate")}
                      className={`px-3 py-1 rounded-md transition font-medium ${
                        chartTab === "winrate"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Win Rate (%)
                    </button>
                    <button
                      onClick={() => setChartTab("monthlyReturn")}
                      className={`px-3 py-1 rounded-md transition font-medium ${
                        chartTab === "monthlyReturn"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Retorno Médio (%)
                    </button>
                  </div>
                </div>

                {/* Chart Rendering */}
                <div className="h-64 sm:h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartTab === "cumulative" ? (
                      <AreaChart data={data.monthly} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
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
                          formatter={(value: any) => [`${value} (Base 100)`, "Índice Acumulado"]}
                          labelFormatter={(label) => `Mês: ${label}`}
                        />
                        <ReferenceLine
                          x={data.monthly.find((m: any) => m.month === currentMonthNum)?.monthName}
                          stroke="#f59e0b"
                          strokeDasharray="4 4"
                          label={{ value: "Mês Atual", fill: "#f59e0b", fontSize: 10, position: "top" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="cumulativeIndex"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorIndex)"
                        />
                      </AreaChart>
                    ) : chartTab === "winrate" ? (
                      <BarChart data={data.monthly} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                        <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} unit="%" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#f8fafc",
                          }}
                          formatter={(value: any) => [`${value}%`, "Taxa de Acerto (Win Rate)"]}
                        />
                        <ReferenceLine y={50} stroke="#64748b" strokeDasharray="3 3" />
                        <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                          {data.monthly.map((entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.winRate >= 65 ? "#10b981" : entry.winRate <= 45 ? "#f43f5e" : "#0284c7"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <BarChart data={data.monthly} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                        <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#f8fafc",
                          }}
                          formatter={(value: any) => [`${value}%`, "Retorno Médio no Mês"]}
                        />
                        <ReferenceLine y={0} stroke="#64748b" />
                        <Bar dataKey="avgReturn" radius={[4, 4, 0, 0]}>
                          {data.monthly.map((entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.avgReturn > 0 ? "#10b981" : "#f43f5e"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Trade Setups / Seasonal Windows Table */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Janelas Sazonais Históricas & Setups do EquityClock
                </h3>

                {data.windows && data.windows.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {data.windows.map((w: any) => (
                      <div
                        key={w.id}
                        className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-slate-200">{w.title}</h4>
                          <BiasBadge bias={w.bias} size="sm" />
                        </div>
                        <p className="text-xs text-slate-400">{w.description}</p>
                        <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/80 text-slate-300 font-mono">
                          <div>
                            Período: <span className="text-amber-300 font-semibold">{w.startMonth}/{w.startDay} → {w.endMonth}/{w.endDay}</span>
                          </div>
                          <div>
                            Win Rate: <span className="text-emerald-400 font-semibold">{w.winRate}%</span>
                          </div>
                          <div>
                            Ret. Méc.: <span className="text-cyan-400 font-semibold">+{w.avgReturn}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic bg-slate-950 p-4 rounded-xl border border-slate-800">
                    Nenhuma janela sazonal cadastrada para este ativo.
                  </p>
                )}
              </div>

              {/* Technical Indicators & Commentary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Technical Confluence Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" /> Indicadores Técnicos Complementares
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">RSI 14 Dias:</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {data.technicals?.rsi14 ?? 52.0}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Acima Média Movel 50 Dias (SMA 50):</span>
                      <span className={`font-semibold ${data.technicals?.aboveSma50 ? "text-emerald-400" : "text-rose-400"}`}>
                        {data.technicals?.aboveSma50 ? "Sim (Bullish)" : "Não (Bearish)"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Acima Média Movel 200 Dias (SMA 200):</span>
                      <span className={`font-semibold ${data.technicals?.aboveSma200 ? "text-emerald-400" : "text-rose-400"}`}>
                        {data.technicals?.aboveSma200 ? "Sim (Tendência de Alta)" : "Não (Tendência Baixista)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* EquityClock Notes */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400" /> Notas & Análises do EquityClock
                  </h4>
                  <div className="text-xs text-slate-300 space-y-2">
                    <p className="leading-relaxed">
                      {data.asset?.description ||
                        `Análise sazonal baseada nos padrões dos últimos 20 anos para ${ticker}. O EquityClock calcula a taxa de ganho e retornos médios mensais para apontar as janelas de maior probabilidade.`}
                    </p>
                    <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800">
                      <span>Fonte Oficial: EquityClock Charts</span>
                      <a
                        href={data.asset?.equityclockUrl || "https://equityclock.com"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        Ver gráfico original <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
