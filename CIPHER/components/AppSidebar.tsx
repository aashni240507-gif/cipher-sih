"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderArchive,
  Network,
  Cpu,
  PlusCircle,
  UploadCloud,
  Bot,
  Bell,
  FolderLock,
  FileText,
  Settings,
  ShieldAlert,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Investigations", href: "/investigations/workspace", icon: FolderArchive },
  { label: "Network Analysis", href: "/network-analysis", icon: Network },
  { label: "Deep Modules", href: "/modules", icon: Cpu },
  { label: "New Investigation", href: "/investigations/new", icon: PlusCircle },
  { label: "Data Sources", href: "/investigations/data-sources", icon: UploadCloud },
  { label: "CIPHER AI", href: "/ai-assistant", icon: Bot, badge: "AI", badgeColor: "bg-purple-950 text-purple-400 border-purple-800/60" },
  { label: "Alerts", href: "#alerts", icon: Bell, badge: "8", badgeColor: "bg-red-950 text-red-400 border-red-800/60" },
  { label: "Evidence", href: "#evidence", icon: FolderLock },
  { label: "Reports", href: "#reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

import { useAuth } from "@/components/AuthProvider";

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, initials } = useAuth();

  return (
    <aside className="w-64 lg:w-72 flex-shrink-0 bg-[#080d19] border-r border-[#152033] flex flex-col justify-between py-4 px-3.5 z-30 select-none h-screen sticky top-0">
      <div className="flex flex-col gap-5 overflow-y-auto pr-1">
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-3 px-2 py-1 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-orange-600 via-red-600 to-rose-700 shadow-lg shadow-orange-950/40 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -inset-0.5 rounded-lg bg-red-500/20 blur-sm -z-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-widest text-white uppercase font-mono">
              CIPHER
            </span>
            <span className="text-[9px] text-red-400 font-mono tracking-wider">
              INTEL CORE v4.2
            </span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1 text-sm font-medium" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-medium group ${
                  isActive
                    ? "text-white bg-gradient-to-r from-red-950/50 via-red-900/20 to-transparent border-l-2 border-red-500 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-[#111a2e]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? "text-red-400 drop-shadow-[0_0_8px_rgba(255,77,54,0.7)]"
                      : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"}`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && !item.badge && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Badge in Sidebar Footer */}
      <div className="pt-3 border-t border-[#152033]/80">
        <Link
          href="/settings"
          className="flex items-center gap-3 p-2 rounded-xl bg-[#0d1527] hover:bg-[#131e36] border border-[#1a263d] transition-colors group cursor-pointer"
          title="Analyst Profile & System Settings"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-950/70 to-slate-900 border border-red-500/40 flex items-center justify-center font-bold text-xs text-white uppercase tracking-wider">
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0d1527]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
              {user?.name || "Amit Sharma"}
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              {user?.role || "Intelligence Analyst"}
            </span>
            <span className="text-[9px] text-emerald-400 font-medium truncate">
              ● Active {user?.clearanceLevel || "L3 Clearance"}
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
