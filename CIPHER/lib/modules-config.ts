import React from "react";
import {
  FolderArchive,
  PlusCircle,
  Network,
  Users,
  UploadCloud,
  FolderLock,
  Bell,
  Cpu,
  Globe2,
  FileText,
  Brain,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface CipherModule {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
  description?: string;
  matchPaths?: string[];
  requiredRole?: string[];
}

export const CIPHER_MODULES: CipherModule[] = [
  {
    id: "investigations",
    label: "INVESTIGATIONS",
    href: "/investigations",
    icon: FolderArchive,
    matchPaths: ["/investigations", "/investigations/workspace"],
    description: "Active criminal investigation dossiers, case summaries, and records repository.",
  },
  {
    id: "new-investigation",
    label: "NEW INVESTIGATION",
    href: "/investigations/new",
    icon: PlusCircle,
    badge: "+",
    badgeColor: "bg-red-950/80 text-red-400 border-red-800/60",
    matchPaths: ["/investigations/new"],
    description: "Launch a new criminal or counter-intelligence case wizard.",
  },
  {
    id: "network-analysis",
    label: "NETWORK ANALYSIS",
    href: "/network-analysis",
    icon: Network,
    matchPaths: ["/network-analysis"],
    description: "Interactive relationship graph, Louvain modularity, and centrality analysis.",
  },
  {
    id: "entities",
    label: "ENTITIES",
    href: "/entities",
    icon: Users,
    matchPaths: ["/entities"],
    description: "Comprehensive profiles on suspects, phones, vehicles, shell firms, and crypto wallets.",
  },
  {
    id: "data-sources",
    label: "DATA SOURCES",
    href: "/data-sources",
    icon: UploadCloud,
    matchPaths: ["/data-sources", "/investigations/data-sources"],
    description: "Ingest and parse CDR telecom logs, SWIFT wires, and FIR police reports.",
  },
  {
    id: "evidence",
    label: "EVIDENCE",
    href: "/evidence",
    icon: FolderLock,
    matchPaths: ["/evidence"],
    description: "Cryptographically hashed digital evidence vault with chain of custody verification.",
  },
  {
    id: "alerts",
    label: "ALERTS",
    href: "/alerts",
    icon: Bell,
    badge: "8",
    badgeColor: "bg-red-950/80 text-[#ff3b30] border-red-800/60",
    matchPaths: ["/alerts"],
    description: "Real-time threat triggers, anomalous bridge entities, and perimeter blackouts.",
  },
  {
    id: "deep-modules",
    label: "DEEP MODULES",
    href: "/modules",
    icon: Cpu,
    matchPaths: ["/modules"],
    description: "Unified intelligence suite covering geospatial, timeline, and forensic visualizers.",
  },
  {
    id: "news-ai",
    label: "NEWS AI",
    href: "/news-ai",
    icon: Globe2,
    badge: "LIVE",
    badgeColor: "bg-cyan-950/80 text-[#39d9ff] border-cyan-800/60",
    matchPaths: ["/news-ai"],
    description: "Live OSINT open-source threat intelligence wire and news bulletin correlation.",
  },
  {
    id: "reports",
    label: "REPORTS",
    href: "/reports",
    icon: FileText,
    matchPaths: ["/reports"],
    description: "Generate and export court-admissible judicial dossiers and executive briefings.",
  },
  {
    id: "ai-assistant",
    label: "AI ASSISTANT",
    href: "/ai-assistant",
    icon: Brain,
    badge: "AI",
    badgeColor: "bg-purple-950/80 text-purple-400 border-purple-800/60",
    matchPaths: ["/ai-assistant"],
    description: "Conversational intelligence copilot powered by Ollama GPT-OSS 120B Cloud.",
  },
  {
    id: "settings",
    label: "SETTINGS",
    href: "/settings",
    icon: Settings,
    matchPaths: ["/settings"],
    description: "Analyst credentials, cryptographic audit logs, and system configuration.",
  },
];

/**
 * Check if a module is currently active based on current pathname.
 */
export function isModuleActive(pathname: string, module: CipherModule): boolean {
  if (module.id === "new-investigation") {
    return pathname === "/investigations/new";
  }

  if (module.id === "data-sources") {
    return pathname === "/data-sources" || pathname.startsWith("/investigations/data-sources");
  }

  if (module.id === "investigations") {
    return (
      pathname === "/investigations" ||
      pathname === "/investigations/workspace" ||
      (pathname.startsWith("/investigations") &&
        !pathname.startsWith("/investigations/new") &&
        !pathname.startsWith("/investigations/data-sources"))
    );
  }

  if (module.matchPaths && module.matchPaths.length > 0) {
    return module.matchPaths.some(
      (p) => pathname === p || (p !== "/" && pathname.startsWith(p))
    );
  }

  return pathname === module.href || (module.href !== "/" && pathname.startsWith(module.href));
}
