"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ModuleCardProps {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeVariant?: "red" | "cyan" | "default";
  ctaText?: string;
}

export default function ModuleCard({
  id,
  title,
  icon: Icon,
  href,
  badge,
  badgeVariant = "default",
  ctaText = "OPEN MODULE",
}: ModuleCardProps) {
  const getBadgeClass = () => {
    switch (badgeVariant) {
      case "red":
        return "bg-red-950/70 text-red-400 border-red-800/60";
      case "cyan":
        return "bg-cyan-950/70 text-cyan-400 border-cyan-800/60";
      default:
        return "bg-[#151e2b] text-slate-300 border-[#1e2a3b]";
    }
  };

  return (
    <Link
      href={href}
      className="card-nexus group relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden cursor-pointer select-none min-h-[160px] sm:min-h-[170px] transition-all duration-200"
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl group-hover:bg-red-600/10 transition-colors pointer-events-none" />

      <div>
        {/* Top bar: Icon & Badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#131d2b] border border-[#1e2a3b] group-hover:border-red-500/40 flex items-center justify-center text-slate-300 group-hover:text-white transition-colors shadow-inner">
            <Icon className="w-5 h-5 text-[#39d9ff] group-hover:text-[#ff3b30] transition-colors" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-600 group-hover:text-slate-500 transition-colors">
              {id}
            </span>
            {badge && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${getBadgeClass()}`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase font-sans group-hover:text-[#ff3b30] transition-colors">
            {title}
          </h3>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="pt-4 mt-4 border-t border-[#1a2536] flex items-center justify-between text-xs font-semibold font-mono text-slate-400 group-hover:text-white transition-colors">
        <span className="tracking-wider text-[11px] text-[#ff3b30] group-hover:underline underline-offset-4">
          [ {ctaText} → ]
        </span>
        <div className="w-6 h-6 rounded-full bg-[#131d2b] border border-[#1e2a3b] group-hover:border-[#ff3b30] flex items-center justify-center text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all">
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#ff3b30]" />
        </div>
      </div>
    </Link>
  );
}
