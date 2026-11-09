"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  History,
  PhoneCall,
  CreditCard,
  MapPin,
  FileText,
  Users,
  Clock,
  Filter,
  ShieldAlert,
} from "lucide-react";
import NexusHeader from "@/components/NexusHeader";
import StatusBadge from "@/components/StatusBadge";

import { useInvestigation } from "@/components/InvestigationContext";

interface TimelineItem {
  id: string;
  date: string;
  time?: string;
  title: string;
  category: string;
  location: string;
  entities: string[];
  evidenceSource?: string;
  evidence?: string;
  provenance?: string;
  isCritical?: boolean;
  description: string;
}

const fallbackTimelineData: TimelineItem[] = [
  {
    id: "EVT-01",
    date: "May 10, 2026",
    time: "14:22:15 UTC",
    title: "Encrypted VoIP Call: Viktor R. → Alexei M.",
    category: "call",
    location: "Sector 4B Radio Relay",
    entities: ["Viktor R. (Target-01)", "Alexei M. (Target-02)"],
    evidenceSource: "CDR_251",
    isCritical: false,
    description: "3m 41s outbound call preceding maritime vessel docking authorization.",
  },
  {
    id: "EVT-02",
    date: "May 13, 2026",
    time: "09:15:00 UTC",
    title: "High-Value Liquidity Transfer: $320,000 to Mixer",
    category: "transaction",
    location: "Zurich / Blockchain Pool",
    entities: ["Aura Logistics Ltd", "Crypto Vault 0x7F...44b"],
    evidenceSource: "SWIFT_WIRE_741",
    isCritical: true,
    description: "Direct wire disbursement routed through intermediate escrow before automated split.",
  },
];

export default function TimelinePage() {
  const { activeCaseId, activeCaseTitle } = useInvestigation();
  const [filterCat, setFilterCat] = useState<string>("ALL");
  const [events, setEvents] = useState<TimelineItem[]>(fallbackTimelineData);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  React.useEffect(() => {
    if (!activeCaseId) return;
    setIsLoading(true);
    fetch(`/api/investigations/${activeCaseId}/timeline`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          const mapped: TimelineItem[] = data.events.map((e: any) => ({
            id: e.id,
            date: e.date || new Date(e.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
            time: e.timestamp ? new Date(e.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) + " IST" : "00:00 IST",
            title: e.title,
            category: e.category,
            location: e.location || "Jurisdictional Sector",
            entities: e.entities || [],
            evidenceSource: e.evidence || "COURT-RECORD",
            provenance: e.provenance || "COURT_RECORDED",
            isCritical: e.provenance === "COURT_RECORDED" || e.category?.toLowerCase().includes("compromise") || e.category?.toLowerCase().includes("loss") || e.category?.toLowerCase().includes("judicial"),
            description: e.description,
          }));
          setEvents(mapped);
        }
      })
      .catch((err) => console.error("Error fetching timeline:", err))
      .finally(() => setIsLoading(false));
  }, [activeCaseId]);

  const categories = useMemo(() => {
    const set = new Set<string>(["ALL"]);
    events.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set);
  }, [events]);

  const filtered = events.filter((evt) => {
    if (filterCat === "ALL") return true;
    return evt.category.toLowerCase() === filterCat.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col selection:bg-red-600 selection:text-white">
      <NexusHeader
        moduleTitle="TIMELINE ANALYSIS"
        badge="CHRONOLOGICAL FORENSICS"
        activeCase={`${activeCaseId} // ${activeCaseTitle.toUpperCase()}`}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Top Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1b2636]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-sans">
              FORENSIC <span className="text-[#ff3b30] text-glow-red">TIMELINE</span>
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              {activeCaseId}: {events.length} CHRONOLOGICALLY RECONSTRUCTED EVENTS
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-md py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors shrink-0 ${
                  filterCat.toLowerCase() === cat.toLowerCase()
                    ? "bg-red-950 text-red-300 border border-red-700/60 font-semibold"
                    : "bg-[#101722] text-slate-400 hover:text-white border border-[#1e2a3b]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Timeline Container */}
        <section className="relative pl-6 sm:pl-8 space-y-8">
          {/* Vertical Continuous Line */}
          <div className="absolute left-2.5 sm:left-3.5 top-2 bottom-3 w-[2px] bg-gradient-to-b from-[#ff3b30] via-[#39d9ff] to-[#22c55e]" />

          {filtered.map((item) => (
            <div
              key={item.id}
              className={`relative card-nexus p-5 sm:p-6 rounded-xl border ${
                item.isCritical
                  ? "border-red-900/60 bg-[#121522] shadow-lg shadow-red-950/20"
                  : "border-[#1e2a3b] bg-[#101722]"
              }`}
            >
              {/* Timeline Anchor Node Indicator */}
              <div
                className={`absolute -left-[30px] sm:-left-[38px] top-6 w-4 h-4 rounded-full border-2 border-[#05070b] ${
                  item.isCritical
                    ? "bg-[#ff3b30] ring-4 ring-red-500/40 animate-pulse"
                    : "bg-[#39d9ff] ring-2 ring-cyan-500/30"
                }`}
              />

              <div className="space-y-3">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1b2636] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">{item.date}</span>
                    <span className="text-xs font-mono text-[#39d9ff]">• {item.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.isCritical && (
                      <StatusBadge label="CRITICAL EVENT" variant="priority-high" />
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151e2b] text-[#39d9ff] border border-[#1e2a3b]">
                      SOURCE: {item.evidenceSource}
                    </span>
                    {item.provenance && (
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase ${
                          item.provenance === "COURT_RECORDED"
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/50"
                            : item.provenance === "INVESTIGATIVE_MATERIAL"
                            ? "bg-cyan-950/60 text-cyan-300 border-cyan-700/50"
                            : "bg-amber-950/60 text-amber-300 border-amber-700/50"
                        }`}
                      >
                        {item.provenance}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title and Description */}
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide font-sans">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-2 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#ff3b30]" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#39d9ff]" />
                    <span className="truncate">{item.entities.join(" • ")}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
