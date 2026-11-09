"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Play,
  X,
  Radio,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import ConstellationCanvas from "@/components/ConstellationCanvas";

export default function LandingPage() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <div className="relative w-full min-h-screen bg-[#05080e] flex flex-col justify-between p-6 md:p-14 lg:p-20 overflow-x-hidden selection:bg-red-600 selection:text-white">
      {/* Background Ambience and Particles */}
      <div className="fixed inset-0 pointer-events-none digital-overlay opacity-40 z-0" />
      <ConstellationCanvas className="fixed inset-0 pointer-events-none z-0" particleDensity={18000} />

      {/* Atmospheric Gradients */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#07080a] via-transparent to-black/70 pointer-events-none z-0"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow z-0"
      />

      {/* BEGIN: TopNavigation */}
      <header className="relative z-10 flex items-start justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          {/* Logo Mark */}
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-red-950/80 to-black border border-red-500/40 shadow-lg shadow-red-950/50">
            <svg
              className="w-8 h-8 text-[#FF3B30] drop-shadow-[0_0_12px_rgba(255,59,48,0.7)]"
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="24" fill="currentColor" fillOpacity="0.9" r="7" />
              <path
                d="M24 4C24 4 28 10 28 14C28 16.2091 26.2091 18 24 18C21.7909 18 20 16.2091 20 14C20 10 24 4 24 4Z"
                fill="currentColor"
              />
              <path
                d="M24 44C24 44 28 38 28 34C28 31.7909 26.2091 30 24 30C21.7909 30 20 31.7909 20 34C20 38 24 44 24 44Z"
                fill="currentColor"
              />
              <path
                d="M4 24C4 24 10 28 14 28C16.2091 28 18 26.2091 18 24C18 21.7909 16.2091 20 14 20C10 20 4 24 4 24Z"
                fill="currentColor"
              />
              <path
                d="M44 24C44 24 38 28 34 28C31.7909 28 30 26.2091 30 24C30 21.7909 31.7909 20 34 20C38 20 44 24 44 24Z"
                fill="currentColor"
              />
              <circle cx="10" cy="10" fill="currentColor" r="3" />
              <circle cx="38" cy="10" fill="currentColor" r="3" />
              <circle cx="10" cy="38" fill="currentColor" r="3" />
              <circle cx="38" cy="38" fill="currentColor" r="3" />
            </svg>
          </div>
          {/* Typography */}
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-widest text-white uppercase leading-none font-sans">
              CIPHER
            </h1>
            <span className="text-[9px] md:text-[11px] font-mono tracking-[0.2em] text-neutral-400 uppercase mt-1">
              AI-POWERED CRIMINAL NETWORK ANALYSIS SYSTEM
            </span>
          </div>
        </div>

        {/* Enter Platform CTA */}
        <nav className="flex items-center space-x-3">
          <Link
            href="/login"
            className="px-5 py-2 text-xs uppercase font-mono tracking-widest text-neutral-300 hover:text-white border border-neutral-700/60 hover:border-[#FF3B30] bg-black/40 backdrop-blur-md rounded transition duration-200 flex items-center gap-2 group"
          >
            <span>Enter Platform</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#FF3B30]" />
          </Link>
        </nav>
      </header>

      {/* BEGIN: HeroContent */}
      <main className="relative z-10 w-full max-w-7xl mx-auto my-auto py-12 md:py-20">
        <div className="max-w-2xl lg:max-w-3xl">
          {/* Tagline Badge */}
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-950/30 text-[#FF3B30] font-mono text-[11px] sm:text-xs tracking-[0.2em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse" />
            DECODE THE HIDDEN NETWORK.
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white uppercase leading-[1.12]">
            TURNING FRAGMENTED DATA <br className="hidden sm:inline" />
            INTO <span className="text-[#FF3B30] text-glow">CONNECTED INTELLIGENCE.</span>
          </h2>

          {/* Action Triad: Analyze - Discover - Investigate */}
          <div className="flex items-center space-x-3 text-neutral-400 font-medium tracking-wide text-sm sm:text-base mt-6 sm:mt-8">
            <span className="hover:text-white transition-colors">Analyze</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
            <span className="hover:text-white transition-colors">Discover</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
            <span className="hover:text-white transition-colors">Investigate</span>
          </div>

          {/* Subtext description */}
          <p className="mt-6 text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            Correlate call detail records, encrypted transactions, geospatial logs, and multi-tier
            criminal syndicates in real time with automated neural reasoning.
          </p>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-6 mt-10 sm:mt-14">
            {/* Watch Overview Interactive Button */}
            <button
              onClick={() => setVideoModalOpen(true)}
              className="group flex items-center space-x-4 focus:outline-none"
              type="button"
            >
              <div className="w-14 h-14 rounded-full border border-neutral-400 group-hover:border-white flex items-center justify-center transition duration-300 icon-glow bg-black/40 backdrop-blur-sm group-hover:scale-105">
                <Play className="w-5 h-5 text-neutral-300 group-hover:text-white translate-x-0.5 fill-white/20" />
              </div>
              <span className="text-sm font-semibold tracking-wider text-neutral-300 group-hover:text-white transition duration-200">
                Watch Overview
              </span>
            </button>

            {/* Direct Platform Access Button */}
            <Link
              href="/login"
              className="px-6 py-3.5 text-xs uppercase font-mono tracking-widest text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-lg shadow-lg shadow-red-600/30 transition duration-200 flex items-center gap-2"
            >
              <span>Launch Terminal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* BEGIN: SystemStatusFooter */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto pt-6 border-t border-neutral-900/60 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-neutral-500 gap-4">
        <div className="flex items-center space-x-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-slate-400">SYSTEM OPERATIONAL // NODE LATENCY: 12ms // CORE v4.2</span>
        </div>
        <div className="flex items-center gap-2 text-red-400/80">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>LAW ENFORCEMENT &amp; INTELLIGENCE AGENCIES ONLY</span>
        </div>
      </footer>

      {/* Video / Briefing Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl rounded-2xl bg-[#090f1d] border border-[#1b2b46] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#141f33]">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span>CIPHER Operational Briefing // Classification: SECRET</span>
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Briefing preview video visualizer */}
            <div className="mt-4 aspect-video rounded-xl bg-black border border-[#15233c] relative overflow-hidden flex flex-col items-center justify-center text-center p-6">
              <div className="absolute inset-0 radar-grid opacity-30" />
              <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center text-red-400 mb-4 animate-pulse">
                <Play className="w-6 h-6 fill-current" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-wide">
                CIPHER AI Operational Demonstration
              </h4>
              <p className="text-xs text-slate-400 max-w-md mt-2">
                Demonstrating automated cross-case correlation, bridge entity discovery, and forensic timeline reconstruction.
              </p>
              <Link
                href="/login"
                className="mt-6 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold uppercase font-mono tracking-wider shadow"
              >
                Proceed to Platform Demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
