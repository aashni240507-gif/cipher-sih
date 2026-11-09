"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Brain, Sparkles } from "lucide-react";

export default function FloatingAIAssistant() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 select-none">
      {/* Tooltip on hover */}
      <div
        className={`absolute bottom-full right-0 mb-2.5 px-3 py-1.5 rounded-lg bg-[#060c18]/95 border border-cyan-500/40 shadow-[0_4px_16px_rgba(0,0,0,0.8),0_0_12px_rgba(6,182,212,0.3)] text-cyan-300 text-[11px] font-mono font-bold tracking-wider whitespace-nowrap backdrop-blur-md pointer-events-none transition-all duration-200 ${
          isHovered
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-1 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#39d9ff]" />
          <span>CIPHER AI ASSISTANT</span>
        </div>
      </div>

      {/* Floating Action Button */}
      <Link
        href="/ai-assistant"
        aria-label="Open CIPHER AI Assistant"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center justify-center w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-2xl bg-gradient-to-br from-[#0e192d] to-[#060b16] border border-cyan-500/40 hover:border-cyan-400/90 shadow-[0_0_24px_rgba(6,182,212,0.35),inset_0_0_12px_rgba(6,182,212,0.15)] hover:shadow-[0_0_36px_rgba(6,182,212,0.65),inset_0_0_16px_rgba(6,182,212,0.25)] transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-400/80"
      >
        {/* Ambient subtle backglow */}
        <div className="absolute inset-0 rounded-2xl bg-cyan-500/10 blur-md pointer-events-none group-hover:bg-cyan-400/20 transition-colors" />

        {/* Live status telemetry dot */}
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#39d9ff] animate-ping" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400" />

        {/* Tactical AI Brain Icon */}
        <Brain className="relative w-6 h-6 sm:w-7 sm:h-7 text-cyan-300 group-hover:text-white transition-colors drop-shadow-[0_0_8px_rgba(57,217,255,0.8)]" />
      </Link>
    </div>
  );
}
