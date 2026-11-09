"use client";

import React, { useState } from "react";
import {
  Brain,
  Shield,
  FileText,
  RotateCcw,
  Languages,
  Menu,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

interface ChatHeaderProps {
  title: string;
  onOpenUpload: () => void;
  onClearChat: () => void;
  onToggleSidebar: () => void;
  hasAttachedContext: boolean;
  attachedFilename?: string;
  onRemoveAttachment: () => void;
  modelName?: string;
}

export default function ChatHeader({
  title,
  onOpenUpload,
  onClearChat,
  onToggleSidebar,
  hasAttachedContext,
  attachedFilename,
  onRemoveAttachment,
  modelName = "gpt-oss:120b-cloud",
}: ChatHeaderProps) {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  return (
    <div className="h-14 shrink-0 bg-[#060a14] border-b border-[#151c2a] px-4 flex items-center justify-between z-10">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 rounded-lg bg-[#0d1525] border border-[#1a2538] text-gray-300 hover:text-white"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-900/60 to-cyan-950/40 border border-red-700/50 flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4 text-red-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-mono font-bold text-gray-100 truncate max-w-[240px] sm:max-w-md">
              {title || "CIPHER AI Assistant"}
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
              <span className="text-cyan-400 font-semibold">{modelName}</span>
              <span className="text-gray-600">•</span>
              <span className="text-red-400">Operation Nexus (INV-2026-0142)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Document Context pill */}
        {hasAttachedContext ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-700/50 text-cyan-300 text-[11px] font-mono">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[120px]">{attachedFilename || "Attached Document"}</span>
            <button
              onClick={onRemoveAttachment}
              className="ml-1 text-gray-400 hover:text-red-400 text-xs"
              title="Remove context"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenUpload}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b1220] hover:bg-[#121c32] border border-[#1b263b] text-gray-300 hover:text-cyan-300 text-[11px] font-mono transition-colors"
            title="Attach case document or data file for AI context"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Document</span>
          </button>
        )}

        {/* Trilingual Indicator Tag */}
        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded bg-[#090f1d] border border-[#182338] text-[10px] font-mono text-gray-400">
          <Languages className="w-3 h-3 text-red-400" />
          <span>EN / हिंदी / Hinglish</span>
        </div>

        {/* Clear Chat Button */}
        <button
          onClick={onClearChat}
          className="p-1.5 sm:px-2 sm:py-1 rounded bg-[#0b1220] hover:bg-red-950/40 border border-[#1b263b] hover:border-red-900/50 text-gray-400 hover:text-red-300 text-[11px] font-mono transition-colors"
          title="Reset current conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
