"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  PhoneCall,
  Receipt,
  Camera,
  Database,
  Share2,
  Globe,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  RefreshCw,
  HardDrive,
} from "lucide-react";
import NexusHeader from "@/components/NexusHeader";
import StatusBadge from "@/components/StatusBadge";
import { useInvestigation } from "@/components/InvestigationContext";

interface DataSourceItem {
  id: string;
  caseId: string;
  name: string;
  category: string;
  type: string;
  status: "CONNECTED" | "PROCESSING" | "SYNCED" | "FAILED" | "DISCONNECTED";
  recordsCount: string;
  lastSynced: string;
  sourceOwner: string;
  fileSize?: string;
  digestHash?: string;
  extractedEntitiesCount: number;
  notes?: string;
}

export default function DataSourcesPage() {
  const { activeCaseId, activeCaseTitle } = useInvestigation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(3);
  const [dataSources, setDataSources] = useState<DataSourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const fetchDataSources = () => {
    setLoading(true);
    fetch(`/api/data-sources?caseId=${encodeURIComponent(activeCaseId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.sources)) {
          setDataSources(data.sources);
        }
      })
      .catch((err) => console.error("Failed to load data sources:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDataSources();
  }, [activeCaseId]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);

    try {
      // Compute cryptographic SHA-256 in browser
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const fileHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      // Determine category based on extension
      const ext = file.name.split(".").pop()?.toUpperCase() || "TXT";
      let category = "Intelligence Document";
      if (ext === "CSV") category = "CDR Telecommunications / Logs";
      else if (ext === "JSON") category = "Financial & Crypto Ledger";
      else if (ext === "PDF") category = "FIR / Judicial Record";

      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(1)} KB`;

      const res = await fetch("/api/data-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: activeCaseId,
          name: file.name,
          category,
          type: ext,
          fileSize: formattedSize,
        }),
      });

      const data = await res.json();
      if (data.success && data.source) {
        setDataSources((prev) => [data.source, ...prev]);
        setUploadNotice(`Ingested ${file.name} (SHA-256: ${fileHash.slice(0, 10)}...)`);
        setTimeout(() => setUploadNotice(null), 4000);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const sourcesCatalog = [
    { id: "s1", name: "FIR / Police Incident Reports", category: "Incident & Offense", recordsCount: "1,420 Docs", icon: FileText },
    { id: "s2", name: "Call Detail Records (CDR)", category: "Telecommunications", recordsCount: "482.9k Calls", icon: PhoneCall },
    { id: "s3", name: "Financial & Crypto Ledger Dumps", category: "Transactions", recordsCount: "14.2k TXs", icon: Receipt },
    { id: "s4", name: "Surveillance Reports & ANPR", category: "Field Intelligence", recordsCount: "89 Field Logs", icon: Camera },
    { id: "s5", name: "Criminal History & Alias DB", category: "Biometrics & Priors", recordsCount: "84.2k Records", icon: Database },
    { id: "s6", name: "Social Media & Darknet Scraping", category: "OSINT Intelligence", recordsCount: "6.9k Threads", icon: Globe },
    { id: "s7", name: "Multi-Agency Intelligence Reports", category: "Interpol & Customs", recordsCount: "310 Memos", icon: Share2 },
  ];

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col selection:bg-red-600 selection:text-white">
      <NexusHeader moduleTitle="DATA INGESTION" badge="NEURAL PIPELINE" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Top Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1b2636]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="w-4 h-4 text-[#39d9ff]" />
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                ACTIVE CASE: <span className="text-[#39d9ff] font-bold">{activeCaseId}</span> — {activeCaseTitle}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-sans">
              INTELLIGENCE DATA <span className="text-[#39d9ff] text-glow-cyan">INGESTION</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/network-analysis"
              className="px-4 py-2 rounded-xl bg-[#101722] hover:bg-[#151e2b] border border-[#1e2a3b] text-xs font-mono font-semibold text-white flex items-center gap-2"
            >
              <span>View Resolved Graph</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#ff3b30]" />
            </Link>
          </div>
        </section>

        {/* AI PROCESSING PIPELINE VISUALIZER */}
        <section className="bg-[#101722] border border-[#1e2a3b] p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#39d9ff]" />
              <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                CIPHER Neural Processing Pipeline
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">STATUS: PIPELINE SYNCHRONIZED</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {[
              { step: "01", title: "Ingest & Normalize", desc: "Multi-Format Parsers", active: true },
              { step: "02", title: "Entity Extraction", desc: "NER & Regex Patterns", active: true },
              { step: "03", title: "Disambiguation", desc: "Phonetic & Alias Matching", active: true },
              { step: "04", title: "Graph Linkage", desc: "Adjacency Correlation", active: true },
              { step: "05", title: "Threat Scoring", desc: "Centrality Metrics", active: false },
            ].map((p, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all text-xs font-mono ${
                  p.active
                    ? "bg-[#151e2b] border-[#39d9ff]/50 shadow-md shadow-cyan-950/20"
                    : "bg-[#080b12] border-[#182333] opacity-60"
                }`}
              >
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[#39d9ff] font-bold text-[10px]">STEP {p.step}</span>
                  {p.active && <span className="w-1.5 h-1.5 rounded-full bg-[#39d9ff] animate-pulse" />}
                </div>
                <h4 className="font-bold text-white font-sans text-xs">{p.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Upload & Parsed Datasets Grid (7 cols / 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Upload Drop Zone & Ingested Files (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                dragOver
                  ? "border-[#39d9ff] bg-cyan-950/20"
                  : "border-[#1e2a3b] bg-[#101722] hover:border-slate-500"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-full bg-[#151e2b] border border-[#1e2a3b] flex items-center justify-center text-[#39d9ff] mb-4 shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white font-sans">
                Drag and drop raw intelligence dossiers here
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Supported: PDF, CSV, JSON, TXT, CDR telecommunications dumps (Up to 100MB per file)
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-6 py-2.5 rounded-lg btn-red-glow text-white text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
              >
                {uploading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{uploading ? "INGESTING..." : "[ BROWSE LOCAL SECURE STORAGE ]"}</span>
              </button>
            </div>

            {/* Upload Notification */}
            {uploadNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{uploadNotice}</span>
              </div>
            )}

            {/* Ingested Files List */}
            <div className="bg-[#101722] border border-[#1e2a3b] p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider block">
                  Ingested Datasets in {activeCaseId} ({dataSources.length})
                </span>
                <span className="text-[10px] font-mono text-emerald-400">IMMUTABLE LOG</span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  Loading data sources...
                </div>
              ) : dataSources.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  No data sources ingested yet for this case. Upload a dossier above.
                </div>
              ) : (
                <div className="space-y-2">
                  {dataSources.map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 bg-[#080b12] border border-[#1e2a3b] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileCheck className="w-4 h-4 text-[#39d9ff] shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold block">{file.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#151e2b] text-slate-400 border border-[#1e2a3b]">
                              {file.type}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {file.fileSize || "4.2 MB"} • {file.recordsCount} • {file.sourceOwner}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 rounded">
                          {file.status}
                        </span>
                        <Link
                          href="/evidence"
                          className="px-2.5 py-1 rounded bg-[#151e2b] hover:bg-[#1a2638] text-[10px] font-mono text-slate-300 border border-[#1e2a3b] transition-colors"
                        >
                          Evidence Vault →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Supported Sources Catalog (5 cols) */}
          <div className="lg:col-span-5 bg-[#101722] border border-[#1e2a3b] p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider block">
                Supported Intelligence Feeds ({sourcesCatalog.length})
              </span>
              <span className="text-[10px] font-mono text-[#39d9ff]">CIPHER CONNECTORS</span>
            </div>

            <div className="space-y-2.5">
              {sourcesCatalog.map((src) => {
                const Icon = src.icon;
                return (
                  <div
                    key={src.id}
                    className="p-3.5 rounded-xl bg-[#080b12] border border-[#182333] flex items-center justify-between text-xs font-mono hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#121a26] border border-[#1e2a3b] flex items-center justify-center text-[#39d9ff] shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-white font-sans font-bold block">{src.name}</span>
                        <span className="text-[10px] text-slate-400">{src.category}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-300 font-semibold">{src.recordsCount}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
