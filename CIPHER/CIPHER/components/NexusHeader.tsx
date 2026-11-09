"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  ArrowLeft,
  Search,
  Bell,
  ShieldCheck,
  Radio,
  Clock,
  User,
  SlidersHorizontal,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useInvestigation } from "@/components/InvestigationContext";
import TopModuleNavigation from "./TopModuleNavigation";

interface NexusHeaderProps {
  moduleTitle?: string;
  badge?: string;
  activeCase?: string;
  hideTopNav?: boolean;
}

export default function NexusHeader({
  moduleTitle,
  badge,
  activeCase,
  hideTopNav = false,
}: NexusHeaderProps) {
  const pathname = usePathname();
  const isPortal = pathname === "/dashboard" || pathname === "/portal";

  const { user, initials, logout } = useAuth();
  const {
    activeCaseId,
    activeCaseTitle,
    investigations,
    setActiveInvestigationId,
  } = useInvestigation();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [caseDropdownOpen, setCaseDropdownOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const caseMenuRef = useRef<HTMLDivElement>(null);

  const displayActiveDossier =
    activeCase && activeCase !== "INV-2026-0142 // OPERATION NEXUS"
      ? activeCase
      : `${activeCaseId} // ${activeCaseTitle.toUpperCase()}`;

  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) +
          " " +
          now.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }) +
          " UTC"
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

    // Handle clicking outside and pressing Escape to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
      if (caseMenuRef.current && !caseMenuRef.current.contains(target)) {
        setCaseDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileDropdownOpen(false);
        setCaseDropdownOpen(false);
      }
    };

    if (profileDropdownOpen || caseDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileDropdownOpen, caseDropdownOpen]);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 select-none flex flex-col w-full shadow-md">
      {/* Top Header Bar */}
      <div className="h-16 border-b border-[#1b2636] bg-[#080b12]/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between w-full relative z-30">
      {/* Left: Brand Identity & Back to Portal Navigation */}
      <div className="flex items-center gap-4 lg:gap-6 min-w-0">
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-red-950/80 to-black border border-red-500/50 shadow-md shadow-red-950/40 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-4 h-4 text-[#ff3b30] drop-shadow-[0_0_8px_rgba(255,59,48,0.7)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-widest text-white uppercase font-sans leading-none">
              CIPHER
            </span>
            <span className="text-[8px] tracking-[0.2em] text-[#8e9cb0] uppercase font-mono mt-0.5 hidden sm:inline">
              CRIMINAL NETWORK ANALYSIS
            </span>
          </div>
        </Link>

        {/* Breadcrumb / Back button if on inner pages */}
        {!isPortal && (
          <div className="flex items-center gap-3 border-l border-[#1c2a3d] pl-4 lg:pl-6 min-w-0">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101722] hover:bg-[#151e2b] border border-[#1e2a3b] text-xs font-semibold text-slate-300 hover:text-white transition-colors group shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#ff3b30] group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden md:inline">Back to</span>
              <span>Portal</span>
            </Link>

            {moduleTitle && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-slate-600 font-mono">/</span>
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate font-sans">
                  {moduleTitle}
                </span>
                {badge && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#151e2b] text-[#39d9ff] border border-[#1e2a3b] shrink-0">
                    {badge}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Middle: Active Case Badge with Tactical Case Switcher */}
      <div className="hidden xl:flex items-center relative z-40" ref={caseMenuRef}>
        <button
          type="button"
          onClick={() => setCaseDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d141f] hover:bg-[#131d2c] border border-[#1c2a3d] hover:border-cyan-500/50 text-xs font-mono transition-all cursor-pointer shadow-sm group"
          title="Click to Switch Active Dossier"
          aria-expanded={caseDropdownOpen}
          aria-haspopup="listbox"
        >
          <Radio className="w-3 h-3 text-[#ff3b30] animate-pulse" />
          <span className="text-slate-400">ACTIVE DOSSIER:</span>
          <span className="text-[#39d9ff] font-semibold tracking-wide">
            {displayActiveDossier}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${
              caseDropdownOpen ? "rotate-180 text-cyan-300" : ""
            }`}
          />
        </button>

        {/* Case Switcher Popover */}
        {caseDropdownOpen && (
          <div
            role="listbox"
            aria-label="Active Dossier Selection"
            className="absolute top-full left-0 mt-2 w-96 rounded-2xl bg-[#080d17]/98 border border-[#1e2c44] shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_24px_rgba(6,182,212,0.15)] backdrop-blur-xl p-3 space-y-2 z-50 text-left"
          >
            <div className="px-2 py-1 border-b border-[#172233] flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="uppercase tracking-wider font-semibold text-slate-300">
                SWITCH INVESTIGATION DOSSIER
              </span>
              <span className="text-cyan-400">{investigations.length} CASES</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
              {investigations.map((inv) => {
                const isCurrent =
                  inv.caseId.toLowerCase() === activeCaseId.toLowerCase() ||
                  inv.id.toLowerCase() === activeCaseId.toLowerCase();

                return (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => {
                      setActiveInvestigationId(inv.id);
                      setCaseDropdownOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                        : "bg-[#0d1522] hover:bg-[#121c2d] border-[#182638] hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">
                        {inv.caseId}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border ${
                          inv.priority === "CRITICAL" || inv.priority === "HIGH"
                            ? "bg-red-950/80 text-[#ff3b30] border-red-800/60"
                            : "bg-[#101926] text-slate-300 border-slate-700"
                        }`}
                      >
                        {inv.priority}
                      </span>
                    </div>
                    <span className="text-xs text-slate-300 font-sans font-medium truncate">
                      {inv.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono truncate">
                      {inv.jurisdiction}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#172233] flex items-center justify-between">
              <Link
                href="/investigations/new"
                onClick={() => setCaseDropdownOpen(false)}
                className="text-[11px] font-mono text-[#ff3b30] hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>+ Launch New Investigation</span>
              </Link>
              <Link
                href="/investigations"
                onClick={() => setCaseDropdownOpen(false)}
                className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
              >
                <span>View All Dossiers →</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Right: Telemetry, Clock, Quick Search, Notifications, Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Live Date/Time */}
        <div className="hidden 2xl:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentTime || "UTC"}</span>
        </div>

        {/* Security Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b1018] border border-[#182333] text-[10px] font-mono text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>TLS 1.3 / E2E ENCRYPTED</span>
        </div>

        {/* Global Search Button */}
        <Link
          href="/search"
          className="p-2 rounded-lg bg-[#101722] hover:bg-[#151e2b] border border-[#1e2a3b] text-slate-400 hover:text-white transition-colors"
          title="Global Intelligence Search"
        >
          <Search className="w-4 h-4" />
        </Link>

        {/* Alerts Bell */}
        <Link
          href="/alerts"
          className="relative p-2 rounded-lg bg-[#101722] hover:bg-[#151e2b] border border-[#1e2a3b] text-slate-400 hover:text-white transition-colors"
          title="High Priority Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff3b30] shadow-[0_0_8px_#ff3b30]" />
        </Link>

        {/* Settings */}
        <Link
          href="/settings"
          className="p-2 rounded-lg bg-[#101722] hover:bg-[#151e2b] border border-[#1e2a3b] text-slate-400 hover:text-white transition-colors"
          title="System Settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Link>

        {/* User Profile */}
        <div className="relative z-50" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setProfileDropdownOpen((prev) => !prev);
              }
            }}
            aria-expanded={profileDropdownOpen}
            aria-haspopup="menu"
            aria-label="User profile and security settings menu"
            title="Analyst Profile & System Menu"
            className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#1c2a3d] hover:opacity-95 transition-all focus:outline-none focus:ring-1 focus:ring-[#ff3b30]/60 rounded-xl p-1.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-[#101722] border border-slate-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {initials}
            </div>
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-slate-200">
                {user ? user.name : "Arjun Sarkar"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {user ? `${user.role} (${user.clearanceLevel})` : "INVESTIGATOR (L3)"}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 hidden lg:block transition-transform duration-200 ${
                profileDropdownOpen ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {/* Tactical Profile Dropdown Popover */}
          {profileDropdownOpen && (
            <div
              role="menu"
              aria-orientation="vertical"
              aria-label="User Account Menu"
              className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 rounded-2xl bg-[#090e18] border border-[#202d44] shadow-[0_25px_60px_rgba(0,0,0,0.95)] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl ring-1 ring-white/10 select-none"
            >
              {/* SECTION 1 — USER INFORMATION */}
              <div className="px-3.5 py-3 rounded-xl bg-[#0e1526]/80 border border-[#1b263d] flex items-center gap-3 mb-1.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-950/90 via-black to-[#101722] border border-red-500/50 flex items-center justify-center font-mono font-bold text-sm text-white shadow-md shadow-red-950/50 shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white truncate font-sans tracking-wide">
                    {user ? user.name : "Arjun Sarkar"}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    {user ? user.email : "analyst.sharma@cipher.intel"}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-red-950/60 text-red-300 border border-red-800/50">
                      <Shield className="w-2.5 h-2.5 text-[#ff3b30]" />
                      <span>{user ? `${user.role} (${user.clearanceLevel})` : "INVESTIGATOR (L3)"}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2 — ACCOUNT ACTIONS */}
              <div className="py-1 space-y-0.5" role="none">
                <Link
                  href="/settings"
                  role="menuitem"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white hover:bg-[#121c32] border border-transparent hover:border-[#1d2b45] transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#0e1628] border border-[#1b263b] flex items-center justify-center text-slate-400 group-hover:text-[#39d9ff] group-hover:border-cyan-500/40 transition-colors">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-200 group-hover:text-white">Account & Profile</span>
                      <span className="text-[10px] text-slate-500 font-sans">Analyst credentials & division</span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </Link>

                <Link
                  href="/settings"
                  role="menuitem"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white hover:bg-[#121c32] border border-transparent hover:border-[#1d2b45] transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#0e1628] border border-[#1b263b] flex items-center justify-center text-slate-400 group-hover:text-[#39d9ff] group-hover:border-cyan-500/40 transition-colors">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-200 group-hover:text-white">System Settings</span>
                      <span className="text-[10px] text-slate-500 font-sans">MFA, telemetry & audit trail</span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </Link>
              </div>

              {/* SECTION 3 — SESSION ACTION (LOG OUT) */}
              <div className="pt-1.5 mt-1 border-t border-[#182338]" role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-red-950/40 via-red-950/20 to-transparent hover:from-red-900/60 hover:to-red-950/40 border border-red-900/40 hover:border-red-600/70 text-red-400 hover:text-red-200 transition-all font-mono font-bold text-xs group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 group-hover:text-red-200 group-hover:scale-105 transition-transform">
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    <span>LOG OUT OF PLATFORM</span>
                  </div>
                  <span className="text-[10px] text-red-500/70 group-hover:text-red-300 uppercase tracking-wider font-sans">
                    End Session →
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Top Horizontal Module Navigation */}
      {!hideTopNav && <TopModuleNavigation />}
    </header>
  );
}
