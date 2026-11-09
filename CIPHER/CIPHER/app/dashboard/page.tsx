"use client";

import React, { useState, useEffect } from "react";
import { Radio } from "lucide-react";
import NexusHeader from "@/components/NexusHeader";
import ConstellationCanvas from "@/components/ConstellationCanvas";
import PortalGlobeAnimation from "@/components/PortalGlobeAnimation";
import FloatingAIAssistant from "@/components/FloatingAIAssistant";
import { InvestigationRecord } from "@/lib/investigation-service";
import { CipherModule } from "@/lib/modules-config";

export default function OperationalPortalPage() {
  const [investigations, setInvestigations] = useState<InvestigationRecord[]>([]);
  const [portalMode, setPortalMode] = useState<"HUB" | "OPERATIONAL">("HUB");

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/investigations");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.investigations)) {
            setInvestigations(data.investigations);
          }
        }
      } catch (err) {
        console.error("Dashboard stats fetch error:", err);
      }
    }
    loadStats();
  }, []);

  const activeCount = investigations.length || 24;
  const highPriorityCount =
    investigations.filter((i) => i.priority === "HIGH" || i.priority === "CRITICAL").length || 8;

  const handleModuleSelect = (_module: CipherModule) => {
    // When investigator selects any feature around the globe:
    // Transition from STATE A (HUB) into STATE B (OPERATIONAL)
    setPortalMode("OPERATIONAL");
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col relative selection:bg-red-600 selection:text-white">
      {/* Background Ambience and Particles */}
      <div className="fixed inset-0 pointer-events-none digital-overlay opacity-30 z-0" />
      <ConstellationCanvas className="fixed inset-0 pointer-events-none z-0" particleDensity={22000} />

      {/* 
        TOP CIPHER HEADER:
        In STATE A ("HUB"), hideTopNav is true, so the horizontal module navigation bar is hidden.
        In STATE B ("OPERATIONAL"), hideTopNav is false, so the horizontal top navigation bar appears.
      */}
      <NexusHeader
        moduleTitle="OPERATIONAL PORTAL"
        badge="CENTRAL COMMAND"
        hideTopNav={portalMode === "HUB"}
      />

      {/* Main Operational Portal Central Intelligence Hub */}
      <main className="relative z-10 flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12 flex flex-col items-center gap-3 sm:gap-4">
        {/* Operational Portal Title Header — Centered */}
        <header className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-xs font-mono text-[#ff3b30] shadow-sm">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>CIPHER OPERATIONAL PORTAL // SECURITY LEVEL 3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white uppercase font-sans">
            OPERATIONAL <span className="text-[#ff3b30] text-glow-red">PORTAL</span>
          </h1>
        </header>

        {/* 
          CENTRAL INTELLIGENCE HUB:
          Large rotating 3D network globe in center with the 12 floating feature command cards surrounding it.
          No connecting lines. No emerging animation.
        */}
        <div className="my-1 sm:my-2 flex justify-center items-center w-full z-20">
          <PortalGlobeAnimation
            onModuleSelect={handleModuleSelect}
            portalMode={portalMode}
          />
        </div>

        {/* Metric Cards — Separate Dedicated Horizontal Row beneath Radial Orbit */}
        <section
          aria-label="Intelligence Metrics"
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full max-w-3xl mt-4 sm:mt-6 mb-2 z-20"
        >
          <div className="bg-[#0e1625]/90 border border-[#1d2b3e] px-6 sm:px-8 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[170px] shadow-lg backdrop-blur-sm">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Active Cases</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white mt-0.5">{activeCount}</span>
          </div>
          <div className="bg-[#0e1625]/90 border border-[#1d2b3e] px-6 sm:px-8 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[170px] shadow-lg backdrop-blur-sm">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Tracked Entities</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#39d9ff] mt-0.5">1,284</span>
          </div>
          <div className="bg-[#0e1625]/90 border border-[#1d2b3e] px-6 sm:px-8 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[170px] shadow-lg backdrop-blur-sm">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">High Priority</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#ff3b30] mt-0.5">
              {highPriorityCount}
            </span>
          </div>
        </section>

        {/* System Telemetry Banner Footer */}
        <footer className="w-full pt-4 mt-auto border-t border-[#1b2636]/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-500 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-400">
              SYSTEM OPERATIONAL // NODE LATENCY: 12ms // AIR-GAPPED AIRBORNE ENCRYPTION
            </span>
          </div>
          <div>
            <span>AUTHORIZED LAW ENFORCEMENT &amp; INTELLIGENCE AGENCIES ONLY</span>
          </div>
        </footer>
      </main>

      {/* Fixed CIPHER AI Assistant Shortcut */}
      <FloatingAIAssistant />
    </div>
  );
}
