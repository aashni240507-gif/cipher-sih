"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  Bell,
  ChevronDown,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface AppHeaderProps {
  onToggleMobileSidebar?: () => void;
}

export default function AppHeader({ onToggleMobileSidebar }: AppHeaderProps) {
  const { user, initials } = useAuth();
  const [operationOpen, setOperationOpen] = useState(false);
  const [currentOperation, setCurrentOperation] = useState("Operation Nexus");

  const operations = [
    { name: "Operation Nexus", id: "INV-2026-0142", status: "Active High" },
    { name: "Taskforce Blue Aurora", id: "INV-2026-0098", status: "Surveillance" },
    { name: "Syndicate GhostNet", id: "INV-2026-0045", status: "Resolved" },
  ];

  return (
    <header className="h-16 border-b border-[#141e30] bg-[#090f1e]/80 backdrop-blur px-4 sm:px-6 flex items-center justify-between z-20 sticky top-0">
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121c33]"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Search Bar */}
        <div className="relative w-64 sm:w-80 lg:w-96">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search people, phones, vehicles, cases..."
            className="w-full bg-[#0d1526] text-xs text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2 rounded-lg border border-[#1c2942] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right Utility Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Ask CIPHER AI Action */}
        <Link
          href="/ai-assistant"
          className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-900/40 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
          <span className="hidden sm:inline">Ask CIPHER AI</span>
          <span className="sm:hidden">AI</span>
        </Link>

        {/* Notification Bell */}
        <button
          className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#121c33] transition-colors"
          title="Notifications & Intel Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
        </button>

        {/* Operation Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOperationOpen(!operationOpen)}
            className="flex items-center gap-2 bg-[#0c1424] border border-[#1a2840] px-3 py-1.5 rounded-lg text-xs hover:border-slate-600 transition-colors"
          >
            <Shield className="w-3 h-3 text-red-400" />
            <span className="text-slate-200 font-medium hidden md:inline truncate max-w-[130px]">
              {currentOperation}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {operationOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0b1220] border border-[#1a2840] shadow-2xl py-2 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-500 border-b border-[#141e30]">
                Active Dossiers
              </div>
              {operations.map((op) => (
                <button
                  key={op.id}
                  onClick={() => {
                    setCurrentOperation(op.name);
                    setOperationOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-[#121c33] flex flex-col gap-0.5 transition-colors ${
                    currentOperation === op.name ? "bg-[#142036] text-white" : "text-slate-300"
                  }`}
                >
                  <span className="font-semibold">{op.name}</span>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{op.id}</span>
                    <span className="text-red-400">{op.status}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Quick Avatar */}
        <Link
          href="/settings"
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-amber-600 border border-slate-600 flex items-center justify-center text-xs font-bold text-white shadow-inner hover:scale-105 transition-transform"
          title={`Signed in as ${user?.name || "Analyst"}`}
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
