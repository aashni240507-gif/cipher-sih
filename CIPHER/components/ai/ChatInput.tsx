"use client";

import React, { useRef, useEffect } from "react";
import {
  Send,
  Square,
  Paperclip,
  Sparkles,
  X,
  FileText,
  Mic,
} from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  onStop: () => void;
  isGenerating: boolean;
  onOpenUpload: () => void;
  attachedFile?: { name: string; size: number } | null;
  onRemoveAttachment: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export default function ChatInput({
  input,
  setInput,
  onSend,
  onStop,
  isGenerating,
  onOpenUpload,
  attachedFile,
  onRemoveAttachment,
  onSelectPrompt,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && input.trim()) {
        onSend();
      }
    }
  };

  const quickPills = [
    "TARGET-01 connections",
    "Show CDR evidence",
    "Trace crypto mixer flows",
    "Is case ka summary do",
  ];

  return (
    <div className="shrink-0 bg-[#05080f] border-t border-[#151c2a] p-3 sm:p-4 max-w-4xl mx-auto w-full">
      {/* Quick Pills above input */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none">
        <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-red-500" />
          <span>Quick Leads:</span>
        </span>
        {quickPills.map((pill, i) => (
          <button
            key={i}
            onClick={() => onSelectPrompt(pill)}
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#090f1d] hover:bg-[#121c32] border border-[#18243c] hover:border-red-600/50 text-gray-400 hover:text-gray-200 shrink-0 transition-colors"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Attached file chip */}
      {attachedFile && (
        <div className="mb-2 flex items-center gap-2 p-1.5 px-3 rounded-lg bg-cyan-950/40 border border-cyan-700/50 text-cyan-300 text-xs font-mono max-w-md">
          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate flex-1">{attachedFile.name}</span>
          <span className="text-[10px] text-gray-400">
            ({Math.round(attachedFile.size / 1024)} KB)
          </span>
          <button
            onClick={onRemoveAttachment}
            className="p-0.5 hover:text-red-400 text-gray-400 rounded transition-colors"
            title="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Input Box */}
      <div className="relative flex flex-col rounded-2xl bg-[#090e1a] border border-[#1a2538] focus-within:border-red-600/60 focus-within:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything or interrogate case evidence (supports English, हिंदी, Hinglish)..."
          rows={1}
          className="w-full bg-transparent p-3 sm:p-3.5 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none resize-none font-sans max-h-40"
        />

        {/* Action bar inside input box */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-[#121929] bg-[#070b14]/60 rounded-b-2xl">
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenUpload}
              className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-[#101828] transition-colors"
              title="Attach document (PDF, CSV, TXT, JSON) for context"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isGenerating ? (
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-600 text-red-300 text-xs font-mono font-semibold animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Generating</span>
              </button>
            ) : (
              <button
                onClick={onSend}
                disabled={!input.trim()}
                className={`flex items-center justify-center p-2 rounded-xl transition-all ${
                  input.trim()
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer"
                    : "bg-[#131b2c] text-gray-600 cursor-not-allowed border border-[#1b253b]"
                }`}
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subtext disclaimer */}
      <div className="mt-2 text-center text-[10px] font-mono text-gray-500">
        CIPHER AI operates on grounded case data and Ollama GPT-OSS 120B Cloud. All analytical leads require human analyst verification.
      </div>
    </div>
  );
}
