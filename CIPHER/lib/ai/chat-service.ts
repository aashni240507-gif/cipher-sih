import fs from "fs";
import path from "path";

export interface EvidenceCitation {
  code: string;
  title: string;
  confidence?: string;
}

export interface ToolCallRecord {
  tool: string;
  status: "running" | "completed" | "error";
  summary?: string;
  data?: any;
}

export interface ChatMessageRecord {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  detectedLanguage?: "en" | "hi" | "hinglish";
  toolCalls?: ToolCallRecord[];
  evidenceCitations?: EvidenceCitation[];
  suggestedFollowUps?: string[];
  timestamp: string;
}

export interface ChatConversationRecord {
  id: string;
  userId: string;
  investigationId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessageRecord[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "chat-conversations.json");

function ensureStorage(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (err) {
    console.error("[ChatService] Failed to ensure storage file:", err);
  }
}

function readAll(): ChatConversationRecord[] {
  ensureStorage();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as ChatConversationRecord[];
  } catch (err) {
    console.error("[ChatService] Failed to read conversations:", err);
    return [];
  }
}

function writeAll(conversations: ChatConversationRecord[]): void {
  ensureStorage();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(conversations, null, 2), "utf-8");
  } catch (err) {
    console.error("[ChatService] Failed to write conversations:", err);
  }
}

/**
 * Detect language: English ("en"), Hindi Devanagari ("hi"), or Hinglish ("hinglish")
 */
export function detectLanguage(text: string): "en" | "hi" | "hinglish" {
  if (!text || text.trim().length === 0) return "en";

  // Check for Devanagari script characters
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  if (devanagariCount >= 3) {
    return "hi";
  }

  // Check for Romanized Hindi / Hinglish tokens
  const hinglishTokens = [
    "kya", "kyun", "kaise", "kab", "kahan", "kaun",
    "hai", "hain", "tha", "thi", "the", "hoga", "hogi", "honge",
    "ka", "ki", "ke", "ko", "se", "mein", "par", "ne",
    "bhi", "aur", "ya", "lekin", "magar", "kyunki",
    "karo", "karna", "karta", "karte", "karti", "kiya", "kiye",
    "yeh", "ye", "woh", "wo", "inka", "unki", "unka", "iska", "iski", "iske",
    "hum", "tum", "aap", "mera", "meri", "mere", "tera", "teri", "tere",
    "batao", "bataiye", "dikhao", "dikhaye", "bhejo", "bolo", "samjhao", "sunao",
    "wala", "wali", "wale", "chahiye", "nahi", "nhi", "mat",
    "kaunsa", "kitna", "kitne", "sabse", "bada", "chhota"
  ];

  const words = text.toLowerCase().split(/[\s,?.!;:()\[\]{}"']+/).filter(Boolean);
  let matchCount = 0;
  for (const word of words) {
    if (hinglishTokens.includes(word)) {
      matchCount++;
    }
  }

  // If at least 2 Hinglish words or >15% of words are Hinglish
  if (matchCount >= 2 || (words.length > 0 && matchCount / words.length >= 0.15)) {
    return "hinglish";
  }

  return "en";
}

export function listConversations(userId: string = "usr-analyst-01"): ChatConversationRecord[] {
  const all = readAll();
  return all
    .filter((c) => !userId || c.userId === userId || c.userId === "usr-analyst-01")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getConversation(id: string): ChatConversationRecord | null {
  const all = readAll();
  return all.find((c) => c.id === id) || null;
}

export function createConversation(params?: {
  userId?: string;
  investigationId?: string;
  title?: string;
}): ChatConversationRecord {
  const all = readAll();
  const id = "chat-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const newConv: ChatConversationRecord = {
    id,
    userId: params?.userId || "usr-analyst-01",
    investigationId: params?.investigationId || "INV-2026-0142",
    title: params?.title || "New Investigation Chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };

  all.unshift(newConv);
  writeAll(all);
  return newConv;
}

export function renameConversation(id: string, newTitle: string): ChatConversationRecord | null {
  const all = readAll();
  const conv = all.find((c) => c.id === id);
  if (!conv) return null;

  conv.title = newTitle.trim() || "Untitled Chat";
  conv.updatedAt = new Date().toISOString();
  writeAll(all);
  return conv;
}

export function deleteConversation(id: string): boolean {
  const all = readAll();
  const filtered = all.filter((c) => c.id !== id);
  if (filtered.length === all.length) return false;
  writeAll(filtered);
  return true;
}

export function addMessageToConversation(
  conversationId: string,
  msg: Omit<ChatMessageRecord, "id" | "timestamp" | "conversationId">
): ChatMessageRecord {
  const all = readAll();
  let conv = all.find((c) => c.id === conversationId);

  if (!conv) {
    // Auto-create if not found
    conv = {
      id: conversationId,
      userId: "usr-analyst-01",
      investigationId: "INV-2026-0142",
      title: msg.role === "user" ? (msg.content.slice(0, 36) + (msg.content.length > 36 ? "..." : "")) : "Investigation Chat",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    all.unshift(conv);
  }

  const messageId = "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const fullMsg: ChatMessageRecord = {
    id: messageId,
    conversationId,
    role: msg.role,
    content: msg.content,
    detectedLanguage: msg.detectedLanguage || detectLanguage(msg.content),
    toolCalls: msg.toolCalls || [],
    evidenceCitations: msg.evidenceCitations || [],
    suggestedFollowUps: msg.suggestedFollowUps || [],
    timestamp: now,
  };

  conv.messages.push(fullMsg);
  conv.updatedAt = now;

  // Auto-update title if it's the first user message and default title
  if (conv.messages.filter((m) => m.role === "user").length === 1 && msg.role === "user") {
    if (conv.title === "New Investigation Chat" || conv.title === "Untitled Chat") {
      const cleanTitle = msg.content.trim().slice(0, 35);
      conv.title = cleanTitle ? cleanTitle + (msg.content.length > 35 ? "..." : "") : conv.title;
    }
  }

  writeAll(all);
  return fullMsg;
}

export function updateMessageInConversation(
  conversationId: string,
  messageId: string,
  updates: Partial<ChatMessageRecord>
): ChatMessageRecord | null {
  const all = readAll();
  const conv = all.find((c) => c.id === conversationId);
  if (!conv) return null;

  const msg = conv.messages.find((m) => m.id === messageId);
  if (!msg) return null;

  Object.assign(msg, updates);
  conv.updatedAt = new Date().toISOString();
  writeAll(all);
  return msg;
}

export function getConversationHistoryForPrompt(
  conversationId: string,
  maxTurns: number = 10
): ChatMessageRecord[] {
  const conv = getConversation(conversationId);
  if (!conv) return [];
  const msgs = conv.messages || [];
  return msgs.slice(-maxTurns * 2);
}
