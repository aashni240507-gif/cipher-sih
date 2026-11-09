"use client";

import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachContext: (context: {
    filename: string;
    size: number;
    fullText: string;
  }) => void;
}

export default function FileUploadModal({
  isOpen,
  onClose,
  onAttachContext,
}: FileUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<{
    filename: string;
    size: number;
    excerpt: string;
    fullText: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ai/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "File parsing failed");
      }

      setParsedData({
        filename: data.filename,
        size: data.size,
        excerpt: data.excerpt,
        fullText: data.fullText,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to upload and parse document");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleConfirmAttach = () => {
    if (parsedData) {
      onAttachContext({
        filename: parsedData.filename,
        size: parsedData.size,
        fullText: parsedData.fullText,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#070b14] border border-[#1b263b] rounded-2xl shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#151f33] bg-[#0a1020]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-gray-100 tracking-wider uppercase">
              Attach Document for AI Context
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#121b30] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-400 font-sans">
            Upload case files, telecom logs, SWIFT bank manifests, or police reports (PDF, TXT, CSV, JSON).
            Extracted text will be injected into CIPHER AI prompt context.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.csv,.json,.md,.log"
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-cyan-400 bg-cyan-950/20"
                : "border-[#1b263b] hover:border-red-600/50 bg-[#080d1a]"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center justify-center py-4">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                <span className="text-xs text-cyan-300">
                  Parsing and extracting document text...
                </span>
              </div>
            ) : parsedData ? (
              <div className="flex flex-col items-center justify-center py-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <span className="text-xs font-bold text-gray-100">
                  {parsedData.filename}
                </span>
                <span className="text-[11px] text-gray-400">
                  {Math.round(parsedData.size / 1024)} KB extracted
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <UploadCloud className="w-10 h-10 text-gray-500 mb-2" />
                <span className="text-xs text-gray-200 font-bold">
                  Click to browse or drop file here
                </span>
                <span className="text-[10px] text-gray-500 mt-1">
                  Supported formats: PDF, TXT, CSV, JSON, MD, LOG
                </span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Excerpt Preview */}
          {parsedData && (
            <div className="p-3 rounded-lg bg-[#0a1020] border border-[#162035] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Extracted Preview:</span>
                <span className="text-cyan-400">{parsedData.fullText.length} chars</span>
              </div>
              <p className="text-[11px] text-gray-300 font-mono bg-[#05080f] p-2 rounded border border-[#101827] max-h-28 overflow-y-auto">
                {parsedData.excerpt}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-[#151f33] bg-[#0a1020]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#111a2d] hover:bg-[#182640] text-gray-300 text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAttach}
            disabled={!parsedData}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              parsedData
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                : "bg-[#141e30] text-gray-600 cursor-not-allowed border border-[#1b263b]"
            }`}
          >
            Attach to Context
          </button>
        </div>
      </div>
    </div>
  );
}
