"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NexusHeader from "@/components/NexusHeader";
import ChatSidebar from "@/components/ai/ChatSidebar";
import ChatHeader from "@/components/ai/ChatHeader";
import ChatWelcome from "@/components/ai/ChatWelcome";
import ChatMessageItem from "@/components/ai/ChatMessageItem";
import ChatInput from "@/components/ai/ChatInput";
import FileUploadModal from "@/components/ai/FileUploadModal";
import { useInvestigation } from "@/components/InvestigationContext";
import {
  ChatConversationRecord,
  ChatMessageRecord,
  ToolCallRecord,
  EvidenceCitation,
} from "@/lib/ai/chat-service";

interface NewsAnalysisContext {
  id: string;
  headline: string;
  source: string;
  timestamp: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  relatedEntities: string[];
  relevanceScore?: number;
}

function AIAssistantInner() {
  const searchParams = useSearchParams();
  const { activeCaseId, activeCaseTitle } = useInvestigation();

  const [conversations, setConversations] = useState<ChatConversationRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [inputQuery, setInputQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newsContext, setNewsContext] = useState<NewsAnalysisContext | null>(null);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: number;
    fullText: string;
  } | null>(null);

  const [modelStatus, setModelStatus] = useState<{
    connected: boolean;
    model: string;
    version?: string;
  }>({
    connected: true,
    model: "gpt-oss:120b-cloud",
    version: "active",
  });

  // Streaming assistant message state
  const [streamingMessage, setStreamingMessage] = useState<ChatMessageRecord | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const autoAnalyzedRef = useRef<boolean>(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch model status
  useEffect(() => {
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setModelStatus({
            connected: data.connected,
            model: data.model || "gpt-oss:120b-cloud",
            version: data.version,
          });
        }
      })
      .catch(() => {
        setModelStatus((prev) => ({ ...prev, connected: false }));
      });
  }, []);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/chats");
      const data = await res.json();
      if (data.success && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
        if (data.conversations.length > 0 && !activeId) {
          setActiveId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }, [activeId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Current active conversation
  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  // Auto-scroll when messages update
  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, streamingMessage, scrollToBottom]);

  // Create new conversation
  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/ai/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Investigation Chat",
          investigationId: activeCaseId,
        }),
      });
      const data = await res.json();
      if (data.success && data.conversation) {
        setConversations((prev) => [data.conversation, ...prev]);
        setActiveId(data.conversation.id);
        setStreamingMessage(null);
        setInputQuery("");
      }
    } catch (err) {
      console.error("Failed to create new chat:", err);
    }
  };

  // Rename conversation
  const handleRename = async (id: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/ai/chats/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      const data = await res.json();
      if (data.success && data.conversation) {
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
        );
      }
    } catch (err) {
      console.error("Failed to rename conversation:", err);
    }
  };

  // Delete conversation
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/chats/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setConversations((prev) => {
          const updated = prev.filter((c) => c.id !== id);
          if (activeId === id) {
            setActiveId(updated.length > 0 ? updated[0].id : null);
          }
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  // Clear chat messages
  const handleClearChat = () => {
    if (!activeId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: [] } : c))
    );
    setStreamingMessage(null);
  };

  // Stop generation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);

    // If there was partial streaming content, commit it to conversation
    if (streamingMessage && activeId && streamingMessage.content.trim()) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeId) {
            return {
              ...c,
              messages: [...c.messages, streamingMessage],
            };
          }
          return c;
        })
      );
    }
    setStreamingMessage(null);
  };

  // Send message with streaming
  const handleSend = async (customPrompt?: string, optionalContext?: string) => {
    const textToSend = (customPrompt || inputQuery).trim();
    if (!textToSend || isGenerating) return;

    setInputQuery("");
    setIsGenerating(true);

    // Ensure we have an active conversation
    let currentConvId = activeId;
    if (!currentConvId) {
      try {
        const res = await fetch("/api/ai/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: textToSend.slice(0, 36) + (textToSend.length > 36 ? "..." : ""),
            investigationId: activeCaseId,
          }),
        });
        const data = await res.json();
        if (data.success && data.conversation) {
          setConversations((prev) => [data.conversation, ...prev]);
          setActiveId(data.conversation.id);
          currentConvId = data.conversation.id;
        }
      } catch {
        currentConvId = "chat-" + Date.now();
      }
    }

    // Append user message immediately in local state
    const userMsg: ChatMessageRecord = {
      id: "msg-" + Date.now(),
      conversationId: currentConvId!,
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentConvId) {
          return {
            ...c,
            title:
              c.messages.length === 0 && (c.title === "New Investigation Chat" || c.title === "Untitled Chat")
                ? textToSend.slice(0, 36) + (textToSend.length > 36 ? "..." : "")
                : c.title,
            messages: [...c.messages, userMsg],
          };
        }
        return c;
      })
    );

    // Initialize streaming assistant message placeholder
    const assistantMsgPlaceholder: ChatMessageRecord = {
      id: "msg-stream-" + Date.now(),
      conversationId: currentConvId!,
      role: "assistant",
      content: "",
      toolCalls: [],
      evidenceCitations: [],
      suggestedFollowUps: [],
      timestamp: new Date().toISOString(),
    };
    setStreamingMessage(assistantMsgPlaceholder);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch("/api/ai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          conversationId: currentConvId,
          investigationId: activeCaseId,
          uploadedContext: optionalContext || attachedFile?.fullText || (newsContext ? JSON.stringify(newsContext) : undefined),
        }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Streaming failed: HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      let accumulatedContent = "";
      const activeTools: ToolCallRecord[] = [];
      let citations: EvidenceCitation[] = [];
      let followUps: string[] = [];
      let detectedLang: "en" | "hi" | "hinglish" = "en";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.trim()) continue;

          const lines = part.split("\n");
          let eventType = "token";
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.replace("event: ", "").trim();
            } else if (line.startsWith("data: ")) {
              dataStr = line.replace("data: ", "").trim();
            }
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);

            if (eventType === "init" && data.conversationId) {
              setActiveId(data.conversationId);
            } else if (eventType === "tool_start") {
              activeTools.push({
                tool: data.tool,
                status: "running",
                summary: data.status,
              });
              setStreamingMessage((prev) =>
                prev ? { ...prev, toolCalls: [...activeTools] } : prev
              );
            } else if (eventType === "tool_end") {
              const t = activeTools.find((item) => item.tool === data.tool);
              if (t) {
                t.status = "completed";
                t.summary = data.summary;
              }
              setStreamingMessage((prev) =>
                prev ? { ...prev, toolCalls: [...activeTools] } : prev
              );
            } else if (eventType === "token") {
              accumulatedContent += data.token;
              setStreamingMessage((prev) =>
                prev ? { ...prev, content: accumulatedContent } : prev
              );
            } else if (eventType === "metadata") {
              if (data.detectedLanguage) detectedLang = data.detectedLanguage;
              if (data.citations) citations = data.citations;
              if (data.followUps) followUps = data.followUps;
              setStreamingMessage((prev) =>
                prev
                  ? {
                      ...prev,
                      detectedLanguage: detectedLang,
                      evidenceCitations: citations,
                      suggestedFollowUps: followUps,
                    }
                  : prev
              );
            } else if (eventType === "done") {
              const finalMessage: ChatMessageRecord = {
                id: data.messageId || "msg-" + Date.now(),
                conversationId: currentConvId!,
                role: "assistant",
                content: accumulatedContent,
                detectedLanguage: detectedLang,
                toolCalls: [...activeTools],
                evidenceCitations: [...citations],
                suggestedFollowUps: [...followUps],
                timestamp: new Date().toISOString(),
              };

              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id === currentConvId) {
                    return {
                      ...c,
                      messages: [...c.messages, finalMessage],
                    };
                  }
                  return c;
                })
              );
              setStreamingMessage(null);
            }
          } catch {
            // Ignore partial SSE parsing
          }
        }
      }

      if (accumulatedContent.trim()) {
        const finalMessage: ChatMessageRecord = {
          id: "msg-" + Date.now(),
          conversationId: currentConvId!,
          role: "assistant",
          content: accumulatedContent,
          detectedLanguage: detectedLang,
          toolCalls: activeTools,
          evidenceCitations: citations,
          suggestedFollowUps: followUps,
          timestamp: new Date().toISOString(),
        };

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === currentConvId) {
              const alreadyHas = c.messages.some((m) => m.content === accumulatedContent);
              if (!alreadyHas) {
                return { ...c, messages: [...c.messages, finalMessage] };
              }
            }
            return c;
          })
        );
        setStreamingMessage(null);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Stream execution failed:", err);
        const errMsg: ChatMessageRecord = {
          id: "msg-err-" + Date.now(),
          conversationId: currentConvId!,
          role: "assistant",
          content:
            "⚠️ **Network Error**: Unable to complete streaming response. Please verify that Ollama or CIPHER AI services are active.",
          timestamp: new Date().toISOString(),
        };
        setConversations((prev) =>
          prev.map((c) => (c.id === currentConvId ? { ...c, messages: [...c.messages, errMsg] } : c))
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
      setStreamingMessage(null);
    }
  };

  // Automatically trigger analysis if redirected from News AI
  useEffect(() => {
    if (autoAnalyzedRef.current) return;

    const analyzeNewsId = searchParams.get("analyzeNewsId");
    let item: NewsAnalysisContext | null = null;

    try {
      const raw = sessionStorage.getItem("cipher_analyze_news_item");
      if (raw) {
        item = JSON.parse(raw);
      }
    } catch (e) {
      console.error("Failed to parse stored news item:", e);
    }

    if (analyzeNewsId || item) {
      autoAnalyzedRef.current = true;
      if (item) {
        setNewsContext(item);
      }

      const targetItem: NewsAnalysisContext = item || {
        id: analyzeNewsId || "custom",
        headline: "Interdicted Maritime Consignment / Container Manifest Anomaly",
        source: "REUTERS / MARITIME INTELLIGENCE",
        timestamp: "Today, 08:30 UTC",
        severity: "CRITICAL",
        summary: "Customs authorities in Rotterdam seized high-value suspicious cargo with altered bill of lading.",
        relatedEntities: ["TARGET-01", "Aura Logistics Ltd", "Dock Warehouse #4"],
      };

      if (!item) {
        setNewsContext(targetItem);
      }

      const autoPrompt = `Analyze intelligence bulletin "${targetItem.headline}" (Source: ${targetItem.source}, Severity: ${targetItem.severity}) for active investigation ${activeCaseId} (${activeCaseTitle}). Evaluate entity linkages to ${targetItem.relatedEntities.join(", ")}, determine operational impact, cross-reference known syndicate infrastructure, and outline recommended investigative actions.`;

      const timer = setTimeout(() => {
        handleSend(autoPrompt, JSON.stringify(targetItem));
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [searchParams, activeCaseId, activeCaseTitle]);

  // Regenerate last assistant response
  const handleRegenerate = () => {
    if (!activeConversation || isGenerating) return;
    const userMsgs = activeConversation.messages.filter((m) => m.role === "user");
    if (userMsgs.length === 0) return;
    const lastUser = userMsgs[userMsgs.length - 1];

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          const msgs = [...c.messages];
          if (msgs.length > 0 && msgs[msgs.length - 1].role === "assistant") {
            msgs.pop();
          }
          return { ...c, messages: msgs };
        }
        return c;
      })
    );

    handleSend(lastUser.content);
  };

  const messagesToRender = activeConversation?.messages || [];

  return (
    <div className="h-screen flex flex-col bg-[#05070b] text-[#f5f7fa] overflow-hidden selection:bg-red-600 selection:text-white">
      {/* Global CIPHER Navigation Header */}
      <NexusHeader
        moduleTitle="CIPHER AI ASSISTANT"
        badge="OLLAMA GPT-OSS 120B CLOUD"
        activeCase={`${activeCaseId} // ${activeCaseTitle.toUpperCase()}`}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id);
            setStreamingMessage(null);
          }}
          onNewChat={handleNewChat}
          onRename={handleRename}
          onDelete={handleDelete}
          modelStatus={modelStatus}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Center Chat Viewport */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#060a14] relative">
          {/* Top Bar inside Chat Viewport */}
          <ChatHeader
            title={activeConversation?.title || "New Investigation Chat"}
            onOpenUpload={() => setUploadModalOpen(true)}
            onClearChat={handleClearChat}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            hasAttachedContext={!!attachedFile || !!newsContext}
            attachedFilename={attachedFile?.name || (newsContext ? `Intelligence: ${newsContext.id}` : undefined)}
            onRemoveAttachment={() => {
              setAttachedFile(null);
              setNewsContext(null);
            }}
            modelName={modelStatus.model}
          />

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-6 scrollbar-thin scrollbar-thumb-[#151c2a]">
            {/* Active Intelligence Bulletin Context Card */}
            {newsContext && (
              <div className="max-w-4xl mx-auto mb-4 p-4 rounded-xl bg-gradient-to-r from-[#0d1627] via-[#0f1b33] to-[#1a1224] border border-red-700/60 shadow-xl relative animate-fadeIn">
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#1b2b48]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/90 text-red-400 border border-red-700/80 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      ACTIVE INTELLIGENCE BULLETIN // {newsContext.severity}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 font-medium">
                      {newsContext.source} • {newsContext.timestamp}
                    </span>
                  </div>
                  <button
                    onClick={() => setNewsContext(null)}
                    className="text-xs text-slate-400 hover:text-white font-mono px-2 py-0.5 rounded hover:bg-[#192742] transition-colors"
                  >
                    ✕ Dismiss
                  </button>
                </div>
                <h3 className="text-sm font-bold text-white font-sans tracking-wide mb-1.5">
                  {newsContext.headline}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                  {newsContext.summary}
                </p>
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#16233a]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Linked Entities:
                  </span>
                  {newsContext.relatedEntities.map((ent, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#101b30] border border-[#1d3052] text-[11px] font-mono text-cyan-300 font-semibold"
                    >
                      {ent}
                    </span>
                  ))}
                  <span className="ml-auto text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    Cross-Referenced with {activeCaseId}
                  </span>
                </div>
              </div>
            )}

            {messagesToRender.length === 0 && !streamingMessage ? (
              <ChatWelcome onSelectPrompt={(prompt) => handleSend(prompt)} />
            ) : (
              <div className="max-w-4xl mx-auto space-y-4">
                {messagesToRender.map((msg, index) => {
                  const isLatestAssistant =
                    msg.role === "assistant" &&
                    index === messagesToRender.length - 1 &&
                    !isGenerating;

                  return (
                    <ChatMessageItem
                      key={msg.id || index}
                      message={msg}
                      isLatestAssistant={isLatestAssistant}
                      onRegenerate={handleRegenerate}
                      onSelectFollowUp={(fu) => handleSend(fu)}
                    />
                  );
                })}

                {/* Active Streaming Assistant Message */}
                {streamingMessage && (
                  <ChatMessageItem
                    message={streamingMessage}
                    isStreaming={true}
                    isLatestAssistant={false}
                  />
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Chat Input */}
          <ChatInput
            input={inputQuery}
            setInput={setInputQuery}
            onSend={() => handleSend()}
            onStop={handleStop}
            isGenerating={isGenerating}
            onOpenUpload={() => setUploadModalOpen(true)}
            attachedFile={attachedFile ? { name: attachedFile.name, size: attachedFile.size } : null}
            onRemoveAttachment={() => setAttachedFile(null)}
            onSelectPrompt={(prompt) => handleSend(prompt)}
          />
        </div>
      </div>

      {/* Document Upload Modal */}
      <FileUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onAttachContext={(context) => {
          setAttachedFile({
            name: context.filename,
            size: context.size,
            fullText: context.fullText,
          });
        }}
      />
    </div>
  );
}

export default function AIAssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-[#05070b] text-white flex items-center justify-center font-mono text-sm">
          INITIALIZING CIPHER AI ASSISTANT...
        </div>
      }
    >
      <AIAssistantInner />
    </Suspense>
  );
}
