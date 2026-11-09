"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldAlert,
  User,
  Phone,
  Car,
  MapPin,
  Building,
  CreditCard,
  Briefcase,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Lock,
  FileCheck,
  Search,
  Clock,
  Radio,
  Share2,
  FileText,
  Activity,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import NexusHeader from "@/components/NexusHeader";
import { useAuth } from "@/components/AuthProvider";
import StatusBadge from "@/components/StatusBadge";
import InteractiveNetworkGraph from "@/components/InteractiveNetworkGraph";
import { InvestigationRecord } from "@/lib/investigation-service";

function WorkspaceInner() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id") || searchParams.get("caseId") || "INV-2026-0142";
  const { user } = useAuth();

  const [investigation, setInvestigation] = useState<InvestigationRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "network"
    | "entities"
    | "timeline"
    | "locations"
    | "communications"
    | "transactions"
    | "evidence"
    | "ai-insights"
  >("overview");

  useEffect(() => {
    async function loadInvestigation() {
      setLoading(true);
      try {
        const res = await fetch(`/api/investigations/${encodeURIComponent(idParam)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.investigation) {
            setInvestigation(data.investigation);
          }
        }
      } catch (err) {
        console.error("Failed to load investigation workspace dossier:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInvestigation();
  }, [idParam]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "network", label: "Network" },
    { id: "entities", label: "Entities" },
    { id: "timeline", label: "Timeline" },
    { id: "locations", label: "Locations" },
    { id: "communications", label: "Communications" },
    { id: "transactions", label: "Transactions" },
    { id: "evidence", label: "Evidence" },
    { id: "ai-insights", label: "AI Insights" },
  ];

  const currentTitle = investigation?.title || "Operation Nexus";
  const currentCaseId = investigation?.caseId || "INV-2026-0142";
  const currentLead = investigation?.leadInvestigator || (user ? `${user.name} (${user.role} ${user.clearanceLevel})` : "Amit Sharma (Lead Analyst L3)");
  const currentJurisdiction =
    investigation?.jurisdiction || "Rotterdam Maritime Port / North America Corridor";
  const currentPriority = investigation?.priority || "HIGH";
  const currentStatus = investigation?.status || "ACTIVE";
  const currentDesc =
    investigation?.description ||
    "Cross-jurisdictional narcotics, maritime port logistics, and multi-tier crypto laundering syndicate.";

  const entityStats = [
    { label: "Persons", count: 12, icon: User, color: "text-[#39d9ff] bg-[#121f30] border-[#1e3450]" },
    { label: "Phones", count: 8, icon: Phone, color: "text-[#22d3ee] bg-[#121f30] border-[#1e3450]" },
    { label: "Vehicles", count: 4, icon: Car, color: "text-amber-400 bg-amber-950/40 border-amber-800/40" },
    { label: "Locations", count: 6, icon: MapPin, color: "text-purple-400 bg-purple-950/40 border-purple-800/40" },
    { label: "Organizations", count: 3, icon: Building, color: "text-rose-400 bg-rose-950/40 border-rose-800/40" },
    { label: "Financial Accounts", count: 5, icon: CreditCard, color: "text-yellow-400 bg-yellow-950/40 border-yellow-800/40" },
  ];

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col selection:bg-red-600 selection:text-white">
      <NexusHeader moduleTitle="CIPHER WORKSPACE" badge={currentCaseId} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Dossier Header Section */}
        <div className="card-nexus p-6 sm:p-8 rounded-2xl bg-[#101722] border border-[#1e2a3b] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#1b2636]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center justify-center text-[#ff3b30] shadow-inner shrink-0">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-sans">
                    {currentTitle}
                  </h1>
                  <span className="text-xs font-mono font-bold text-[#ff3b30] bg-red-950/50 border border-red-800/50 px-2 py-0.5 rounded">
                    {currentCaseId}
                  </span>
                  {investigation?.graphSyncStatus && (
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                      Graph: {investigation.graphSyncStatus}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Jurisdiction: {currentJurisdiction} • Lead Analyst: {currentLead}
                </p>
              </div>
            </div>

            {/* Status & Action Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge
                label={`${currentStatus} INVESTIGATION`}
                variant={currentStatus === "ACTIVE" ? "active" : "neutral"}
                size="md"
              />
              <StatusBadge
                label={`${currentPriority} PRIORITY`}
                variant={
                  currentPriority === "HIGH" || currentPriority === "CRITICAL"
                    ? "priority-high"
                    : currentPriority === "MEDIUM"
                    ? "priority-medium"
                    : "priority-low"
                }
                size="md"
              />
              <Link
                href="/ai-assistant"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-950 to-indigo-950 text-purple-300 border border-purple-700/50 text-xs font-mono font-semibold hover:border-purple-400 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>CIPHER AI Query</span>
              </Link>
            </div>
          </div>

          {/* Horizontal Navigation Tabs */}
          <nav className="overflow-x-auto border-b border-[#1b2636] pb-1">
            <ul className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-mono tracking-wider whitespace-nowrap min-w-max">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`pb-3 font-semibold transition-all border-b-2 uppercase ${
                      activeTab === tab.id
                        ? "text-white border-[#ff3b30] text-glow-red"
                        : "text-slate-500 hover:text-slate-300 border-transparent"
                    }`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* TAB CONTENT */}

          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6 pt-2">
              {/* Case Summary Statement */}
              <div className="bg-[#0b1018] border border-[#182333] rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                    Executive Case Intelligence Summary
                  </span>
                  <span className="text-[11px] font-mono text-[#39d9ff]">
                    ACTIVE REPOSITORY SYNCHRONIZED
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {currentDesc}
                </p>
              </div>

              {/* Entity Distribution Stats Grid */}
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">
                  Resolved Forensic Entity Counts
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {entityStats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={i}
                        className="bg-[#0b1018] border border-[#182333] p-3.5 rounded-xl flex items-center gap-3"
                      >
                        <div className={`p-2 rounded-lg border ${stat.color} shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-base font-bold text-white font-mono block leading-none">
                            {stat.count}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-1">
                            {stat.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mini Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {/* Tactical Graph Preview */}
                <div className="bg-[#0b1018] border border-[#182333] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                      Network Topology Core
                    </span>
                    <Link
                      href="/network-analysis"
                      className="text-xs font-mono text-[#39d9ff] hover:underline flex items-center gap-1"
                    >
                      <span>Full Screen Graph</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="h-[220px] rounded-lg overflow-hidden border border-[#1a2638]">
                    <InteractiveNetworkGraph height="h-[220px]" showInspector={false} />
                  </div>
                </div>

                {/* AI Anomaly Insights */}
                <div className="bg-[#0b1018] border border-[#182333] rounded-xl p-5 space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                      Neural Anomaly Telemetry
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                      94% CONFIDENCE
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#101722] border border-[#1e2a3b] text-xs text-slate-300 space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold font-sans">
                      <Sparkles className="w-3.5 h-3.5 text-[#39d9ff]" />
                      <span>Bridge Entity Topology Isolation</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      TARGET-01 functions as sole communication conduit connecting port manifest logistics with Limassol offshore holding accounts.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#182333] flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Case ID: {currentCaseId}</span>
                    <Link
                      href="/ai-assistant"
                      className="text-[#39d9ff] hover:underline flex items-center gap-1"
                    >
                      <span>Launch AI Chat</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. NETWORK TAB */}
          {activeTab === "network" && (
            <div className="space-y-4 pt-2">
              <InteractiveNetworkGraph height="h-[620px]" showInspector={true} />
            </div>
          )}

          {/* 3. ENTITIES TAB */}
          {activeTab === "entities" && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">
                  Identified Entities Linked to {currentCaseId}
                </span>
                <Link
                  href="/entities"
                  className="text-xs font-mono text-[#39d9ff] hover:underline flex items-center gap-1"
                >
                  <span>Open Full Intelligence Dossier</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "TARGET-01 (Viktor R.)", type: "Suspect / Organizer", risk: "CRITICAL", links: 5, details: "Primary syndicate orchestrator." },
                  { name: "SUSPECT-02 (Alexei M.)", type: "Logistics Enforcer", risk: "HIGH", links: 4, details: "Oversees maritime transshipment." },
                  { name: "Aura Logistics Holding", type: "Shell Corporation", risk: "HIGH", links: 4, details: "Registered freight front in Limassol." },
                  { name: "Black Armored SUV (TX-89)", type: "Reinforced Vehicle", risk: "MEDIUM", links: 3, details: "Tracked across 4 border crossings." },
                  { name: "Crypto Vault 0x7F...44b", type: "Financial Pool", risk: "CRITICAL", links: 2, details: "$640k tether liquidity pool." },
                  { name: "Dock Warehouse #4", type: "Physical Location", risk: "HIGH", links: 2, details: "Maritime staging facility." },
                ].map((ent, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#0b1018] border border-[#182333] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[180px]">{ent.name}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border font-mono ${
                        ent.risk === "CRITICAL"
                          ? "bg-red-950 text-red-400 border-red-800"
                          : "bg-orange-950 text-orange-400 border-orange-800"
                      }`}>
                        {ent.risk}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{ent.details}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-[#141f33]">
                      <span>{ent.type}</span>
                      <span className="text-[#39d9ff]">{ent.links} forensic links</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. TIMELINE TAB */}
          {activeTab === "timeline" && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">
                  Forensic Event Log ({currentCaseId})
                </span>
                <Link
                  href="/timeline"
                  className="text-xs font-mono text-[#39d9ff] hover:underline flex items-center gap-1"
                >
                  <span>Open Full Interactive Timeline</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  { time: "2026-05-10 09:14 UTC", cat: "COMMUNICATIONS", text: "Burner terminal +1 (555) 019-2834 activated in Limassol Sector 3." },
                  { time: "2026-05-11 14:22 UTC", cat: "INTERCEPT", text: "Voice call intercepted between TARGET-01 and SUSPECT-02 discussing container 89-TX." },
                  { time: "2026-05-11 18:45 UTC", cat: "FINANCIAL", text: "$320,000 USDT routed to decentralized mixer protocol." },
                  { time: "2026-05-12 11:30 UTC", cat: "EVIDENCE", text: "Security cameras bypassed for 18 minutes; physical seal altered at Dock Warehouse #4." },
                ].map((item, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#0b1018] border border-[#182333] flex items-start gap-4 text-xs font-mono">
                    <span className="text-[#ff3b30] font-bold shrink-0">{item.time}</span>
                    <span className="text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40 text-[10px] shrink-0">
                      {item.cat}
                    </span>
                    <span className="text-slate-300 font-sans">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5-9. OTHER TABS (Locations, Communications, Transactions, Evidence, AI Insights) */}
          {(activeTab === "locations" ||
            activeTab === "communications" ||
            activeTab === "transactions" ||
            activeTab === "evidence" ||
            activeTab === "ai-insights") && (
            <div className="p-8 rounded-xl bg-[#0b1018] border border-[#182333] text-center space-y-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                {activeTab.toUpperCase()} TELEMETRY FOR {currentCaseId}
              </span>
              <p className="text-xs text-slate-300 max-w-lg mx-auto font-sans">
                Active records synchronized with the primary forensic evidence vault. Cross-correlated across 5 intelligence feeds.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link
                  href={
                    activeTab === "locations"
                      ? "/geospatial"
                      : activeTab === "evidence"
                      ? "/evidence"
                      : activeTab === "ai-insights"
                      ? "/ai-assistant"
                      : "/investigations"
                  }
                  className="px-4 py-2 rounded-lg bg-[#151e2b] hover:bg-red-600 hover:text-white text-xs font-mono text-slate-200 border border-[#1e2a3b] transition-colors inline-flex items-center gap-2"
                >
                  <span>Open Dedicated {activeTab.toUpperCase()} Module</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function InvestigationWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#05070b] flex items-center justify-center text-slate-400 font-mono text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff3b30] mr-2" />
          <span>Loading investigation workspace...</span>
        </div>
      }
    >
      <WorkspaceInner />
    </Suspense>
  );
}
