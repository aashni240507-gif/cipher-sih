"use client";

import React from "react";
import Link from "next/link";
import {
  Crosshair,
  Play,
  Share2,
  Fingerprint,
  Globe2,
  ShieldCheck,
  History,
  Bot,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import NexusHeader from "@/components/NexusHeader";
import ConstellationCanvas from "@/components/ConstellationCanvas";

export default function ModulesPage() {
  const modules = [
    {
      title: "Network Analysis",
      badge: "ACTIVE GRAPH",
      badgeColor: "text-red-400 bg-red-950/60 border-red-800/50",
      icon: Share2,
      iconColor: "text-red-400 bg-red-950/50 border-red-500/30",
      meta: "Nodes tracked: 142.8k",
      href: "/network-analysis",
    },
    {
      title: "Entities Directory",
      badge: "RESOLVED",
      badgeColor: "text-orange-400 bg-orange-950/60 border-orange-800/50",
      icon: Fingerprint,
      iconColor: "text-orange-400 bg-orange-950/50 border-orange-500/30",
      meta: "99.4% Match Conf.",
      href: "/investigations/workspace",
    },
    {
      title: "Geospatial Intelligence",
      badge: "GEO-FEED LIVE",
      badgeColor: "text-amber-400 bg-amber-950/60 border-amber-800/50",
      icon: Globe2,
      iconColor: "text-amber-400 bg-amber-950/50 border-amber-500/30",
      meta: "3 Sectors Flagged",
      href: "/geospatial",
    },
    {
      title: "Chain of Evidence",
      badge: "IMMUTABLE",
      badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-800/50",
      icon: ShieldCheck,
      iconColor: "text-emerald-400 bg-emerald-950/50 border-emerald-500/30",
      meta: "89 Verified Hashes",
      href: "/investigations/workspace",
    },
    {
      title: "Timeline Reconstruction",
      badge: "SYNCED",
      badgeColor: "text-cyan-400 bg-cyan-950/60 border-cyan-800/50",
      icon: History,
      iconColor: "text-cyan-400 bg-cyan-950/50 border-cyan-500/30",
      meta: "1,490 Correlated Events",
      href: "/ai-assistant",
    },
    {
      title: "AI Forensic Core",
      badge: "NEURAL ONLINE",
      badgeColor: "text-purple-400 bg-purple-950/60 border-purple-800/50",
      icon: Bot,
      iconColor: "text-purple-400 bg-purple-950/50 border-purple-500/30",
      meta: "CIPHER LLM-v4.2 Active",
      href: "/ai-assistant",
    },
  ];

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col selection:bg-red-600 selection:text-white">
      <NexusHeader moduleTitle="DEEP MODULES" badge="UNIFIED SUITE" />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Interactive Hero & Forensic Visualizer */}
        <section className="relative min-h-[380px] flex items-center px-6 lg:px-12 overflow-hidden border-b border-[#161c28]">
          {/* Ambient Particles in Hero */}
          <ConstellationCanvas className="absolute inset-0 w-full h-full pointer-events-none z-0" particleDensity={14000} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/80 to-transparent pointer-events-none z-0" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Hero Callout */}
          <div className="relative z-10 max-w-2xl py-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono mb-4">
              <Crosshair className="w-3.5 h-3.5 animate-spin" />
              <span>UNIFIED INTELLIGENCE SUITE</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
              Access all investigation &amp; analysis tools{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">
                from one place.
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/investigations/workspace"
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(225,59,38,0.4)] flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Active Workspace</span>
              </Link>

              <Link
                href="/investigations/new"
                className="px-5 py-2.5 rounded-lg bg-[#0e1728] hover:bg-[#142036] border border-[#1b2c45] text-slate-300 text-xs sm:text-sm font-medium transition-colors"
              >
                <span>Initiate New Case</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Deep Module Cards Section */}
        <section className="p-6 lg:p-12 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex items-end justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide uppercase font-mono">
                Deep Analysis Modules
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500 hidden sm:inline">
              6 CORE SYSTEMS SYNCED
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={idx}
                  href={mod.href}
                  className="card-backdrop rounded-xl p-5 sm:p-6 transition-all relative overflow-hidden group flex flex-col justify-between cursor-pointer min-h-[150px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-10 h-10 rounded-lg border flex items-center justify-center ${mod.iconColor}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${mod.badgeColor}`}
                      >
                        {mod.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                      {mod.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-slate-800/60 font-mono text-slate-400">
                    <span>{mod.meta}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-red-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
