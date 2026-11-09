"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Compass,
  Layers,
  Calendar,
  Filter,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Radio,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
} from "lucide-react";
import NexusHeader from "@/components/NexusHeader";
import StatusBadge from "@/components/StatusBadge";
import { useInvestigation } from "@/components/InvestigationContext";
import { MapWaypoint, CaseGeospatialData } from "@/lib/geospatial-service";

function GeospatialContent() {
  const searchParams = useSearchParams();
  const { activeCaseId, activeCaseTitle } = useInvestigation();

  const [geospatialData, setGeospatialData] = useState<CaseGeospatialData | null>(null);
  const [waypoints, setWaypoints] = useState<MapWaypoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<MapWaypoint | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeStep, setTimeStep] = useState(3);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch case-scoped geospatial data whenever activeCaseId changes
  useEffect(() => {
    if (!activeCaseId) return;
    setIsLoading(true);
    fetch(`/api/investigations/${activeCaseId}/geospatial`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setGeospatialData(data.data);
          const pts = data.data.waypoints || [];
          setWaypoints(pts);

          // Check if focusNode query param matches any waypoint
          const focusNodeParam = searchParams.get("focusNode");
          if (focusNodeParam) {
            const matched = pts.find(
              (p: MapWaypoint) =>
                p.associatedNodeId === focusNodeParam ||
                p.name.toLowerCase().includes(focusNodeParam.toLowerCase()) ||
                p.entities.some((e: string) => e.toLowerCase().includes(focusNodeParam.toLowerCase()))
            );
            if (matched) {
              setSelectedPoint(matched);
              return;
            }
          }

          if (pts.length > 0) {
            setSelectedPoint(pts[0]);
          } else {
            setSelectedPoint(null);
          }
        }
      })
      .catch((err) => console.error("Failed to load geospatial data:", err))
      .finally(() => setIsLoading(false));
  }, [activeCaseId, searchParams]);

  // Timeline playback simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeStep((prev) => (prev >= 5 ? 1 : prev + 1));
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const filteredWaypoints = waypoints.filter((wp) => {
    if (filterType === "ALL") return true;
    return wp.type === filterType.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col selection:bg-red-600 selection:text-white">
      <NexusHeader
        moduleTitle="GEOSPATIAL INTELLIGENCE"
        badge="TACTICAL MAPPING"
        activeCase={`${activeCaseId} // ${activeCaseTitle.toUpperCase()}`}
      />

      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 flex flex-col h-[calc(100vh-4rem)] space-y-3">
        {/* Top Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#101722] border border-[#1e2a3b] p-3 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-[#39d9ff]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-sans uppercase tracking-wide flex items-center gap-2">
                <span>TACTICAL MOVEMENT &amp; GEOLOCATION VECTOR MAP</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded">
                  {geospatialData?.jurisdiction || "ACTIVE SECTOR"}
                </span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                PROJECTION: WGS 84 • DATUM: {geospatialData?.centerCoordinates || "51.9244° N, 4.4777° E"} • CASE: {activeCaseId}
              </span>
            </div>
          </div>

          {/* Filters & Timeline Controls */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            {/* Waypoint Type Filter */}
            <div className="flex items-center gap-1 bg-[#080b12] p-1 rounded-lg border border-[#1e2a3b]">
              {["ALL", "PRIORITY", "INTELLIGENCE", "TRANSIT"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterType(tab)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                    filterType === tab
                      ? "bg-[#162338] text-cyan-300 font-bold border border-cyan-800/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Timeline Playback Controls */}
            <div className="flex items-center gap-1.5 bg-[#080b12] px-3 py-1.5 rounded-lg border border-[#1e2a3b]">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-[#39d9ff] hover:text-white p-1 transition-colors"
                title="Play/Pause Movement Path"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setTimeStep(1)}
                className="text-slate-400 hover:text-white p-1 transition-colors"
                title="Reset Timeline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-400 ml-1 text-[11px]">
                Step {timeStep}/5 • Chrono Synced
              </span>
            </div>

            <StatusBadge label="GEO-FEED ACTIVE" variant="active" />
          </div>
        </div>

        {/* Main Map & Inspector Area */}
        <div className="flex-1 min-h-0 rounded-2xl border border-[#1e2a3b] bg-[#070c14] overflow-hidden flex flex-col md:flex-row relative shadow-2xl">
          {/* Tactical Vector Canvas Area */}
          <div className="flex-1 relative radar-grid overflow-hidden flex items-center justify-center">
            {/* Top-Right Canvas Zoom Controls */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-[#080d19]/90 border border-[#1b2636] p-1 rounded-lg shadow-lg">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-[#16233a] rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-[#16233a] rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white rounded"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
            </div>

            {/* Coordinate Grid Overlay */}
            <svg
              className="w-full h-full absolute inset-0 pointer-events-none transition-transform duration-300"
              viewBox="0 0 900 560"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
            >
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff3b30" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#39d9ff" stopOpacity="0.4" />
                </linearGradient>
                <filter id="geoGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="140" x2="900" y2="140" stroke="#121b29" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="280" x2="900" y2="280" stroke="#121b29" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="420" x2="900" y2="420" stroke="#121b29" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="225" y1="0" x2="225" y2="560" stroke="#121b29" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="450" y1="0" x2="450" y2="560" stroke="#121b29" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="675" y1="0" x2="675" y2="560" stroke="#121b29" strokeWidth="1" strokeDasharray="4 4" />

              {/* Waypoint Interconnecting Trajectory Paths */}
              {filteredWaypoints.length > 1 && (
                <path
                  d={filteredWaypoints.reduce(
                    (acc, wp, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${wp.x} ${wp.y}`,
                    ""
                  )}
                  fill="none"
                  stroke="url(#pathGradient)"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              )}
            </svg>

            {/* Interactive Waypoints */}
            <div
              className="absolute inset-0 transition-transform duration-300 pointer-events-auto"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
            >
              {filteredWaypoints.map((wp) => {
                const isSelected = selectedPoint?.id === wp.id;
                return (
                  <div
                    key={wp.id}
                    onClick={() => setSelectedPoint(wp)}
                    style={{ left: `${(wp.x / 900) * 100}%`, top: `${(wp.y / 560) * 100}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                  >
                    {/* Pulsing ring on selection */}
                    {isSelected && (
                      <div className="absolute inset-0 -m-3 rounded-full border border-[#39d9ff] animate-ping pointer-events-none" />
                    )}

                    {/* Outer marker ring */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        wp.type === "priority"
                          ? "bg-red-950/80 border-2 border-[#ff3b30] text-[#ff3b30]"
                          : wp.type === "transit"
                          ? "bg-amber-950/80 border-2 border-amber-400 text-amber-400"
                          : "bg-cyan-950/80 border-2 border-[#39d9ff] text-[#39d9ff]"
                      } ${isSelected ? "scale-125 shadow-[0_0_16px_rgba(57,217,255,0.6)]" : "group-hover:scale-110"}`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </div>

                    {/* Tag label */}
                    <span
                      className={`absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono px-2 py-0.5 rounded shadow-lg transition-all ${
                        isSelected
                          ? "bg-white text-black font-bold scale-105"
                          : "bg-[#0a111e]/90 text-slate-300 border border-[#1b2b46] group-hover:text-white"
                      }`}
                    >
                      {wp.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Left Legend */}
            <div className="absolute left-4 bottom-4 p-3 rounded-xl bg-[#080d19]/90 border border-[#1b2636] flex items-center gap-4 text-[10px] font-mono text-slate-400 shadow-xl pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30]" />
                <span>Priority Raid Target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#39d9ff]" />
                <span>Intercept / Sensor Node</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Transit Checkpoint</span>
              </div>
            </div>
          </div>

          {/* Right Inspector Panel */}
          {selectedPoint ? (
            <aside className="w-full md:w-84 border-t md:border-t-0 md:border-l border-[#1e2a3b] bg-[#101722] p-5 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#1b2636] pb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    LOCATION INTELLIGENCE
                  </span>
                  <StatusBadge
                    label={selectedPoint.type === "priority" ? "HIGH PRIORITY" : selectedPoint.type.toUpperCase()}
                    variant={selectedPoint.type === "priority" ? "priority-high" : "cyan"}
                  />
                </div>

                <div>
                  <h3 className="text-base font-bold text-white font-sans">{selectedPoint.name}</h3>
                  <span className="text-xs text-[#39d9ff] font-mono block mt-0.5">
                    {selectedPoint.latLong}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080b12] border border-[#182333] text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedPoint.details}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Associated Entities at Coordinates
                  </span>
                  <div className="space-y-1.5">
                    {selectedPoint.entities.map((ent, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#151e2b] border border-[#1e2a3b] text-xs font-mono text-white flex items-center justify-between"
                      >
                        <span>{ent}</span>
                        <Radio className="w-3 h-3 text-[#ff3b30]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons with Bidirectional Workflow */}
              <div className="pt-4 border-t border-[#1b2636] space-y-2.5">
                {/* Bidirectional Link: View in Network Analysis */}
                <Link
                  href={`/network-analysis?focusNode=${selectedPoint.associatedNodeId || selectedPoint.id}`}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#142238] hover:bg-[#1a2e4e] text-cyan-300 hover:text-white border border-cyan-700/60 hover:border-cyan-400 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>[ VIEW IN NETWORK ANALYSIS ]</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </Link>

                <button
                  type="button"
                  onClick={() => alert(`Issued tactical geofence alert for ${selectedPoint.name}`)}
                  className="w-full py-2.5 px-3 rounded-lg btn-red-glow text-white text-xs font-mono font-semibold uppercase tracking-wider"
                >
                  [ SET TACTICAL GEOFENCE ]
                </button>
              </div>
            </aside>
          ) : (
            <aside className="w-full md:w-84 border-t md:border-t-0 md:border-l border-[#1e2a3b] bg-[#101722] p-5 flex items-center justify-center text-xs font-mono text-slate-500">
              Select a tactical waypoint to inspect coordinates.
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}

export default function GeospatialPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#05070b] text-white flex items-center justify-center font-mono text-sm">
          LOADING TACTICAL GEOSPATIAL MAP...
        </div>
      }
    >
      <GeospatialContent />
    </Suspense>
  );
}
