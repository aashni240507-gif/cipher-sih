"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  FileDown,
  Download,
  CheckCircle2,
  Share2,
  ShieldCheck,
  Eye,
  Calendar,
  Building,
  RefreshCw,
  Scale,
  Sparkles,
  AlertTriangle,
  Cpu,
  User,
  ArrowRight,
  Printer,
} from "lucide-react";
import NexusHeader from "@/components/NexusHeader";
import StatusBadge from "@/components/StatusBadge";
import { useInvestigation } from "@/components/InvestigationContext";

interface ReportFact {
  id: string;
  category: string;
  statement: string;
  sourceProvenance: string;
  verificationLevel: string;
  evidenceId?: string;
  timestamp?: string;
}

interface ReportAnalytics {
  metricName: string;
  computedValue: string | number;
  methodology: string;
  significance: string;
}

interface ReportAiInterpretation {
  hypothesisId: string;
  title: string;
  interpretiveSummary: string;
  groundedEntities: string[];
  caveat: string;
  humanVerificationStatus: string;
}

interface ReportUserClue {
  id: string;
  title: string;
  description: string;
  author: string;
  status: string;
  createdAt: string;
}

interface GeneratedReport {
  id: string;
  reportNumber: string;
  caseId: string;
  caseTitle: string;
  reportType: string;
  title: string;
  generatedBy: string;
  analystRole: string;
  generatedAt: string;
  classification: string;
  executiveSummary: string;
  facts: ReportFact[];
  analytics: ReportAnalytics[];
  aiInterpretation: ReportAiInterpretation[];
  userClues: ReportUserClue[];
  digestHash: string;
  signatureAlgorithm: string;
  recommendations: string[];
  provenanceCitations: {
    totalFacts: number;
    totalAnalytics: number;
    totalAiDeductions: number;
    totalUserClues: number;
  };
}

export default function ReportsPage() {
  const { activeCaseId, activeCaseTitle } = useInvestigation();

  const [selectedType, setSelectedType] = useState("CIPHER Investigation Summary");
  const [includeClassified, setIncludeClassified] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState<GeneratedReport | null>(null);
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const reportTypes = [
    {
      name: "CIPHER Investigation Summary",
      desc: "Comprehensive case overview, judicial milestones, key actors, and procedural history.",
    },
    {
      name: "CIPHER Network Analysis",
      desc: "Relationship adjacency matrix, community modularity clusters, and betweenness scores.",
    },
    {
      name: "CIPHER Entity Profile",
      desc: "Target dossier with phones, vehicles, associates, accounts, and verified evidence references.",
    },
    {
      name: "CIPHER Timeline Summary",
      desc: "Chronological event log linking communications, travel vectors, and financial dissipation.",
    },
    {
      name: "CIPHER Evidence Summary",
      desc: "Chain-of-custody log with cryptographic SHA-256 integrity digests.",
    },
    {
      name: "CIPHER AI Intelligence Report",
      desc: "Neural hypothesis synthesis, anomaly flags, and multi-hop network deductions.",
    },
  ];

  // Fetch recent reports on mount and when case changes
  useEffect(() => {
    fetch(`/api/reports?caseId=${encodeURIComponent(activeCaseId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reports)) {
          setRecentReports(data.reports);
          if (data.reports.length > 0) {
            setCurrentReport(data.reports[0]);
          } else {
            // Trigger initial report generation for the case
            handleGenerateReport(selectedType, false);
          }
        }
      })
      .catch((err) => console.error("Failed to load reports:", err));
  }, [activeCaseId]);

  const handleGenerateReport = async (typeToGen = selectedType, notify = true) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: activeCaseId,
          reportType: typeToGen,
          analystName: "Amit Sharma",
          analystRole: "Lead Intelligence Analyst (L3)",
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        setCurrentReport(data.report);
        setRecentReports((prev) => [data.report, ...prev.filter((r) => r.id !== data.report.id)]);
        if (notify) {
          setExportNotice(`Generated ${data.report.reportNumber} with SHA-256 integrity digest`);
          setTimeout(() => setExportNotice(null), 4000);
        }
      }
    } catch (err) {
      console.error("Report generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!currentReport) return;
    const jsonStr = JSON.stringify(currentReport, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentReport.reportNumber || "CIPHER-REPORT"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportNotice(`Downloaded official JSON package for ${currentReport.reportNumber}`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col selection:bg-red-600 selection:text-white print:bg-white print:text-black">
      {/* Nexus Header hidden during browser print */}
      <div className="print:hidden">
        <NexusHeader moduleTitle="REPORTS & BRIEFINGS" badge="JUDICIAL PROSECUTION EXPORT" />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8 print:p-0 print:max-w-none">
        {/* Top Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1b2636] print:border-black">
          <div>
            <div className="flex items-center gap-2 mb-1 print:hidden">
              <Scale className="w-4 h-4 text-[#ff3b30]" />
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                ACTIVE CASE: <span className="text-[#39d9ff] font-bold">{activeCaseId}</span> — {activeCaseTitle}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-sans print:text-black">
              INTELLIGENCE &amp; PROSECUTION <span className="text-[#ff3b30] text-glow-red print:text-red-700">REPORTS</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <StatusBadge label="OFFICIAL LAW ENFORCEMENT USE ONLY" variant="priority-high" />
          </div>
        </section>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Config & Selection (5 cols) */}
          <aside className="lg:col-span-4 bg-[#101722] border border-[#1e2a3b] rounded-2xl p-5 sm:p-6 space-y-4 print:hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                Select Report Template
              </span>
              <span className="text-[10px] font-mono text-[#39d9ff]">{reportTypes.length} TEMPLATES</span>
            </div>

            <div className="space-y-2.5">
              {reportTypes.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => {
                    setSelectedType(t.name);
                    handleGenerateReport(t.name, true);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedType === t.name
                      ? "bg-[#151e2b] border-[#ff3b30] shadow-md shadow-red-950/40"
                      : "bg-[#080b12] border-[#182333] hover:border-slate-600 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white font-sans">{t.name}</h4>
                    {selectedType === t.name && (
                      <span className="w-2 h-2 rounded-full bg-[#ff3b30] animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{t.desc}</p>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-[#182333] flex items-center justify-between text-xs font-mono text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeClassified}
                  onChange={(e) => setIncludeClassified(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#080b12] border-[#1e2a3b] text-[#ff3b30] focus:ring-0"
                />
                <span>Include Sensitive Intelligence</span>
              </label>
            </div>

            {/* Generated Reports History */}
            {recentReports.length > 0 && (
              <div className="pt-4 border-t border-[#182333] space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Compiled Case Dossiers ({recentReports.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {recentReports.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setCurrentReport(r);
                        setSelectedType(r.reportType);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs font-mono flex items-center justify-between border transition-all ${
                        currentReport?.id === r.id
                          ? "bg-cyan-950/30 border-cyan-700/60 text-cyan-300"
                          : "bg-[#0c1017] border-[#182333] text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="truncate mr-2">
                        <span className="text-white block truncate">{r.title}</span>
                        <span className="text-[10px] text-slate-500">{new Date(r.generatedAt).toLocaleTimeString()}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#162233] text-slate-300 shrink-0">
                        {r.facts.length}F / {r.analytics.length}A
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Right Column: Live Rendered Judicial Intelligence Brief (8 cols) */}
          <section className="lg:col-span-8 bg-[#101722] border border-[#1e2a3b] rounded-2xl p-6 sm:p-8 space-y-6 print:border-none print:p-0 print:bg-white print:text-black">
            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b2636] pb-4 print:hidden">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Dossier Preview</span>
                <h3 className="text-lg font-bold text-white font-sans">{currentReport?.title || selectedType}</h3>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleGenerateReport(selectedType, true)}
                  disabled={generating}
                  className="px-3.5 py-2 rounded-xl bg-[#151e2b] hover:bg-[#1a2638] text-slate-200 border border-[#1e2a3b] text-xs font-mono font-semibold uppercase flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#39d9ff] ${generating ? "animate-spin" : ""}`} />
                  <span>{generating ? "Compiling..." : "Recompile"}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="px-4 py-2 rounded-xl btn-red-glow text-white text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>[ EXPORT PDF / PRINT ]</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="px-4 py-2 rounded-xl bg-[#151e2b] hover:bg-[#1a2638] text-slate-200 border border-[#1e2a3b] text-xs font-mono font-semibold uppercase flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#39d9ff]" />
                  <span>[ EXPORT JSON ]</span>
                </button>
              </div>
            </div>

            {/* Export Success Notification */}
            {exportNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 text-xs font-mono flex items-center gap-2 print:hidden animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{exportNotice}</span>
              </div>
            )}

            {/* Complete Intelligence Document */}
            {currentReport ? (
              <div className="p-6 sm:p-8 rounded-xl bg-[#080b12] border border-[#182333] space-y-6 font-mono text-xs print:border-black print:bg-white print:text-black">
                {/* Formal Judicial Brief Header */}
                <div className="border-b-2 border-[#1e2a3b] pb-4 print:border-black">
                  <div className="flex justify-between items-start text-[11px] text-slate-400 pb-2 print:text-black">
                    <div>
                      <span className="text-[#39d9ff] font-bold block print:text-black">
                        CIPHER INVESTIGATIVE INTELLIGENCE SYSTEM
                      </span>
                      <span className="text-slate-500 print:text-gray-600">
                        OFFICIAL LAW ENFORCEMENT &amp; PROSECUTION BRIEF
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold block print:text-black">
                        {currentReport.reportNumber}
                      </span>
                      <span className="text-emerald-400 text-[10px] print:text-black">
                        VERIFIED IMMUTABLE RECORD
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap justify-between gap-2 text-[11px] text-slate-400 print:text-black">
                    <div>
                      CASE DOSSIER: <span className="text-white font-bold print:text-black">{currentReport.caseId}</span>
                    </div>
                    <div>
                      CLASSIFICATION: <span className="text-[#ff3b30] font-bold print:text-black">{currentReport.classification}</span>
                    </div>
                    <div>
                      DATE: <span className="text-white print:text-black">{new Date(currentReport.generatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="space-y-2">
                  <span className="text-[#39d9ff] font-bold block text-sm font-sans tracking-wide uppercase print:text-black">
                    1. EXECUTIVE SUMMARY &amp; PROCEDURAL CONTEXT
                  </span>
                  <p className="text-slate-300 font-sans text-xs leading-relaxed print:text-black">
                    {currentReport.executiveSummary}
                  </p>
                </div>

                {/* Section A: Verified Court & Forensic Facts */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-[#1b2636] pb-1.5 print:border-black">
                    <span className="text-emerald-400 font-bold block text-xs font-mono uppercase tracking-wider print:text-black">
                      SECTION A: RETRIEVED FACTS (COURT &amp; EVIDENCE RECORDED)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono print:text-black">
                      [{currentReport.facts.length} VERIFIED ENTRIES]
                    </span>
                  </div>

                  <div className="space-y-2">
                    {currentReport.facts.map((fact) => (
                      <div
                        key={fact.id}
                        className="p-3 bg-[#101722] rounded-lg border border-emerald-900/40 space-y-1 text-[11px] print:bg-white print:border-black print:text-black"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-300 print:text-black">
                            [{fact.id}] {fact.category}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 print:border-black print:text-black print:bg-white">
                            {fact.verificationLevel}
                          </span>
                        </div>
                        <p className="text-slate-200 font-sans text-xs print:text-black">{fact.statement}</p>
                        <div className="text-[10px] text-slate-500 pt-0.5 print:text-gray-700">
                          Provenance: <span className="text-slate-300 print:text-black">{fact.sourceProvenance}</span>
                          {fact.evidenceId && ` • Evidence Ref: ${fact.evidenceId}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section B: Calculated Network Analytics */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-[#1b2636] pb-1.5 print:border-black">
                    <span className="text-[#39d9ff] font-bold block text-xs font-mono uppercase tracking-wider print:text-black">
                      SECTION B: COMPUTED ANALYTICS (GRAPH &amp; CENTRALITY METRICS)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono print:text-black">
                      [{currentReport.analytics.length} METRIC ENTRIES]
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentReport.analytics.map((metric, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#101722] rounded-lg border border-cyan-950 space-y-1 text-[11px] print:bg-white print:border-black print:text-black"
                      >
                        <div className="text-[#39d9ff] font-bold font-sans print:text-black">
                          {metric.metricName}
                        </div>
                        <div className="text-white font-mono font-bold text-xs print:text-black">
                          {metric.computedValue}
                        </div>
                        <p className="text-slate-400 text-[10px] leading-snug print:text-gray-800">
                          {metric.significance}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section C: AI-Generated Interpretations (Responsible AI Guardrails) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-[#1b2636] pb-1.5 print:border-black">
                    <span className="text-amber-400 font-bold block text-xs font-mono uppercase tracking-wider print:text-black">
                      SECTION C: AI INTERPRETATION &amp; INVESTIGATIVE LEADS
                    </span>
                    <span className="text-[10px] text-amber-500/80 font-mono print:text-black">
                      [HUMAN VERIFICATION REQUIRED]
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {currentReport.aiInterpretation.map((hyp) => (
                      <div
                        key={hyp.hypothesisId}
                        className="p-3 bg-[#131109] rounded-lg border border-amber-800/40 space-y-1.5 text-[11px] print:bg-white print:border-black print:text-black"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-300 print:text-black">
                            [{hyp.hypothesisId}] {hyp.title}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-700/50 print:border-black print:text-black print:bg-white">
                            REQUIRES HUMAN VERIFICATION
                          </span>
                        </div>
                        <p className="text-slate-200 font-sans text-xs print:text-black">
                          {hyp.interpretiveSummary}
                        </p>
                        <div className="text-[10px] text-amber-500/90 font-mono italic print:text-gray-700">
                          {hyp.caveat}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section D: User-Provided Clues (Marked Unverified) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-[#1b2636] pb-1.5 print:border-black">
                    <span className="text-purple-400 font-bold block text-xs font-mono uppercase tracking-wider print:text-black">
                      SECTION D: USER PROVIDED CLUES &amp; FIELD OBSERVATIONS
                    </span>
                    <span className="text-[10px] text-purple-400/80 font-mono print:text-black">
                      [UNVERIFIED FIELD INTEL]
                    </span>
                  </div>

                  <div className="space-y-2">
                    {currentReport.userClues.map((clue) => (
                      <div
                        key={clue.id}
                        className="p-3 bg-[#120f1a] rounded-lg border border-purple-900/40 space-y-1 text-[11px] print:bg-white print:border-black print:text-black"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-300 print:text-black">
                            [{clue.id}] {clue.title}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40 print:border-black print:text-black print:bg-white">
                            USER PROVIDED / UNVERIFIED
                          </span>
                        </div>
                        <p className="text-slate-300 font-sans text-xs print:text-black">{clue.description}</p>
                        <div className="text-[10px] text-slate-500 pt-0.5 print:text-gray-700">
                          Submitted By: <span className="text-white print:text-black">{clue.author}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-2 pt-2 border-t border-[#182333] print:border-black">
                  <span className="text-[#39d9ff] font-bold block text-xs font-mono uppercase tracking-wider print:text-black">
                    2. RECOMMENDED PROCEDURAL &amp; FIELD ACTIONS
                  </span>
                  <ul className="space-y-1 pl-4 list-disc text-slate-300 font-sans text-xs print:text-black">
                    {currentReport.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>

                {/* Cryptographic Seal & Integrity Verification */}
                <div className="p-3.5 bg-[#101722] rounded-lg border border-[#1e2a3b] space-y-1 text-[11px] print:bg-white print:border-black print:text-black">
                  <div className="flex justify-between text-slate-400 print:text-black">
                    <span>Generated By: <span className="text-white font-bold print:text-black">{currentReport.generatedBy} ({currentReport.analystRole})</span></span>
                    <span>Sign Algorithm: <span className="text-[#39d9ff] print:text-black">{currentReport.signatureAlgorithm}</span></span>
                  </div>
                  <div className="text-slate-400 break-all print:text-black">
                    Tamper-Proof SHA-256 Digest: <span className="text-emerald-400 font-mono font-bold print:text-black">{currentReport.digestHash}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 text-center pt-2 print:text-black">
                  CIPHER AUTOMATED JUDICIAL COMPILER • OFFICIAL DOCUMENT • EVIDENCE PRESERVED UNDER DIGITAL INTEGRITY PROTOCOLS
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 font-mono text-xs">
                Loading intelligence report...
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
