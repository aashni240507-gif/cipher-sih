"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  MessageSquare,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X,
  Server,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";
import { ChatConversationRecord } from "@/lib/ai/chat-service";

interface ChatSidebarProps {
  conversations: ChatConversationRecord[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  modelStatus: {
    connected: boolean;
    model: string;
    version?: string;
  };
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
  modelStatus,
  isOpen,
  onToggle,
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Group conversations by relative date
  const groupedConversations = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const past7Days = today - 86400000 * 7;

    const filtered = conversations.filter((c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groups: {
      today: ChatConversationRecord[];
      yesterday: ChatConversationRecord[];
      pastWeek: ChatConversationRecord[];
      older: ChatConversationRecord[];
    } = {
      today: [],
      yesterday: [],
      pastWeek: [],
      older: [],
    };

    filtered.forEach((conv) => {
      const time = new Date(conv.updatedAt || conv.createdAt).getTime();
      if (time >= today) {
        groups.today.push(conv);
      } else if (time >= yesterday) {
        groups.yesterday.push(conv);
      } else if (time >= past7Days) {
        groups.pastWeek.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [conversations, searchTerm]);

  const handleStartRename = (conv: ChatConversationRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editingTitle.trim()) {
      onRename(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
    setMenuOpenId(null);
  };

  const handleConfirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
    setConfirmDeleteId(null);
  };

  if (!isOpen) {
    return (
      <div className="hidden md:flex flex-col items-center py-4 px-2 bg-[#05080f] border-r border-[#151c2a] w-14 transition-all duration-300">
        <button
          onClick={onToggle}
          title="Expand Sidebar"
          className="p-2 rounded-lg bg-[#0d1424] hover:bg-[#162035] text-gray-400 hover:text-white border border-[#1f2c42] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={onNewChat}
          title="New Investigation Chat"
          className="mt-4 p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-800/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="mt-auto flex flex-col items-center gap-2">
          <div
            title={`Ollama: ${modelStatus.connected ? "Active" : "Offline"}`}
            className={`w-3 h-3 rounded-full ${
              modelStatus.connected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-amber-500"
            }`}
          />
        </div>
      </div>
    );
  }

  const renderConvItem = (conv: ChatConversationRecord) => {
    const isActive = activeId === conv.id;
    const isEditing = editingId === conv.id;

    if (isEditing) {
      return (
        <div
          key={conv.id}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#0d1627] border border-red-500/40"
        >
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveRename(conv.id, e);
              if (e.key === "Escape") setEditingId(null);
            }}
            autoFocus
            className="flex-1 bg-transparent text-xs text-gray-100 font-mono focus:outline-none px-1"
          />
          <button
            onClick={(e) => handleSaveRename(conv.id, e)}
            className="p-1 hover:text-emerald-400 text-gray-400"
            title="Save"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCancelRename}
            className="p-1 hover:text-red-400 text-gray-400"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div
        key={conv.id}
        onClick={() => onSelect(conv.id)}
        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
          isActive
            ? "bg-red-950/30 border border-red-800/60 text-white shadow-[0_0_12px_rgba(239,68,68,0.15)]"
            : "hover:bg-[#0d1524] text-gray-300 hover:text-gray-100 border border-transparent"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MessageSquare
            className={`w-3.5 h-3.5 shrink-0 ${
              isActive ? "text-red-400" : "text-gray-500 group-hover:text-gray-400"
            }`}
          />
          <span className="text-xs font-mono truncate">{conv.title}</span>
        </div>

        <div className="relative shrink-0 flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
            }}
            className={`p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#162137] text-gray-400 hover:text-white transition-opacity ${
              menuOpenId === conv.id ? "!opacity-100 bg-[#162137]" : ""
            }`}
            title="Conversation Options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {menuOpenId === conv.id && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 w-36 bg-[#090e18] border border-[#1e2a40] rounded-lg shadow-xl py-1 z-30 font-mono text-[11px]"
            >
              <button
                onClick={(e) => handleStartRename(conv, e)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-300 hover:bg-[#131d30] hover:text-white"
              >
                <Edit2 className="w-3 h-3 text-cyan-400" />
                Rename
              </button>
              <button
                onClick={(e) => handleDeleteClick(conv.id, e)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-red-400 hover:bg-red-950/40 hover:text-red-300"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-72 md:w-80 shrink-0 bg-[#05080f] border-r border-[#151c2a] flex flex-col h-full select-none z-20">
      {/* Top Header & New Chat button */}
      <div className="p-3 border-b border-[#151c2a] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span className="text-xs font-mono font-bold tracking-wider text-gray-200 uppercase">
              Conversations
            </span>
          </div>
          <button
            onClick={onToggle}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#0f1728] transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-red-950/60 via-red-900/40 to-[#0c1220] border border-red-600/50 hover:border-red-500 text-red-300 hover:text-white text-xs font-mono font-medium shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Investigation Chat</span>
        </button>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search investigations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#080d1a] border border-[#172033] rounded-md pl-8 pr-2.5 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500/50 font-mono"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
        {groupedConversations.today.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-mono tracking-wider text-gray-500 uppercase">
              Today
            </div>
            {groupedConversations.today.map(renderConvItem)}
          </div>
        )}

        {groupedConversations.yesterday.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-mono tracking-wider text-gray-500 uppercase">
              Yesterday
            </div>
            {groupedConversations.yesterday.map(renderConvItem)}
          </div>
        )}

        {groupedConversations.pastWeek.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-mono tracking-wider text-gray-500 uppercase">
              Previous 7 Days
            </div>
            {groupedConversations.pastWeek.map(renderConvItem)}
          </div>
        )}

        {groupedConversations.older.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-mono tracking-wider text-gray-500 uppercase">
              Older
            </div>
            {groupedConversations.older.map(renderConvItem)}
          </div>
        )}

        {conversations.length === 0 && (
          <div className="text-center py-8 px-4 text-xs font-mono text-gray-500">
            No previous conversations. Start a new investigation chat above.
          </div>
        )}
      </div>

      {/* Confirmation modal for delete */}
      {confirmDeleteId && (
        <div className="p-3 bg-red-950/30 border-t border-red-900/50">
          <p className="text-[11px] font-mono text-red-300 mb-2">
            Delete this conversation permanently?
          </p>
          <div className="flex gap-2">
            <button
              onClick={(e) => handleConfirmDelete(confirmDeleteId, e)}
              className="flex-1 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[11px] font-mono"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="flex-1 py-1 bg-[#10192a] hover:bg-[#18263f] text-gray-300 rounded text-[11px] font-mono"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Footer Status Pill */}
      <div className="p-3 border-t border-[#151c2a] bg-[#04060c] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[130px]" title={modelStatus.model}>
              {modelStatus.model}
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              modelStatus.connected
                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                : "bg-amber-950/60 text-amber-400 border border-amber-800/60"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                modelStatus.connected
                  ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse"
                  : "bg-amber-400"
              }`}
            />
            {modelStatus.connected ? "Active" : "Offline"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
          <Shield className="w-3 h-3 text-red-500" />
          <span>Active Context: Operation Nexus</span>
        </div>
      </div>
    </aside>
  );
}
