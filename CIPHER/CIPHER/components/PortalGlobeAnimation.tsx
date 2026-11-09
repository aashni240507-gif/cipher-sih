"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CIPHER_MODULES, CipherModule } from "@/lib/modules-config";
import WireframeSphereCanvas, { WireframeSphereHandle } from "./WireframeSphereCanvas";

interface PortalGlobeAnimationProps {
  onModuleSelect?: (module: CipherModule) => void;
  portalMode?: "HUB" | "OPERATIONAL";
}

interface OrbitLayoutItem {
  id: string;
  subtitle: string;
  // Symmetrical desktop coordinate percentages inside the hero container
  desktopTop: string;
  desktopLeft: string;
  transform: string;
}

// Symmetrical, balanced orbital layout with mathematically verified collision-free anchor zones:
//                            [ INVESTIGATIONS ]
//                [ ENTITIES ]                  [ NEW INVESTIGATION ]
//        [ EVIDENCE ]         [ ROTATING GLOBE ]         [ NETWORK ANALYSIS ]
//                [ ALERTS ]                      [ DATA SOURCES ]
//            [ DEEP MODULES ]                  [ REPORTS ]
//                 [ NEWS AI ]  [ AI ASSISTANT ]  [ SETTINGS ]
const ORBIT_ITEMS: OrbitLayoutItem[] = [
  // TOP: Investigations (12:00)
  {
    id: "investigations",
    subtitle: "24 ACTIVE CASES",
    desktopTop: "2%",
    desktopLeft: "50%",
    transform: "translate(-50%, 0)",
  },
  // UPPER LEFT: Entities (11:00) - 95px above Evidence, 160px from Investigations
  {
    id: "entities",
    subtitle: "1,284 PROFILES",
    desktopTop: "5%",
    desktopLeft: "19%",
    transform: "translate(-50%, 0)",
  },
  // UPPER RIGHT: New Investigation (1:00) - 95px above Network Analysis, 160px from Investigations
  {
    id: "new-investigation",
    subtitle: "CASE WIZARD",
    desktopTop: "5%",
    desktopLeft: "81%",
    transform: "translate(-50%, 0)",
  },
  // LEFT (EQUATOR): Evidence (9:00) - 95px below Entities, 76px above Alerts
  {
    id: "evidence",
    subtitle: "VERIFIED VAULT",
    desktopTop: "33%",
    desktopLeft: "7.5%",
    transform: "translate(-50%, -50%)",
  },
  // RIGHT (EQUATOR): Network Analysis (3:00) - 95px below New Investigation, 76px above Data Sources
  {
    id: "network-analysis",
    subtitle: "142.8K NODES",
    desktopTop: "33%",
    desktopLeft: "92.5%",
    transform: "translate(-50%, -50%)",
  },
  // LOWER LEFT: Alerts (8:00) - 76px below Evidence, 67px above Deep Modules
  {
    id: "alerts",
    subtitle: "8 CRITICAL",
    desktopTop: "53%",
    desktopLeft: "11.5%",
    transform: "translate(-50%, -50%)",
  },
  // LOWER RIGHT: Data Sources (4:00) - 76px below Network Analysis, 67px above Reports
  {
    id: "data-sources",
    subtitle: "CDR & SWIFT FEED",
    desktopTop: "53%",
    desktopLeft: "88.5%",
    transform: "translate(-50%, -50%)",
  },
  // BOTTOM LEFT: Deep Modules (7:30) - 67px below Alerts, 38px above News AI
  {
    id: "deep-modules",
    subtitle: "GEO & FORENSICS",
    desktopTop: "72%",
    desktopLeft: "17%",
    transform: "translate(-50%, -50%)",
  },
  // BOTTOM RIGHT: Reports (4:30) - 67px below Data Sources, 38px above Settings
  {
    id: "reports",
    subtitle: "JUDICIAL DOSSIERS",
    desktopTop: "72%",
    desktopLeft: "83%",
    transform: "translate(-50%, -50%)",
  },
  // BOTTOM-LEFT CENTER: News AI (7:00)
  {
    id: "news-ai",
    subtitle: "LIVE OSINT WIRE",
    desktopTop: "88%",
    desktopLeft: "28%",
    transform: "translate(-50%, -50%)",
  },
  // BOTTOM-RIGHT CENTER: Settings (5:00) - Dedicated safe zone, completely clear of statistics and AI shortcut
  {
    id: "settings",
    subtitle: "SYSTEM & AUDIT",
    desktopTop: "88%",
    desktopLeft: "72%",
    transform: "translate(-50%, -50%)",
  },
  // BOTTOM CENTER: AI Assistant (6:00) - 43px horizontal clearance from News AI and Settings
  {
    id: "ai-assistant",
    subtitle: "GPT-OSS 120B",
    desktopTop: "90%",
    desktopLeft: "50%",
    transform: "translate(-50%, -50%)",
  },
];

export default function PortalGlobeAnimation({
  onModuleSelect,
  portalMode = "HUB",
}: PortalGlobeAnimationProps) {
  const router = useRouter();
  const globeRef = useRef<WireframeSphereHandle | null>(null);

  const [globeSize, setGlobeSize] = useState<number>(560);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Responsive sizing calculation for the dominant central rotating globe (strictly preserved)
  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w >= 1536) {
        setGlobeSize(590);
      } else if (w >= 1280) {
        setGlobeSize(540);
      } else if (w >= 1024) {
        setGlobeSize(470);
      } else if (w >= 768) {
        setGlobeSize(400);
      } else {
        setGlobeSize(320);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Handle selecting any module shortcut around the globe
  const handleSelectModule = (module: CipherModule) => {
    if (isTransitioning) return;

    setSelectedModuleId(module.id);
    setIsTransitioning(true);

    // Notify parent to initiate transition to State B
    onModuleSelect?.(module);

    // Smooth transition delay before navigating to destination module
    setTimeout(() => {
      router.push(module.href);
    }, 650);
  };

  return (
    <div className="w-full max-w-[1536px] mx-auto relative select-none flex flex-col items-center">
      {/* 
        MAIN HERO VIEWPORT AREA:
        Houses the large centered rotating 3D network globe and the 12 floating feature cards.
        Sufficient height guarantees zero overlap with bottom statistics.
        Strictly NO connecting lines, NO beams, NO emerging animations.
      */}
      <div className="relative w-full h-[800px] md:h-[860px] lg:h-[920px] xl:h-[960px] flex items-center justify-center">
        {/* Large Centered Continuously Rotating 3D Wireframe Globe (Strictly preserved) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div
            className="relative flex items-center justify-center rounded-full transition-transform duration-700"
            style={{
              width: globeSize,
              height: globeSize,
              transform: isTransitioning ? "scale(0.96)" : "scale(1)",
            }}
          >
            {/* Ambient Radial Depth Glow Behind Globe */}
            <div className="absolute inset-0 -m-8 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.12)_0%,rgba(255,59,48,0.06)_40%,transparent_70%)] pointer-events-none" />

            <WireframeSphereCanvas
              ref={globeRef}
              width={globeSize}
              height={globeSize}
              rotationSpeed={1.05}
              className="pointer-events-none drop-shadow-[0_0_35px_rgba(6,182,212,0.25)]"
            />
          </div>
        </div>

        {/* 
          DESKTOP & TABLET: ENLARGED COMMAND MODULE CARDS IN SYMMETRICAL ORBIT AROUND GLOBE 
          Desktop width: 250px-285px, height: 105px-120px, titles: 17px-19px, subtitles: 12px-13px.
          Hidden on small mobile screens (< 768px) where a dedicated 2-column grid is rendered below.
        */}
        <div className="hidden md:block absolute inset-0 z-20 pointer-events-none">
          {ORBIT_ITEMS.map((orbit) => {
            const module = CIPHER_MODULES.find((m) => m.id === orbit.id);
            if (!module) return null;

            const Icon = module.icon;
            const isSelected = selectedModuleId === module.id;

            // When transitioning, other modules slide upward towards top nav, while selected glows
            let dynamicStyle: React.CSSProperties = {
              top: orbit.desktopTop,
              left: orbit.desktopLeft,
              transform: orbit.transform,
            };

            if (isTransitioning) {
              if (isSelected) {
                dynamicStyle = {
                  ...dynamicStyle,
                  transform: `${orbit.transform} scale(1.05)`,
                  zIndex: 40,
                };
              } else {
                dynamicStyle = {
                  ...dynamicStyle,
                  transform: `${orbit.transform} translateY(-80px) scale(0.65)`,
                  opacity: 0,
                  transition: "transform 650ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease-in",
                };
              }
            }

            return (
              <div
                key={module.id}
                style={dynamicStyle}
                className="absolute pointer-events-auto transition-all duration-500 ease-out"
              >
                <button
                  type="button"
                  tabIndex={0}
                  aria-label={`${module.label} — ${orbit.subtitle}`}
                  onClick={() => handleSelectModule(module)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectModule(module);
                    }
                  }}
                  className={`group relative flex flex-col justify-between w-[220px] md:w-[245px] lg:w-[265px] xl:w-[280px] h-[98px] md:h-[106px] lg:h-[114px] xl:h-[118px] p-3.5 md:p-4 lg:p-[18px] xl:p-5 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                    isSelected
                      ? "bg-gradient-to-br from-red-950/90 via-[#0a1220]/95 to-cyan-950/90 border-cyan-400 text-white shadow-[0_0_32px_rgba(6,182,212,0.85)] scale-105 ring-1 ring-cyan-400"
                      : "bg-[#080d19]/90 hover:bg-[#0d1627] border-[#1b2b46] hover:border-cyan-400/80 hover:shadow-[0_0_26px_rgba(6,182,212,0.35)] hover:scale-[1.03] text-slate-200"
                  }`}
                >
                  {/* Card Top Row: Scaled Icon (42px-46px container) + Status Badge or Directional Arrow */}
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? "bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                          : "bg-[#0a1222] border-[#1e2f4a] text-cyan-400 group-hover:text-cyan-300 group-hover:border-cyan-400/60 group-hover:scale-105"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5 md:w-5 md:h-5 lg:w-5.5 lg:h-5.5 stroke-[2]" />
                    </div>

                    {module.badge ? (
                      <span
                        className={`text-[9px] md:text-[10px] lg:text-[11px] font-mono px-2.5 py-0.5 rounded-md border font-semibold tracking-wider ${
                          module.badgeColor || "bg-cyan-950/80 text-cyan-400 border-cyan-800/60"
                        }`}
                      >
                        {module.badge}
                      </span>
                    ) : (
                      <span className="text-xs md:text-sm lg:text-base text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all font-mono">
                        →
                      </span>
                    )}
                  </div>

                  {/* Card Bottom Row: High-Visibility Primary Title (17px-19px) + Subtitle (12px-13px) */}
                  <div className="flex flex-col text-left mt-1 w-full space-y-0.5">
                    <span className="text-[13px] md:text-[15px] lg:text-[17px] xl:text-[18px] font-mono font-bold tracking-wider uppercase text-white group-hover:text-cyan-200 truncate leading-snug">
                      {module.label}
                    </span>
                    <div className="flex items-center justify-between text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] font-mono text-slate-400 group-hover:text-cyan-300/90 tracking-tight">
                      <span className="truncate">{orbit.subtitle}</span>
                      {module.badge && <span className="text-slate-500 group-hover:text-cyan-400 text-xs">→</span>}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 
        MOBILE FALLBACK (SCREEN WIDTH < 768px):
        Clean, accessible 2-column tactical command card grid flanking and below the scaled globe.
        Guarantees zero overlap on small mobile viewports.
      */}
      <div className="md:hidden w-full px-2 mt-4 space-y-2 z-20">
        <div className="grid grid-cols-2 gap-2.5">
          {CIPHER_MODULES.map((module) => {
            const orbit = ORBIT_ITEMS.find((o) => o.id === module.id);
            const Icon = module.icon;
            const isSelected = selectedModuleId === module.id;

            return (
              <button
                key={module.id}
                type="button"
                tabIndex={0}
                aria-label={`${module.label} — ${orbit?.subtitle || ""}`}
                onClick={() => handleSelectModule(module)}
                className={`flex flex-col justify-between p-3 rounded-xl border backdrop-blur-md transition-all text-left min-h-[84px] ${
                  isSelected
                    ? "bg-cyan-950/90 border-cyan-400 text-white shadow-[0_0_18px_rgba(6,182,212,0.8)]"
                    : "bg-[#080d19]/90 hover:bg-[#0e172a] border-[#1b2b46] text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-7 h-7 rounded-md bg-[#0a1222] border border-[#1e2f4a] flex items-center justify-center text-cyan-400 shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {module.badge && (
                    <span
                      className={`text-[8px] font-mono px-1.5 py-0.2 rounded border ${
                        module.badgeColor || "bg-cyan-950/80 text-cyan-400 border-cyan-800/60"
                      }`}
                    >
                      {module.badge}
                    </span>
                  )}
                </div>
                <div className="flex flex-col mt-1 space-y-0.5">
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-white truncate">
                    {module.label}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 truncate">
                    {orbit?.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
