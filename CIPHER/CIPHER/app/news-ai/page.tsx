"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe2,
  Radio,
  Search,
  Filter,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Building,
  Anchor,
  Coins,
  Cpu,
  RefreshCw,
} from "lucide-react";
import NexusHeader from "@/components/NexusHeader";
import ConstellationCanvas from "@/components/ConstellationCanvas";

interface NewsItem {
  id: string;
  headline: string;
  source: string;
  timestamp: string;
  category: "maritime" | "crypto" | "contraband" | "warrant";
  severity: "CRITICAL" | "HIGH" | "MONITORED";
  summary: string;
  relatedEntities: string[];
  relevanceScore: string;
  suggestedPrompt: string;
}

const OSINT_NEWS: NewsItem[] = [
  {
    id: "NEWS-2026-081",
    headline: "Customs Inspection Discrepancies Flagged on North Sea Container Freight",
    source: "Maritime Security Intelligence Wire (MSIW)",
    timestamp: "18 minutes ago",
    category: "maritime",
    severity: "CRITICAL",
    summary:
      "Rotterdam Port Authority confirms unannounced inspection order for commercial freighters inbound from Mediterranean corridors. Manifest discrepancies detected in heavy machinery compartments.",
    relatedEntities: ["Rotterdam Quay Warehouse #4", "MV Northern Star", "Aura Logistics Ltd"],
    relevanceScore: "99.2% Case Overlap",
    suggestedPrompt: "Analyze the connection between Rotterdam Quay inspection discrepancies and TARGET-01",
  },
  {
    id: "NEWS-2026-079",
    headline: "Financial Crimes Taskforce Issues Advisory on Sanctioned TRC-20 Mixers",
    source: "Financial Action Cyber Monitor",
    timestamp: "1 hour ago",
    category: "crypto",
    severity: "HIGH",
    summary:
      "Over $42M in decentralized stablecoin liquidity flagged across decentralized mixing smart contracts. Intermediary wallets identified using multi-hop hop-by-hop dispersal layers.",
    relatedEntities: ["Crypto Vault 0x7F...44b", "PanGlobal Trading", "TARGET-01"],
    relevanceScore: "96.5% Case Overlap",
    suggestedPrompt: "Track $320k USDT flow from Aura Logistics through sanctioned mixing pools",
  },
  {
    id: "NEWS-2026-074",
    headline: "Interpol Red Notice Coordinated for Transnational Logistics Shell Fronts",
    source: "European Law Enforcement Bulletin",
    timestamp: "3 hours ago",
    category: "warrant",
    severity: "HIGH",
    summary:
      "Joint judicial warrants executed across Cypriot and Benelux maritime registries. Investigators highlight front logistics companies used for illicit container customs bypass.",
    relatedEntities: ["Aura Logistics Ltd", "Limassol Registry", "Elena Rostova"],
    relevanceScore: "94.8% Case Overlap",
    suggestedPrompt: "What is the corporate structure and direct links of Aura Logistics Ltd?",
  },
  {
    id: "NEWS-2026-068",
    headline: "Black Armored Transport Fleet Observed Near Antwerp Freight Terminals",
    source: "Regional ANPR Highway Surveillance",
    timestamp: "5 hours ago",
    category: "contraband",
    severity: "MONITORED",
    summary:
      "Highway telemetry detects repeated convoy movements of unregistered armored SUVs matching vehicle profiles in active narcotics transport investigations.",
    relatedEntities: ["Black Armored SUV (TX-89)", "Mark V.", "Dock Warehouse #4"],
    relevanceScore: "92.1% Case Overlap",
    suggestedPrompt: "Reconstruct vehicle movements of Black Armored SUV TX-89 around Dock Warehouse #4",
  },
];

export default function NewsAIPage() {
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const handleAnalyzeWithAI = (item: NewsItem) => {
    if (analyzingId) return;
    setAnalyzingId(item.id);

    // Capture complete structured context
    const payload = {
      id: item.id,
      headline: item.headline,
      source: item.source,
      timestamp: item.timestamp,
      category: item.category,
      severity: item.severity,
      summary: item.summary,
      relatedEntities: item.relatedEntities,
      relevanceScore: item.relevanceScore,
      suggestedPrompt: item.suggestedPrompt,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("cipher_analyze_news_item", JSON.stringify(payload));
    }

    router.push(`/ai-assistant?analyzeNewsId=${item.id}`);
  };

  const filteredNews = OSINT_NEWS.filter((item) => {
    const matchesCat = filterCategory === "ALL" || item.category === filterCategory;
    const matchesQuery =
      searchQuery === "" ||
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.relatedEntities.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col selection:bg-red-600 selection:text-white">
      {/* Background Ambience and Particles */}
      <div className="fixed inset-0 pointer-events-none digital-overlay opacity-30 z-0" />
      <ConstellationCanvas className="fixed inset-0 pointer-events-none z-0" particleDensity={18000} />

      {/* Header */}
      <NexusHeader moduleTitle="NEWS AI // OSINT INTELLIGENCE" badge="LIVE WIRE" />

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Top Title Banner */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b2636]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-500/50 flex items-center justify-center text-[#39d9ff]">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase font-sans flex items-center gap-2">
                <span>NEWS AI</span>
                <span className="text-[#39d9ff]">OSINT STREAM</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  REAL-TIME WIRE
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101722] hover:bg-[#151e2b] border border-[#1e2a3b] text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Refresh Wire</span>
            </button>
          </div>
        </section>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d1424] border border-[#1a263c] p-3 rounded-xl font-mono text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search intelligence wires, entities, vessels, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080d19] border border-[#172338] rounded-lg pl-9 pr-3 py-2 text-xs text-gray-100 placeholder-slate-500 focus:outline-none focus:border-[#39d9ff]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "ALL", label: "ALL WIRES" },
              { id: "maritime", label: "MARITIME" },
              { id: "crypto", label: "CRYPTO FLOWS" },
              { id: "contraband", label: "CONTRABAND" },
              { id: "warrant", label: "WARRANTS" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] uppercase transition-colors shrink-0 ${
                  filterCategory === tab.id
                    ? "bg-red-950/80 text-white border border-red-700/60 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#131d32]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* News Bulletins Grid */}
        <div className="space-y-4">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#0a0f1b] border border-[#172338] hover:border-red-600/40 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      item.severity === "CRITICAL"
                        ? "bg-red-950/80 text-[#ff3b30] border-red-800/80 shadow-[0_0_8px_rgba(255,59,48,0.3)]"
                        : item.severity === "HIGH"
                        ? "bg-orange-950/80 text-orange-400 border-orange-800/60"
                        : "bg-[#101724] text-cyan-400 border-cyan-800/60"
                    }`}
                  >
                    {item.severity}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{item.source}</span>
                  <span className="text-slate-600 font-mono">•</span>
                  <span className="text-xs font-mono text-slate-500">{item.timestamp}</span>
                </div>

                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                  {item.relevanceScore}
                </span>
              </div>

              <h2 className="text-base font-bold text-white tracking-wide font-sans">
                {item.headline}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {item.summary}
              </p>

              {/* Linked Entities and AI Consultation Button */}
              <div className="pt-3 border-t border-[#141e30] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Linked Entities:
                  </span>
                  {item.relatedEntities.map((ent, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#10192b] border border-[#19263e] text-[11px] font-mono text-cyan-300"
                    >
                      {ent}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={analyzingId === item.id}
                  onClick={() => handleAnalyzeWithAI(item)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-950/80 to-cyan-950/50 border border-red-700/60 hover:border-red-400 text-red-300 hover:text-white text-xs font-mono font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group"
                >
                  {analyzingId === item.id ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-[#ff3b30] animate-spin" />
                      <span className="text-[#ff3b30] font-bold animate-pulse">ANALYZING WITH CIPHER AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#ff3b30] group-hover:scale-110 transition-transform" />
                      <span>Analyze with CIPHER AI</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
