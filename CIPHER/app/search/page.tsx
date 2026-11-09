"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  User,
  Phone,
  Car,
  MapPin,
  Building,
  CreditCard,
  FolderArchive,
  FileCheck,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Clock,
  RefreshCw,
} from "lucide-react";
import NexusHeader from "@/components/NexusHeader";
import StatusBadge from "@/components/StatusBadge";

interface SearchResultItem {
  id: string;
  name: string;
  type: string;
  relatedCases: string[];
  connectionsCount: number;
  relevance: string;
  source: string;
  category: "people" | "phones" | "vehicles" | "locations" | "cases" | "transactions" | "evidence" | "alerts";
  timestamp?: string;
  targetUrl: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryTimeMs, setQueryTimeMs] = useState(14);

  const fetchResults = useCallback(async (searchQuery: string, cat: string) => {
    setLoading(true);
    const start = performance.now();
    try {
      const url = `/api/search?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(cat)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setResults(data.results);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      const duration = Math.round(performance.now() - start);
      setQueryTimeMs(duration > 0 ? duration : 8);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(query, selectedCat);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, selectedCat, fetchResults]);

  const categories = [
    "ALL",
    "cases",
    "people",
    "phones",
    "vehicles",
    "locations",
    "transactions",
    "evidence",
    "alerts",
  ];

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col selection:bg-red-600 selection:text-white">
      <NexusHeader moduleTitle="CIPHER INTELLIGENCE SEARCH" badge="CROSS-DATABASE" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Search Hero Bar */}
        <section className="space-y-4 max-w-4xl mx-auto text-center pt-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-sans">
            CIPHER INTELLIGENCE <span className="text-[#39d9ff] text-glow-cyan">SEARCH</span>
          </h1>

          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all active criminal syndicates, IMSI, names, plates, bank accounts..."
              className="w-full bg-[#101722] border border-[#1e2a3b] rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#39d9ff] shadow-2xl transition-colors"
            />
            {loading && (
              <RefreshCw className="w-4 h-4 text-cyan-400 absolute right-4 top-1/2 -translate-y-1/2 animate-spin" />
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pt-2 text-xs font-mono scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg uppercase transition-colors shrink-0 ${
                  selectedCat === cat
                    ? "bg-red-950 text-red-300 border border-red-700/60 font-semibold shadow-sm"
                    : "bg-[#101722] text-slate-400 hover:text-white border border-[#1e2a3b]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Results Stream */}
        <section className="space-y-3 max-w-5xl mx-auto">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 pb-1">
            <span>INDEXED INTELLIGENCE RESULTS ({results.length})</span>
            <span>QUERY TIME: {queryTimeMs}ms</span>
          </div>

          {results.length === 0 && !loading ? (
            <div className="p-12 text-center bg-[#101722] border border-[#1e2a3b] rounded-2xl space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-white">No Intelligence Matches</div>
              <p className="text-xs text-slate-400">
                No matching entities, evidence exhibits, or telecom intercepts found for query &ldquo;{query}&rdquo;.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((item) => (
                <div
                  key={item.id}
                  className="card-nexus p-5 rounded-xl border border-[#1e2a3b] bg-[#101722] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#39d9ff] transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[10px] font-mono font-bold text-[#39d9ff] bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                        {item.id}
                      </span>
                      <h3 className="text-sm font-bold text-white font-sans">{item.name}</h3>
                      <StatusBadge label={item.relevance} variant="verified" />
                    </div>

                    <p className="text-xs text-slate-300 font-sans">{item.type}</p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                      <span>Source: <span className="text-white">{item.source}</span></span>
                      <span>Cases: <span className="text-[#39d9ff]">{item.relatedCases.join(", ")}</span></span>
                      <span>Connections: <span className="text-white">{item.connectionsCount}</span></span>
                      {item.timestamp && (
                        <span>Date: <span className="text-slate-300">{new Date(item.timestamp).toLocaleDateString()}</span></span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={item.targetUrl || "/entities"}
                      className="px-4 py-2 rounded-lg bg-[#151e2b] hover:bg-[#1a2638] text-xs font-mono text-[#39d9ff] border border-[#1e2a3b] flex items-center gap-1.5 transition-colors"
                    >
                      <span>View Record</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
