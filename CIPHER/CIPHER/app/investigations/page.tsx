"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderArchive,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Users,
  Network,
  Bell,
  Clock,
  ExternalLink,
  Trash2,
  Archive,
  AlertTriangle,
  Loader2,
  RefreshCw,
  FileText,
} from "lucide-react";
import NexusHeader from "@/components/NexusHeader";
import StatusBadge from "@/components/StatusBadge";
import { InvestigationRecord } from "@/lib/investigation-service";

export default function InvestigationsOverviewPage() {
  const [investigations, setInvestigations] = useState<InvestigationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");

  // Deletion Modal State
  const [caseToDelete, setCaseToDelete] = useState<InvestigationRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch investigations from backend
  const fetchInvestigations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/investigations");
      if (!res.ok) {
        throw new Error("Unable to connect to CIPHER intelligence services.");
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.investigations)) {
        setInvestigations(data.investigations);
      } else {
        throw new Error("Invalid response format from server.");
      }
    } catch (err: any) {
      console.error("Fetch investigations error:", err);
      setError("Unable to load investigations. Connection to backend repository failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const handleDeleteCase = async () => {
    if (!caseToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/investigations/${encodeURIComponent(caseToDelete.id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setInvestigations((prev) => prev.filter((c) => c.id !== caseToDelete.id));
        setCaseToDelete(null);
      } else {
        alert("Failed to delete investigation record.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error contacting server during deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveCase = async (item: InvestigationRecord) => {
    try {
      const res = await fetch(`/api/investigations/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      if (res.ok) {
        setInvestigations((prev) =>
          prev.map((c) => (c.id === item.id ? { ...c, status: "ARCHIVED" } : c))
        );
      }
    } catch (err) {
      console.error("Archive error:", err);
    }
  };

  // Filtering
  const filtered = investigations.filter((c) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(query) ||
      c.caseId.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.jurisdiction.toLowerCase().includes(query) ||
      c.leadInvestigator.toLowerCase().includes(query);

    if (filterPriority === "ALL") return matchesSearch;
    if (filterPriority === "HIGH")
      return matchesSearch && (c.priority === "HIGH" || c.priority === "CRITICAL");
    if (filterPriority === "MEDIUM") return matchesSearch && c.priority === "MEDIUM";
    if (filterPriority === "LOW") return matchesSearch && c.priority === "LOW";
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col selection:bg-red-600 selection:text-white">
      <NexusHeader moduleTitle="CIPHER INVESTIGATION" badge="DOSSIER REPOSITORY" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Top Section */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1b2636]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-sans">
              CIPHER <span className="text-[#ff3b30] text-glow-red">INVESTIGATION DOSSIERS</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchInvestigations}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl bg-[#101722] hover:bg-[#16253d] border border-[#1e2a3b] text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Refresh investigations list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#39d9ff]" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              href="/investigations/new"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all active:scale-95 font-mono"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ NEW INVESTIGATION</span>
            </Link>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#101722] border border-[#1e2a3b] p-4 rounded-xl shadow-lg">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search investigations by ID, title, or keyword..."
              className="w-full bg-[#080b12] border border-[#1e2a3b] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#39d9ff]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs font-mono text-slate-500 mr-2 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Priority:
            </span>
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setFilterPriority(p)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                  filterPriority === p
                    ? "bg-red-950 text-red-300 border border-red-700/60 font-semibold"
                    : "bg-[#0b1018] text-slate-400 hover:text-white border border-[#182333]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </section>

        {/* Investigation Dossier Cards Stream */}
        <section className="space-y-4">
          {/* LOADING STATE */}
          {loading && (
            <div className="p-16 rounded-2xl bg-[#101722] border border-[#1e2a3b] flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-7 h-7 text-[#ff3b30] animate-spin" />
              <p className="text-sm font-mono text-slate-300">Loading investigations from CIPHER database...</p>
              <span className="text-[11px] font-mono text-slate-500">Querying PostgreSQL via Prisma ORM</span>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="p-12 rounded-2xl bg-red-950/40 border border-red-500/50 flex flex-col items-center justify-center gap-3 text-center">
              <AlertTriangle className="w-7 h-7 text-[#ff3b30]" />
              <p className="text-sm font-mono text-red-300">{error}</p>
              <button
                type="button"
                onClick={fetchInvestigations}
                className="mt-2 px-4 py-2 rounded-lg bg-[#151e2b] hover:bg-red-600 hover:text-white text-xs font-mono text-slate-200 border border-[#1e2a3b] transition-colors"
              >
                Retry Database Connection
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && filtered.length === 0 && (
            <div className="p-16 rounded-2xl bg-[#101722] border border-[#1e2a3b] flex flex-col items-center justify-center gap-3 text-center">
              <FolderArchive className="w-10 h-10 text-slate-600" />
              <h3 className="text-base font-bold text-white font-sans">No investigations found</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                No cases matched your search filter. Create a new case to initialize tracking in the system.
              </p>
              <Link
                href="/investigations/new"
                className="mt-3 px-5 py-2.5 rounded-lg btn-red-glow text-white text-xs font-mono font-semibold uppercase"
              >
                + Create Investigation
              </Link>
            </div>
          )}

          {/* CARDS LIST */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="card-nexus p-5 sm:p-6 rounded-xl border border-[#1e2a3b] bg-[#101722] flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-red-500/40 transition-all shadow-xl"
                >
                  {/* Left Case Summary */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-mono font-bold text-[#ff3b30] bg-red-950/40 border border-red-800/40 px-2.5 py-0.5 rounded">
                        {item.caseId}
                      </span>
                      <h3 className="text-lg font-bold text-white font-sans tracking-wide">
                        {item.title}
                      </h3>
                      <StatusBadge
                        label={`${item.priority} PRIORITY`}
                        variant={
                          item.priority === "HIGH" || item.priority === "CRITICAL"
                            ? "priority-high"
                            : item.priority === "MEDIUM"
                            ? "priority-medium"
                            : "priority-low"
                        }
                      />
                      <StatusBadge
                        label={item.status}
                        variant={item.status === "ACTIVE" ? "active" : "neutral"}
                      />
                      {item.graphSyncStatus && (
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                          Graph: {item.graphSyncStatus}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Started {item.startDate}
                      </span>
                      <span>Assigned: {item.leadInvestigator}</span>
                      <span className="text-slate-500 truncate max-w-xs">
                        Jurisdiction: {item.jurisdiction}
                      </span>
                    </div>
                  </div>

                  {/* Metrics & Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 shrink-0 border-t lg:border-t-0 lg:border-l border-[#1a2536] pt-4 lg:pt-0 lg:pl-6">
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-center">
                        <span className="text-slate-500 text-[10px] block uppercase">Entities</span>
                        <span className="font-bold text-[#39d9ff] text-sm flex items-center justify-center gap-1">
                          <Users className="w-3 h-3" /> {item.entitiesCount}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-slate-500 text-[10px] block uppercase">Links</span>
                        <span className="font-bold text-white text-sm flex items-center justify-center gap-1">
                          <Network className="w-3 h-3" /> {item.relationshipsCount}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-slate-500 text-[10px] block uppercase">Evidence</span>
                        <span className="font-bold text-emerald-400 text-sm flex items-center justify-center gap-1">
                          <FileText className="w-3 h-3" /> {item.evidenceCount}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-slate-500 text-[10px] block uppercase">Alerts</span>
                        <span className="font-bold text-[#ff3b30] text-sm flex items-center justify-center gap-1">
                          <Bell className="w-3 h-3" /> {item.alertsCount}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {/* Archive Button */}
                      <button
                        type="button"
                        onClick={() => handleArchiveCase(item)}
                        className="p-2.5 rounded-lg bg-[#151e2b] hover:bg-[#1c293a] border border-[#1e2a3b] text-slate-400 hover:text-slate-200 transition-colors"
                        title="Archive Case"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setCaseToDelete(item)}
                        className="p-2.5 rounded-lg bg-[#151e2b] hover:bg-red-950/60 border border-[#1e2a3b] hover:border-red-600/50 text-slate-400 hover:text-[#ff3b30] transition-colors"
                        title="Delete Case"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Open Investigation Workspace */}
                      <Link
                        href={`/investigations/workspace?id=${encodeURIComponent(item.id)}`}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-[#151e2b] hover:bg-red-600 hover:text-white border border-[#1e2a3b] hover:border-red-500 text-slate-200 text-xs font-semibold font-mono tracking-wider flex items-center justify-center gap-2 transition-all"
                      >
                        <span>OPEN INVESTIGATION</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#ff3b30] group-hover:text-white" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* DELETE CONFIRMATION MODAL */}
        {caseToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0b1220] border border-[#1e2a3b] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-[#ff3b30]">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-base font-bold text-white uppercase font-sans">
                  Confirm Case Deletion
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                Are you sure you want to delete investigation{" "}
                <span className="font-bold text-white">{caseToDelete.title}</span> (
                <span className="text-[#ff3b30]">{caseToDelete.caseId}</span>)? This action will remove
                the dossier from active registries.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setCaseToDelete(null)}
                  className="px-4 py-2 rounded-lg bg-[#101722] hover:bg-[#162338] border border-[#1e2a3b] text-xs font-mono text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteCase}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-red-900/40"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{isDeleting ? "Deleting..." : "Confirm Delete"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
