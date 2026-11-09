"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  GitFork,
  PhoneCall,
  MapPin,
  CreditCard,
  Users,
  ShieldAlert,
  ArrowRight,
  Eye,
  CheckCircle2,
  Filter,
  Search,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import NexusHeader from "@/components/NexusHeader";
import StatusBadge from "@/components/StatusBadge";
import { useInvestigation } from "@/components/InvestigationContext";

interface IntelAlert {
  id: string;
  investigationId: string;
  title: string;
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "NEW" | "ACKNOWLEDGED" | "INVESTIGATING" | "RESOLVED";
  whyGenerated: string;
  evidence: string;
  confidence: string;
  relatedEntities: string[];
  timestamp: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export default function AlertsPage() {
  const { activeCaseId, activeCaseTitle } = useInvestigation();
  const [alerts, setAlerts] = useState<IntelAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchAlerts = () => {
    setLoading(true);
    fetch(`/api/alerts?caseId=${encodeURIComponent(activeCaseId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.alerts)) {
          setAlerts(data.alerts);
        }
      })
      .catch((err) => console.error("Failed to load alerts:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, [activeCaseId]);

  const handleUpdateStatus = async (
    alertId: string,
    newStatus: "ACKNOWLEDGED" | "RESOLVED" | "INVESTIGATING"
  ) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.alert) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, ...data.alert } : a))
        );
        setActionNotice(`Alert ${alertId} updated to ${newStatus}`);
        setTimeout(() => setActionNotice(null), 3500);
      }
    } catch (err) {
      console.error("Failed to update alert:", err);
    }
  };

  const filtered = alerts.filter((a) => {
    const matchesPriority =
      filterPriority === "ALL" || a.severity === filterPriority;
    const matchesStatus =
      filterStatus === "ALL" || a.status === filterStatus;
    const matchesQuery =
      searchQuery === "" ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.whyGenerated.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.relatedEntities.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase())) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPriority && matchesStatus && matchesQuery;
  });

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL").length;
  const highCount = alerts.filter((a) => a.severity === "HIGH").length;
  const pendingCount = alerts.filter((a) => a.status === "NEW" || a.status === "INVESTIGATING").length;

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("transaction") || cat.includes("crypto")) return CreditCard;
    if (cat.includes("communication") || cat.includes("phone")) return PhoneCall;
    if (cat.includes("location") || cat.includes("gps") || cat.includes("tower")) return MapPin;
    if (cat.includes("bridge") || cat.includes("modularity")) return GitFork;
    if (cat.includes("cluster") || cat.includes("community")) return Users;
    return ShieldAlert;
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col selection:bg-red-600 selection:text-white">
      <NexusHeader moduleTitle="CIPHER ALERTS" badge="THREAT ANOMALIES" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Top Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1b2636]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-[#ff3b30]" />
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                ACTIVE CASE: <span className="text-[#39d9ff] font-bold">{activeCaseId}</span> — {activeCaseTitle}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-sans">
              INVESTIGATIVE <span className="text-[#ff3b30] text-glow-red">ALERTS</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge label={`${pendingCount} ACTIONABLE LEADS`} variant="priority-high" />
          </div>
        </section>

        {/* Live Anomaly Metrics Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#101722] border border-[#1e2a3b] space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Case Alerts</span>
            <div className="text-2xl font-bold text-white font-mono">{alerts.length}</div>
            <span className="text-[10px] text-slate-500 font-mono">Dossier Scoped</span>
          </div>

          <div className="p-4 rounded-xl bg-[#101722] border border-red-950/80 space-y-1">
            <span className="text-[10px] font-mono text-red-400 uppercase block">Critical Priority</span>
            <div className="text-2xl font-bold text-[#ff3b30] font-mono">{criticalCount}</div>
            <span className="text-[10px] text-red-400/80 font-mono">High Risk Matrix</span>
          </div>

          <div className="p-4 rounded-xl bg-[#101722] border border-amber-950/80 space-y-1">
            <span className="text-[10px] font-mono text-amber-400 uppercase block">High Priority</span>
            <div className="text-2xl font-bold text-amber-400 font-mono">{highCount}</div>
            <span className="text-[10px] text-amber-500/80 font-mono">Correlated Telemetry</span>
          </div>

          <div className="p-4 rounded-xl bg-[#101722] border border-cyan-950/80 space-y-1">
            <span className="text-[10px] font-mono text-[#39d9ff] uppercase block">Action Required</span>
            <div className="text-2xl font-bold text-[#39d9ff] font-mono">{pendingCount}</div>
            <span className="text-[10px] text-cyan-400/80 font-mono">Unresolved Leads</span>
          </div>
        </section>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#101722] border border-[#1e2a3b] p-4 rounded-2xl">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search alert title, entity, or evidence..."
              className="w-full bg-[#080b12] border border-[#1e2a3b] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#39d9ff]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#080b12] p-1 rounded-xl border border-[#1e2a3b]">
              {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFilterPriority(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                    filterPriority === p
                      ? "bg-red-950 text-red-300 border border-red-700/60"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-[#080b12] p-1 rounded-xl border border-[#1e2a3b]">
              {["ALL", "NEW", "ACKNOWLEDGED", "RESOLVED"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                    filterStatus === s
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-700/60"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Alerts Feed */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs">
            Loading investigation alerts...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-[#101722] border border-[#1e2a3b] rounded-2xl space-y-2">
            <Bell className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-white">No Matching Alerts</div>
            <p className="text-xs text-slate-400">
              No investigative anomaly alerts found for the selected criteria in {activeCaseId}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => {
              const Icon = getCategoryIcon(item.category);
              const isResolved = item.status === "RESOLVED";
              const isAck = item.status === "ACKNOWLEDGED";

              return (
                <div
                  key={item.id}
                  className={`card-nexus p-6 rounded-xl border bg-[#101722] space-y-4 transition-all ${
                    isResolved
                      ? "border-[#1e2a3b] opacity-75"
                      : item.severity === "CRITICAL"
                      ? "border-red-900/60 hover:border-red-500/60 shadow-lg shadow-red-950/20"
                      : "border-[#1e2a3b] hover:border-cyan-500/40"
                  }`}
                >
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b2636] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#151e2b] border border-[#1e2a3b] flex items-center justify-center text-[#ff3b30] shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#39d9ff] font-bold">{item.id}</span>
                          <h3 className="text-base font-bold text-white font-sans">{item.title}</h3>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.category} • Detected {new Date(item.timestamp).toLocaleDateString()}
                          {item.acknowledgedBy && ` • Acknowledged by ${item.acknowledgedBy}`}
                          {item.resolvedBy && ` • Resolved by ${item.resolvedBy}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          item.status === "RESOLVED"
                            ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                            : item.status === "ACKNOWLEDGED"
                            ? "bg-cyan-950 text-cyan-300 border-cyan-800"
                            : item.status === "INVESTIGATING"
                            ? "bg-amber-950 text-amber-400 border-amber-800"
                            : "bg-red-950 text-red-300 border-red-800 animate-pulse"
                        }`}
                      >
                        {item.status}
                      </span>
                      <StatusBadge
                        label={item.severity + " PRIORITY"}
                        variant={
                          item.severity === "CRITICAL"
                            ? "priority-high"
                            : item.severity === "HIGH"
                            ? "priority-medium"
                            : "priority-low"
                        }
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Why it was generated */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                      Anomaly Diagnosis &amp; Rationale:
                    </span>
                    <p className="text-slate-200 leading-relaxed bg-[#0b1018] p-3.5 rounded-lg border border-[#182333]">
                      {item.whyGenerated}
                    </p>
                  </div>

                  {/* Evidence & Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 bg-[#080b12] rounded-lg border border-[#162233]">
                      <span className="text-slate-500 text-[10px] block uppercase">Supporting Evidence</span>
                      <span className="text-slate-200 font-medium truncate block mt-0.5">{item.evidence}</span>
                    </div>
                    <div className="p-3 bg-[#080b12] rounded-lg border border-[#162233]">
                      <span className="text-slate-500 text-[10px] block uppercase">Confidence Index</span>
                      <span className="text-emerald-400 font-bold block mt-0.5">{item.confidence}</span>
                    </div>
                    <div className="p-3 bg-[#080b12] rounded-lg border border-[#162233]">
                      <span className="text-slate-500 text-[10px] block uppercase">Associated Case</span>
                      <span className="text-[#39d9ff] font-medium truncate block mt-0.5">{item.investigationId}</span>
                    </div>
                  </div>

                  {/* Related Entities & Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#1b2636]">
                    <div className="text-xs font-mono text-slate-400">
                      <span>Related: </span>
                      <span className="text-white">{item.relatedEntities.join(" • ")}</span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {!isAck && !isResolved && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, "ACKNOWLEDGED")}
                          className="px-3 py-1.5 rounded-lg bg-[#151e2b] hover:bg-[#1a2638] text-xs font-mono font-semibold text-cyan-300 border border-cyan-800/60 transition-colors"
                        >
                          [ ACKNOWLEDGE ]
                        </button>
                      )}

                      {!isResolved ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, "RESOLVED")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-xs font-mono font-semibold text-emerald-300 border border-emerald-700/60 transition-colors"
                        >
                          [ RESOLVE ]
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, "INVESTIGATING")}
                          className="px-3 py-1.5 rounded-lg bg-[#151e2b] hover:bg-[#1a2638] text-xs font-mono text-slate-300 border border-[#1e2a3b] transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reopen</span>
                        </button>
                      )}

                      <Link
                        href="/evidence"
                        className="px-3.5 py-1.5 rounded-lg btn-red-glow text-white text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <span>[ VIEW EVIDENCE ]</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
