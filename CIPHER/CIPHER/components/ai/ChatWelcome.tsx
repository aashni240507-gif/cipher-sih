"use client";

import React from "react";
import {
  Brain,
  Shield,
  Search,
  Code2,
  Languages,
  Activity,
  FileCheck2,
  ArrowRight,
  Database,
  Lock,
} from "lucide-react";

interface ChatWelcomeProps {
  onSelectPrompt: (prompt: string) => void;
}

export default function ChatWelcome({ onSelectPrompt }: ChatWelcomeProps) {
  const investigativePrompts = [
    {
      title: "TARGET-01 Dossier & Centrality",
      description: "Analyze primary coordinator TARGET-01 (Viktor R.), bridge connections, and betweenness scores.",
      prompt: "Why is TARGET-01 (Viktor R.) important to Operation Nexus and what are his direct connections?",
      icon: Shield,
      tag: "Dossier",
    },
    {
      title: "Telecom Intercepts (CDR)",
      description: "Review 27 encrypted satellite and VoIP communications preceding container unsealing.",
      prompt: "Analyze the telecommunication logs in evidence CDR_019_2834 and suspicious calls with Target-02.",
      icon: Activity,
      tag: "CDR Logs",
    },
    {
      title: "Crypto Liquidity & SWIFT Wires",
      description: "Trace $320k SWIFT wire and 185k USDT transfer to sanctioned TRC-20 mixing pools.",
      prompt: "Show all suspicious financial transactions and crypto movements linked to Aura Logistics.",
      icon: Database,
      tag: "Financials",
    },
    {
      title: "Network Shortest Path",
      description: "Calculate the relational traversal path connecting TARGET-01 to Dock Warehouse #4.",
      prompt: "What is the shortest path and relational link connecting TARGET-01 to Dock Warehouse #4?",
      icon: Search,
      tag: "Topology",
    },
  ];

  const generalPrompts = [
    {
      title: "Code & Graph Algorithms",
      description: "Write a production-ready Python implementation for Dijkstra's shortest path algorithm.",
      prompt: "Write a complete Python script with type annotations for Dijkstra's shortest path algorithm.",
      icon: Code2,
      tag: "Python",
    },
    {
      title: "Hinglish Case Inquiry",
      description: "Natural conversational Hinglish interrogation of entities and front shell enterprises.",
      prompt: "Is investigation me Aura Logistics ka kya role hai aur kisse judda hua hai?",
      icon: Languages,
      tag: "Hinglish",
    },
    {
      title: "हिंदी केस सारांश (Hindi)",
      description: "पूर्ण देवनागरी हिंदी में मामले का कार्यकारी सारांश और मुख्य साक्ष्य प्राप्त करें।",
      prompt: "ऑपरेशन नेक्सस (INV-2026-0142) का मुख्य सारांश और तीन सबसे महत्वपूर्ण साक्ष्य हिंदी में बताएं।",
      icon: Languages,
      tag: "हिंदी",
    },
    {
      title: "Crypto Mixer Forensics",
      description: "Explain how decentralized mixers obfuscate wallet graphs and how investigators trace them.",
      prompt: "Explain the technical mechanics of decentralized crypto mixers and how forensic investigators de-anonymize transactions.",
      icon: Lock,
      tag: "Cyber Analysis",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center justify-center max-w-4xl mx-auto select-none">
      {/* Hero Badge */}
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-950 via-[#0a1122] to-cyan-950 border border-red-700/60 flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.25)]">
          <Brain className="w-8 h-8 text-red-400" />
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border border-[#060a14]"></span>
        </span>
      </div>

      <h2 className="text-xl sm:text-2xl font-mono font-bold text-gray-100 tracking-wider text-center">
        CIPHER AI ASSISTANT
      </h2>
      <p className="mt-1 text-xs font-mono text-cyan-400 uppercase tracking-widest text-center">
        POWERED BY OLLAMA GPT-OSS 120B CLOUD
      </p>

      {/* Grid 1: Investigative Intelligence */}
      <div className="w-full mt-8">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-red-500" />
          <h3 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
            Investigative Intelligence Queries
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {investigativePrompts.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => onSelectPrompt(item.prompt)}
                className="group flex flex-col p-3.5 rounded-xl bg-[#080d1a] hover:bg-[#0e1628] border border-[#162033] hover:border-red-600/50 text-left transition-all duration-200 shadow-sm hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-red-950/60 border border-red-900/60 text-red-400 group-hover:text-red-300">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-gray-200 group-hover:text-white">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#10192b] text-gray-400 border border-[#1a263c]">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 group-hover:text-gray-300 line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-2.5 flex items-center text-[11px] font-mono text-red-400 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  <span>Run intelligence query</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid 2: General Knowledge & Multilingual */}
      <div className="w-full mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
            General Knowledge, Coding & Multilingual
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {generalPrompts.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => onSelectPrompt(item.prompt)}
                className="group flex flex-col p-3.5 rounded-xl bg-[#080d1a] hover:bg-[#0e1628] border border-[#162033] hover:border-cyan-600/50 text-left transition-all duration-200 shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-cyan-950/60 border border-cyan-900/60 text-cyan-400 group-hover:text-cyan-300">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-gray-200 group-hover:text-white">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#10192b] text-gray-400 border border-[#1a263c]">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 group-hover:text-gray-300 line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-2.5 flex items-center text-[11px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  <span>Send prompt</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
