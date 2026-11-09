"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import {
  Brain,
  User,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Terminal,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Search,
  Share2,
  FileText,
} from "lucide-react";
import { ChatMessageRecord, ToolCallRecord, EvidenceCitation } from "@/lib/ai/chat-service";

interface ChatMessageItemProps {
  message: ChatMessageRecord;
  isStreaming?: boolean;
  isLatestAssistant?: boolean;
  onRegenerate?: () => void;
  onSelectFollowUp?: (prompt: string) => void;
}

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-[#1e2a3f] bg-[#070b14] font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0e1526] border-b border-[#1a2538] text-[11px] text-gray-400">
        <span className="text-cyan-400 uppercase font-semibold">{language || "text"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-gray-200 scrollbar-thin scrollbar-thumb-gray-800">
        <code>{value}</code>
      </pre>
    </div>
  );
}

export default function ChatMessageItem({
  message,
  isStreaming = false,
  isLatestAssistant = false,
  onRegenerate,
  onSelectFollowUp,
}: ChatMessageItemProps) {
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [toolsExpanded, setToolsExpanded] = useState(true);

  const isUser = message.role === "user";

  const handleCopyFull = () => {
    navigator.clipboard.writeText(message.content);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const getLanguageLabel = (lang?: "en" | "hi" | "hinglish") => {
    if (lang === "hi") return "Detected: Hindi (हिंदी)";
    if (lang === "hinglish") return "Detected: Hinglish";
    return "Detected: English";
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 px-2 sm:px-4">
        <div className="max-w-2xl bg-gradient-to-r from-[#121a2d] to-[#1c1422] border border-red-900/40 rounded-2xl rounded-tr-sm p-4 shadow-lg">
          <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-[#281b2e]">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[11px] font-mono font-bold text-red-400 tracking-wider">
                LEAD ANALYST (L3)
              </span>
            </div>
            {message.detectedLanguage && message.detectedLanguage !== "en" && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                {message.detectedLanguage === "hi" ? "हिंदी" : "Hinglish"}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-100 font-sans whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex justify-start mb-6 px-2 sm:px-4">
      <div className="w-full max-w-4xl bg-[#060a14] border border-[#151f33] rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-xl">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[#151f33]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-red-900 to-cyan-950 border border-red-600/50 flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.3)]">
              <Brain className="w-3.5 h-3.5 text-red-300" />
            </div>
            <span className="text-xs font-mono font-bold text-gray-200 tracking-wide">
              CIPHER AI
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/50 text-cyan-400 border border-cyan-800/50">
              gpt-oss:120b-cloud
            </span>
          </div>

          <div className="flex items-center gap-2">
            {message.detectedLanguage && (
              <span className="text-[10px] font-mono text-gray-400 px-2 py-0.5 rounded bg-[#0b1220] border border-[#19243a]">
                {getLanguageLabel(message.detectedLanguage)}
              </span>
            )}
          </div>
        </div>

        {/* Tool Execution Chips / Status Accordion */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-4 rounded-lg bg-[#080d19] border border-[#172338] overflow-hidden">
            <button
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-mono text-gray-400 hover:text-gray-200 bg-[#0c1426] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>Forensic Tool Executions ({message.toolCalls.length})</span>
              </div>
              {toolsExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>

            {toolsExpanded && (
              <div className="p-2 space-y-1.5 font-mono text-[11px]">
                {message.toolCalls.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-1.5 rounded bg-[#070b14] border border-[#131d30]"
                  >
                    <span className="text-cyan-400 font-semibold shrink-0">
                      [{t.tool}]
                    </span>
                    <span className="text-gray-300">{t.summary || t.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Markdown Content */}
        <div className="prose prose-invert max-w-none text-xs sm:text-sm font-sans leading-relaxed text-gray-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-lg font-mono font-bold text-gray-100 mt-4 mb-2 tracking-wide border-b border-[#1b263b] pb-1">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-mono font-bold text-red-400 mt-3 mb-2 tracking-wide">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-mono font-semibold text-cyan-400 mt-3 mb-1.5">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-xs font-mono font-semibold text-gray-200 mt-2 mb-1 uppercase tracking-wider">
                  {children}
                </h4>
              ),
              p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 my-2 text-gray-300">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 my-2 text-gray-300">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="leading-normal">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="my-3 pl-3 py-2 border-l-2 border-red-500 bg-red-950/20 rounded-r text-gray-300 text-xs italic font-mono">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="my-3 overflow-x-auto rounded-lg border border-[#1b263b] bg-[#070b14]">
                  <table className="min-w-full text-xs font-mono divide-y divide-[#1b263b]">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-[#0e1628] text-gray-200">{children}</thead>,
              th: ({ children }) => (
                <th className="px-3 py-2 text-left text-[11px] font-bold text-cyan-300 tracking-wider">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 text-[11px] text-gray-300 border-t border-[#131c2d] whitespace-normal">
                  {children}
                </td>
              ),
              code({ inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                if (!inline && match) {
                  return (
                    <CodeBlock
                      language={match[1]}
                      value={String(children).replace(/\n$/, "")}
                    />
                  );
                }
                return (
                  <code
                    className="px-1.5 py-0.5 rounded bg-[#0e1628] text-red-300 font-mono text-[11px] border border-[#19243c]"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>

          {/* Streaming Cursor */}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-red-500 animate-pulse" />
          )}
        </div>

        {/* Evidence Citations Section */}
        {message.evidenceCitations && message.evidenceCitations.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#151f33]">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Evidentiary Citations:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.evidenceCitations.map((ev, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b1220] border border-[#1e2c44] text-[11px] font-mono text-gray-300 hover:border-cyan-500/50 transition-colors"
                >
                  <span className="text-red-400 font-bold">[{ev.code}]</span>
                  <span className="text-gray-300 truncate max-w-xs">{ev.title}</span>
                  {ev.confidence && (
                    <span className="text-emerald-400 text-[10px]">({ev.confidence})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="mt-4 pt-2.5 flex items-center justify-between text-xs font-mono text-gray-400 border-t border-[#121929]">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyFull}
              className="flex items-center gap-1 hover:text-white transition-colors"
              title="Copy answer"
            >
              {copiedResponse ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>

            {isLatestAssistant && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                title="Regenerate response"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="text-[11px]">Regenerate</span>
              </button>
            )}

            <Link
              href="/network-analysis"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0e1726] border border-[#1b2a44] hover:border-cyan-500/60 text-cyan-300 hover:text-white transition-all text-[11px]"
              title="Open in Network Analysis"
            >
              <Share2 className="w-3 h-3 text-cyan-400" />
              <span>Open in Network Analysis</span>
            </Link>

            <Link
              href="/modules#evidence"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0e1726] border border-[#1b2a44] hover:border-red-500/60 text-red-300 hover:text-white transition-all text-[11px]"
              title="View Evidence"
            >
              <FileText className="w-3 h-3 text-red-400" />
              <span>View Evidence</span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setFeedback(feedback === "up" ? null : "up")}
              className={`p-1 rounded hover:bg-[#101828] transition-colors ${
                feedback === "up" ? "text-emerald-400" : "text-gray-500 hover:text-gray-300"
              }`}
              title="Helpful"
            >
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => setFeedback(feedback === "down" ? null : "down")}
              className={`p-1 rounded hover:bg-[#101828] transition-colors ${
                feedback === "down" ? "text-red-400" : "text-gray-500 hover:text-gray-300"
              }`}
              title="Not helpful"
            >
              <ThumbsDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Suggested Follow-ups */}
        {message.suggestedFollowUps &&
          message.suggestedFollowUps.length > 0 &&
          onSelectFollowUp && (
            <div className="mt-3 pt-2 space-y-1.5">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-red-400" />
                <span>Suggested Follow-up Leads:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {message.suggestedFollowUps.map((fu, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectFollowUp(fu)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0d1424] hover:bg-[#152038] border border-[#1b2842] hover:border-red-600/50 text-gray-300 hover:text-white text-xs font-mono transition-all"
                  >
                    <span>{fu}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-gray-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
