"use client";

import React, { useState } from "react";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { X } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070b13] text-slate-200">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 bg-[#080d19] h-full shadow-2xl flex flex-col">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <AppSidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070b13] overflow-hidden">
        <AppHeader onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
