"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CIPHER_MODULES, isModuleActive } from "@/lib/modules-config";

export default function TopModuleNavigation() {
  const pathname = usePathname();
  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const [pulsingModuleId, setPulsingModuleId] = useState<string | null>(null);

  // Auto-scroll active navigation item into view horizontally
  useEffect(() => {
    if (navContainerRef.current) {
      const activeEl = navContainerRef.current.querySelector('[aria-current="page"]');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [pathname]);

  // Listen for ambient network data packet arrival pulse event
  useEffect(() => {
    const handlePulse = (event: Event) => {
      const customEvt = event as CustomEvent<{ moduleId: string }>;
      if (customEvt.detail?.moduleId) {
        setPulsingModuleId(customEvt.detail.moduleId);
        const timer = setTimeout(() => {
          setPulsingModuleId((curr) => (curr === customEvt.detail.moduleId ? null : curr));
        }, 450);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener("cipher-nav-pulse", handlePulse);
    return () => {
      window.removeEventListener("cipher-nav-pulse", handlePulse);
    };
  }, []);

  return (
    <nav
      aria-label="Global Module Navigation"
      className="w-full bg-[#060911]/95 backdrop-blur-md border-b border-[#182333] shadow-sm select-none relative z-10 transition-all duration-300 animate-fadeIn"
    >
      <div className="max-w-[1920px] mx-auto relative flex items-center">
        {/* Horizontal Navigation Row */}
        <div
          ref={navContainerRef}
          className="flex items-center px-3 sm:px-6 lg:px-8 py-1 overflow-x-auto scrollbar-none whitespace-nowrap gap-1 sm:gap-1.5 w-full scroll-smooth"
        >
          {CIPHER_MODULES.map((module) => {
            const Icon = module.icon;
            const isActive = isModuleActive(pathname, module);
            const isPulsing = pulsingModuleId === module.id;

            return (
              <Link
                key={module.id}
                href={module.href}
                data-module-id={module.id}
                aria-current={isActive ? "page" : undefined}
                className={`group relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-semibold tracking-wider transition-all duration-200 shrink-0 ${
                  isActive
                    ? "text-white bg-gradient-to-b from-red-950/50 via-red-900/20 to-transparent border-b-2 border-[#ff3b30] shadow-[0_2px_12px_rgba(255,59,48,0.5)]"
                    : isPulsing
                    ? "text-cyan-300 bg-cyan-950/40 ring-1 ring-cyan-400/80 shadow-[0_0_16px_rgba(6,182,212,0.6)] border-b-2 border-cyan-400"
                    : "text-slate-400 hover:text-slate-100 hover:bg-[#0e1524] border-b-2 border-transparent"
                }`}
                title={module.description || module.label}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                    isActive
                      ? "text-[#ff3b30] drop-shadow-[0_0_8px_rgba(255,59,48,0.8)]"
                      : isPulsing
                      ? "text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,1)] scale-110"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                <span>{module.label}</span>

                {module.badge && (
                  <span
                    className={`ml-1 text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                      module.badgeColor || "bg-[#101722] text-slate-300 border-slate-700"
                    }`}
                  >
                    {module.badge}
                  </span>
                )}

                {/* Subtle active status indicator dot */}
                {isActive && !module.badge && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_6px_#ff3b30]" />
                )}
                {/* Settle pulse flare */}
                {isPulsing && !isActive && (
                  <span className="absolute -top-1 right-1/2 translate-x-1/2 w-8 h-[2px] bg-cyan-400 blur-[1px] animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
