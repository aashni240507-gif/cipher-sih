"use client";

import React, { Suspense } from "react";
import NexusHeader from "@/components/NexusHeader";
import InteractiveNetworkGraph from "@/components/InteractiveNetworkGraph";
import { Network, Cpu, ShieldCheck } from "lucide-react";
import { useInvestigation } from "@/components/InvestigationContext";

function NetworkAnalysisContent() {
  const { activeCaseId, activeCaseTitle } = useInvestigation();

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col selection:bg-red-600 selection:text-white">
      <NexusHeader
        moduleTitle="CIPHER NETWORK ANALYSIS"
        badge="RELATIONSHIP TOPOLOGY"
        activeCase={`${activeCaseId} // ${activeCaseTitle.toUpperCase()}`}
      />

      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 flex flex-col h-[calc(100vh-6.75rem)]">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 px-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-500/40 flex items-center justify-center text-[#ff3b30] shrink-0">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2 font-sans">
                <span>CIPHER TACTICAL NETWORK ANALYSIS GRAPH</span>
                <span className="text-[10px] font-mono text-[#39d9ff] bg-[#101722] border border-[#1e2a3b] px-2 py-0.5 rounded uppercase">
                  {activeCaseId}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <div className="hidden md:flex items-center gap-1.5 bg-[#101722] px-3 py-1.5 rounded-lg border border-[#1e2a3b]">
              <Cpu className="w-3.5 h-3.5 text-[#39d9ff]" />
              <span>ALGORITHM: LOUVAIN MODULARITY</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#101722] px-3 py-1.5 rounded-lg border border-[#1e2a3b]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CONFIDENTIAL // LAW ENFORCEMENT ONLY</span>
            </div>
          </div>
        </div>

        {/* Full View Graph Area */}
        <div className="flex-1 min-h-0">
          <InteractiveNetworkGraph height="h-full" showInspector={true} />
        </div>
      </main>
    </div>
  );
}

export default function NetworkAnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#05070b] text-white flex items-center justify-center font-mono text-sm">
          LOADING CIPHER NETWORK ANALYSIS...
        </div>
      }
    >
      <NetworkAnalysisContent />
    </Suspense>
  );
}
