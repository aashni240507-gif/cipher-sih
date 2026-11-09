"use client";

import React from "react";

interface StatusBadgeProps {
  label: string;
  variant?: "priority-high" | "priority-medium" | "priority-low" | "active" | "cyan" | "verified" | "neutral";
  size?: "sm" | "md";
}

export default function StatusBadge({
  label,
  variant = "neutral",
  size = "sm",
}: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  const getVariantClasses = () => {
    switch (variant) {
      case "priority-high":
        return "bg-red-950/70 text-red-400 border-red-700/60";
      case "priority-medium":
        return "bg-amber-950/70 text-amber-400 border-amber-700/60";
      case "priority-low":
        return "bg-sky-950/70 text-sky-400 border-sky-700/60";
      case "active":
        return "bg-emerald-950/60 text-emerald-400 border-emerald-700/60";
      case "cyan":
        return "bg-cyan-950/60 text-cyan-400 border-cyan-700/60";
      case "verified":
        return "bg-[#0d2a2a] text-[#29d694] border-[#144f3d]";
      default:
        return "bg-[#151e2b] text-slate-300 border-[#1e2a3b]";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded-full border shadow-sm ${sizeClasses} ${getVariantClasses()}`}
    >
      {variant === "active" && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      )}
      {variant === "priority-high" && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
      )}
      {label}
    </span>
  );
}
