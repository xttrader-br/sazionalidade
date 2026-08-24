"use client";

import React, { useState } from "react";
import {
  Terminal,
  Play,
  Copy,
  Check,
  BookOpen,
  Zap,
  Server,
  Database,
  HardDrive
} from "lucide-react";

export default function ScraperGuideAndApiDocs() {
  const [activeTab, setActiveTab] = useState<"sqlite" | "guide" | "python" | "node" | "playground">("sqlite");
  const [copied, setCopied] = useState<string | null>(null);

  // API Playground state
  const [apiEndpoint, setApiEndpoint] = useState<string>("/api/v1/bias?ticker=SPX");
  const [apiMethod, setApiMethod] = useState<"GET" | "POST">("GET");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const runApiCall = async () => {
    setApiLoading(true);
    try {
      const res = await fetch(apiEndpoint, { method: apiMethod });
      const data = await res.json();
      setApiResponse(data);
    } catch (err: unknown) {
      setApiResponse({ error: err instanceof Error ? err.message : "unknown error" });
    } finally {
      setApiLoading(false);
    }
  };

  const PYTHON_SCRAPER_CODE = `# Scraper em Python para extrair dados do EquityClock
import requests
from bs4 import BeautifulSoup
import json

def scrape_equityclock_asset(ticker):
    url = f"https://equityclock.com/charts/{ticker.lower()}-seasonal-chart/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Erro ao acessar {url}")
        return None

    soup = BeautifulSoup(response.text, 'html.parser')
    title = soup.find('h1').text if soup.find('h1') else ticker
    paragraphs = [p.text for p in soup.find_all('p')]
    summary_text = " ".join(paragraphs[:5])
    
    return {
        "ticker": ticker.upper(),
        "title": title,
        "url": url,
        "summary": summary_text[:300] + "..."
    }

if __name__ == "__main__":
    result = scrape_equityclock_asset("spx")
    print(json.dumps(result, indent=2, ensure_ascii=False))
`;

  const NODE_SCRAPER_CODE = `// Scraper em Node.js com Cheerio e Axios
const axios = require('axios');
const cheerio = require('cheerio');

async function getEquityClockBias(ticker) {
  const url = \`https://equityclock.com/charts/\${ticker.toLowerCase()}-seasonal-chart/\`;
  
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
    });

    const $ = cheerio.load(data);
    const title = $('h1.entry-title').text().trim() || ticker;
    const contentText = $('.entry-content p').first().text();

    return {
      ticker: ticker.toUpperCase(),
      title,
      url,
      firstParagraph: contentText,
      scrapedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(\`Erro ao raspar \${ticker}:\`, error.message);
    return null;
  }
}

getEquityClockBias('gld').then(console.log);
`;

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Banner Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Banco de Dados SQLite Integrado (Zero Configuração Externa)
            </h2>
            <p className="text-xs text-slate-400">
              O projeto roda 100% de forma autônoma salvando dados em arquivo SQLite local (`sqlite.db`), sem exigir nenhum serviço de banco de dados externo.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveTab("sqlite")}
            className={`px-3 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
              activeTab === "sqlite"
                ? "bg-emerald-600 text-white font-semibold shadow-md"
                : "bg-slate-950 text-emerald-400 hover:text-emerald-200 border border-emerald-800/60"
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>📁 SQLite Local em Arquivo</span>
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`px-3 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
              activeTab === "guide"
                ? "bg-emerald-600 text-white font-semibold shadow-md"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Entendendo o Bias no EquityClock</span>
          </button>

          <button
            onClick={() => setActiveTab("python")}
            className={`px-3 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
              activeTab === "python"
                ? "bg-emerald-600 text-white font-semibold shadow-md"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>2. Scraper Python</span>
          </button>

          <button
            onClick={() => setActiveTab("node")}
            className={`px-3 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
              activeTab === "node"
                ? "bg-emerald-600 text-white font-semibold shadow-md"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Server className="w-4 h-4" />
            <span>3. Scraper Node.js</span>
          </button>

          <button
            onClick={() => setActiveTab("playground")}
            className={`px-3 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
              activeTab === "playground"
                ? "bg-cyan-600 text-white font-semibold shadow-md"
                : "bg-slate-950 text-cyan-400 hover:text-cyan-200 border border-cyan-800/60"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>4. API REST Playground</span>
          </button>
        </div>
      </div>

      {/* Tab Content: SQLite Details */}
      {activeTab === "sqlite" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-2 border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-400" />
              Vantagens do Banco de Dados SQLite em Arquivo Local
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Não é necessário instalar PostgreSQL, Docker ou contratar bancos de dados na nuvem! O aplicativo gerencia um banco de dados relacional em arquivo `sqlite.db` local com **libSQL** e **Drizzle ORM**.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Auto-Inicialização
              </h4>
              <p className="text-slate-400">
                Na primeira execução, o sistema cria as tabelas e popula dados históricos de 20 anos automaticamente.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> Alta Performance WAL
              </h4>
              <p className="text-slate-400">
                O arquivo SQLite opera no modo WAL (Write-Ahead Logging), garantindo leitura/escrita ultrarrápidas sem concorrência.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-cyan-400" /> Drizzle ORM Type-Safe
              </h4>
              <p className="text-slate-400">
                Todas as consultas e endpoints contam com validação de tipos TypeScript nativa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 1: Guide */}
      {activeTab === "guide" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Como Funciona a Leitura do Bias em EquityClock.com?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              O portal <strong>EquityClock</strong> analisa mais de 20 a 50 anos de cotações diárias e mensais de ações, commodities, índices (como o S&P 500) e moedas para identificar <strong>viés sazonal (Seasonal Bias)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase">1. Win Rate (%)</div>
              <h4 className="text-sm font-semibold text-white">Taxa de Ganho Histórica</h4>
              <p className="text-xs text-slate-400">
                Mede a porcentagem de anos em que o ativo fechou no positivo naquele mês específico. Exemplo: Se o S&P 500 subiu em 16 dos últimos 20 Novembro, o Win Rate é de <strong>80%</strong>.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-cyan-400 uppercase">2. Retorno Médio Mensal</div>
              <h4 className="text-sm font-semibold text-white">Ganho ou Perda Médio</h4>
              <p className="text-xs text-slate-400">
                Calcula a variação percentual média histórica em determinado mês ou período comercial para mensurar a magnitude do movimento.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase">3. Janelas Sazonais</div>
              <h4 className="text-sm font-semibold text-white">Datas de Entrada & Saída</h4>
              <p className="text-xs text-slate-400">
                Períodos de início e término recorrentes (ex: Janela Bullish do Ouro de 20 de Dezembro a 24 de Fevereiro, ou o rally do Petróleo na Primavera).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Python Code */}
      {activeTab === "python" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Código Python para Raspagem Automática de Dados do EquityClock
            </h3>
            <button
              onClick={() => copyToClipboard(PYTHON_SCRAPER_CODE, "python")}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
            >
              {copied === "python" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === "python" ? "Copiado!" : "Copiar Código"}</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-300 overflow-x-auto">
            {PYTHON_SCRAPER_CODE}
          </pre>
        </div>
      )}

      {/* Tab Content 3: Node.js Code */}
      {activeTab === "node" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Código Node.js / Cheerio para Integração
            </h3>
            <button
              onClick={() => copyToClipboard(NODE_SCRAPER_CODE, "node")}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
            >
              {copied === "node" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === "node" ? "Copiado!" : "Copiar Código"}</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-cyan-300 overflow-x-auto">
            {NODE_SCRAPER_CODE}
          </pre>
        </div>
      )}

      {/* Tab Content 4: Interactive API Playground */}
      {activeTab === "playground" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-2 border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-cyan-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Playground de API REST Interativo
            </h3>
            <p className="text-xs text-slate-400">
              Testes os endpoints REST diretamente nesta aplicação para obter bias sazonal em formato JSON.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-semibold block">Exemplos Prontos de Requisição:</span>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                onClick={() => { setApiEndpoint("/api/v1/bias?ticker=SPX"); setApiMethod("GET"); }}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-cyan-500 rounded-lg text-slate-300 font-mono"
              >
                GET Bias do S&P 500 (/api/v1/bias?ticker=SPX)
              </button>

              <button
                onClick={() => { setApiEndpoint("/api/v1/bias?bias=bullish"); setApiMethod("GET"); }}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-lg text-emerald-400 font-mono"
              >
                GET Todos Ativos Bullish Hoje
              </button>

              <button
                onClick={() => { setApiEndpoint("/api/v1/seasonality/GLD"); setApiMethod("GET"); }}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-amber-500 rounded-lg text-amber-300 font-mono"
              >
                GET Sazonalidade Ouro (/api/v1/seasonality/GLD)
              </button>

              <button
                onClick={() => { setApiEndpoint("/api/v1/screener?minWinRate=70"); setApiMethod("GET"); }}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-purple-500 rounded-lg text-purple-300 font-mono"
              >
                GET Screener (Win Rate &gt; 70%)
              </button>

              <button
                onClick={() => { setApiEndpoint("/api/v1/sync"); setApiMethod("POST"); }}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-lg text-blue-300 font-mono"
              >
                POST Sincronizar Cotacoes (/api/v1/sync)
              </button>
            </div>
          </div>

          {/* Request Input Bar */}
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${apiMethod === "GET" ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"}`}>
              {apiMethod}
            </span>
            <input
              type="text"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              className="flex-1 bg-transparent border-none text-xs font-mono text-white focus:outline-none"
            />
            <button
              onClick={runApiCall}
              disabled={apiLoading}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{apiLoading ? "Executando..." : "Enviar Requisição"}</span>
            </button>
          </div>

          {/* Response JSON Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold font-mono">Resposta JSON (200 OK):</span>
              {apiResponse && (
                <button
                  onClick={() => copyToClipboard(JSON.stringify(apiResponse, null, 2), "apiResponse")}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {copied === "apiResponse" ? "Copiado!" : "Copiar JSON"}
                </button>
              )}
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-cyan-300 max-h-96 overflow-y-auto">
              {apiResponse
                ? JSON.stringify(apiResponse, null, 2)
                : "// Clique em Enviar Requisição para ver os dados retornados pela API em tempo real."}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
