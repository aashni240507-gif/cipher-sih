"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  User,
  Phone,
  Car,
  MapPin,
  Building,
  CreditCard,
  Search,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Clock,
  Sparkles,
  FileText,
  Activity,
  CheckCircle2,
  FolderOpen,
  Info,
} from "lucide-react";
import NexusHeader from "@/components/NexusHeader";
import StatusBadge from "@/components/StatusBadge";
import { useInvestigation } from "@/components/InvestigationContext";

interface EntityData {
  id: string;
  name: string;
  aliases: string[];
  type: string;
  priority: "priority-high" | "priority-medium" | "priority-low";
  priorityLabel: string;
  confidence: string;
  provenance: "COURT_RECORDED" | "INVESTIGATIVE_MATERIAL" | "DEMO_SYNTHETIC";
  whyRelevant: string;
  phones: string[];
  vehicles: string[];
  locations: string[];
  organizations: string[];
  cases: string[];
  financial: string[];
  evidenceCount: number;
}

const SAHIL_KHAN_ENTITIES: EntityData[] = [
  {
    id: "PERSON-001",
    name: "Sahil Khan",
    aliases: ["Applicant", "Subject Khan", "Sahil"],
    type: "Applicant / Investigation Subject (Bail Appl. 3788/2025)",
    priority: "priority-high",
    priorityLabel: "STAGE: PRE-TRIAL / BAIL PROCEEDING",
    confidence: "100% Certified Court Record",
    provenance: "COURT_RECORDED",
    whyRelevant:
      "Applicant in Bail Application 3788/2025 before Delhi High Court (FIR 4/2025 PS Cyber South-West Delhi). High Court order documents multi-point investigative material: over ₹5 lakh credited to his account from the fraud flow, ATM CCTV footage identification at Jaipur kiosks, Cell-ID tower telemetry in Jaipur and Alwar, and co-accused disclosures. Anticipatory bail dismissed observing custodial interrogation necessary.",
    phones: ["+91 98290 14820 (DEMO_SYNTHETIC)"],
    vehicles: ["Maruti Suzuki Swift (RJ-14-XX) (DEMO_SYNTHETIC)"],
    locations: [
      "Jaipur, Rajasthan (ATM Kiosk Cash Extractions)",
      "Alwar, Rajasthan (Tower Location Telemetry)",
      "Cyber South-West Jurisdiction, Delhi",
    ],
    organizations: ["Cyber-Fraud Mule Network (Interstate Syndicate)"],
    cases: ["State v. Sahil Khan (CASE-2025-004 / FIR 4/2025)", "Operation Amber Shield (CASE-005)"],
    financial: ["Sahil Khan Bank Account XXXXXX4408 (>₹5L Credit) (DEMO_SYNTHETIC)"],
    evidenceCount: 6,
  },
  {
    id: "PERSON-002",
    name: "Sajid Khan",
    aliases: ["Sajid", "Co-Accused 1"],
    type: "Co-Accused Mentioned in Investigation",
    priority: "priority-high",
    priorityLabel: "INVESTIGATION STATUS: CO-ACCUSED",
    confidence: "98% Investigative Material",
    provenance: "INVESTIGATIVE_MATERIAL",
    whyRelevant:
      "Named in police investigation and custodial disclosure statements relating to ATM cash extractions and interstate cyber-fraud distribution. Investigating agency collected ATM CCTV identifying co-accused in cash withdrawals.",
    phones: ["+91 98290 88312 (DEMO_SYNTHETIC)"],
    vehicles: ["Motorcycle (RJ-14-YY) (DEMO_SYNTHETIC)"],
    locations: ["Jaipur, Rajasthan", "Mewat Border Corridor"],
    organizations: ["Cyber-Fraud Mule Network"],
    cases: ["State v. Sahil Khan (CASE-2025-004)"],
    financial: ["Mule Account 1 (Rajasthan) Relay"],
    evidenceCount: 3,
  },
  {
    id: "PERSON-003",
    name: "Narendra Kumar",
    aliases: ["Narendra", "Co-Accused 2"],
    type: "Co-Accused Mentioned in Investigation",
    priority: "priority-high",
    priorityLabel: "INVESTIGATION STATUS: CO-ACCUSED",
    confidence: "98% Investigative Material",
    provenance: "INVESTIGATIVE_MATERIAL",
    whyRelevant:
      "Co-accused identified in investigative material regarding ATM cash withdrawals and bank transactions. Named Sahil Khan in custodial disclosure statements regarding fund distribution.",
    phones: ["+91 94140 22910 (DEMO_SYNTHETIC)"],
    vehicles: ["Commercial Transit Van (DEMO_SYNTHETIC)"],
    locations: ["Jaipur, Rajasthan", "Alwar, Rajasthan"],
    organizations: ["Cyber-Fraud Mule Network"],
    cases: ["State v. Sahil Khan (CASE-2025-004)"],
    financial: ["Mule Account 2 (Bihar) Relay"],
    evidenceCount: 3,
  },
  {
    id: "PERSON-004",
    name: "Sabir Khan",
    aliases: ["Sabir", "Co-Accused 3"],
    type: "Co-Accused Mentioned in Investigation",
    priority: "priority-medium",
    priorityLabel: "INVESTIGATION STATUS: CO-ACCUSED",
    confidence: "94% Investigative Material",
    provenance: "INVESTIGATIVE_MATERIAL",
    whyRelevant:
      "Co-accused mentioned in investigative disclosure statements concerning regional interstate cyber-fraud network spanning Rajasthan, Bihar, and Jharkhand.",
    phones: ["+91 96020 77154 (DEMO_SYNTHETIC)"],
    vehicles: ["Unregistered Utility (DEMO_SYNTHETIC)"],
    locations: ["Alwar, Rajasthan", "Mewat Region"],
    organizations: ["Cyber-Fraud Mule Network"],
    cases: ["State v. Sahil Khan (CASE-2025-004)"],
    financial: ["Mule Account 3 (Jharkhand) Relay"],
    evidenceCount: 2,
  },
  {
    id: "PERSON-005",
    name: "Senior Citizen Victim (Complainant)",
    aliases: ["Complainant", "Senior Citizen Victim"],
    type: "Complainant / Cyber-Fraud Victim",
    priority: "priority-low",
    priorityLabel: "STATUS: COMPLAINANT / VICTIM",
    confidence: "100% Certified FIR Record",
    provenance: "COURT_RECORDED",
    whyRelevant:
      "Senior citizen victim who encountered a Yahoo email issue, searched online for customer care support, contacted a fraudulent number, and was induced to download a malicious APK and provide debit card details resulting in ₹14 lakh unauthorized savings debit and ₹12 lakh linked FD liquidation (Total: ₹26 lakh loss).",
    phones: ["+91 98110 XXXXX (DEMO_SYNTHETIC)"],
    vehicles: ["N/A"],
    locations: ["South-West Delhi"],
    organizations: ["HDFC Bank Account Holder"],
    cases: ["State v. Sahil Khan (CASE-2025-004 / FIR 4/2025)"],
    financial: [
      "HDFC Savings Account (₹14,00,000 Unauthorized Debit)",
      "HDFC Linked Fixed Deposits (₹12,00,000 Liquidated)",
    ],
    evidenceCount: 4,
  },
];

const NEXUS_ENTITIES: EntityData[] = [
  {
    id: "ENT-901",
    name: "Viktor R. (Target-01)",
    aliases: ["V. Romanov", "The Port Broker", "Ghost-TX"],
    type: "Primary Coordinating Suspect",
    priority: "priority-high",
    priorityLabel: "INVESTIGATION PRIORITY: CRITICAL",
    confidence: "99.8%",
    provenance: "COURT_RECORDED",
    whyRelevant:
      "Target-01 exhibits the highest betweenness centrality (0.94) within the syndicate topology. Telecommunication intercepts link this entity directly to 14 financial disbursements and shipping manifest authorizations in Rotterdam.",
    phones: ["+1 (555) 019-2834 (Active Burner)", "+1 (555) 843-9912 (Encrypted VoIP)"],
    vehicles: ["Black Armored SUV (TX-89)", "Mercedes Benz Sprinter (NL-442)"],
    locations: ["Dock Warehouse #4 (Rotterdam)", "Limassol Port Terminal", "St. Petersburg Safehouse"],
    organizations: ["Aura Logistics Holding Ltd", "Black Sea Freight Trading"],
    cases: ["Operation Nexus (INV-2026-0142)", "Rotterdam Docks Narcotics (INV-2025-089)"],
    financial: ["Crypto Vault 0x7F...44b ($640k USDT)", "Bank of Nicosia Acct #9042"],
    evidenceCount: 18,
  },
  {
    id: "ENT-902",
    name: "Alexei M. (Target-02)",
    aliases: ["A. Morozov", "Dockmaster Alex"],
    type: "Port Logistics Enforcer",
    priority: "priority-high",
    priorityLabel: "INVESTIGATION PRIORITY: HIGH",
    confidence: "98.7%",
    provenance: "INVESTIGATIVE_MATERIAL",
    whyRelevant:
      "Physical surveillance photos position Target-02 at container staging bays during off-hours unsealing operations. Direct communications with Target-01 verified via tower sector dumps.",
    phones: ["+1 (555) 843-9912", "+31 6 1234 5678"],
    vehicles: ["Volvo FH16 Cargo Truck (BX-99)"],
    locations: ["Rotterdam Quay 14", "Antwerp Port Depot"],
    organizations: ["Aura Logistics Holding Ltd"],
    cases: ["Operation Nexus (INV-2026-0142)"],
    financial: ["Personal Current Acct (ABN AMRO)"],
    evidenceCount: 11,
  },
  {
    id: "ENT-903",
    name: "Elena Rostova",
    aliases: ["E. Rostova", "Counsel Elena"],
    type: "Corporate Signatory / Counsel",
    priority: "priority-medium",
    priorityLabel: "INVESTIGATION PRIORITY: MEDIUM",
    confidence: "94.5%",
    provenance: "INVESTIGATIVE_MATERIAL",
    whyRelevant:
      "Sole registered legal representative for Aura Logistics Holding Ltd and signatory on multiple escrow transfers routed through Cypriot commercial banks.",
    phones: ["+1 (555) 441-0089"],
    vehicles: ["Audi A6 Sedan (CY-810)"],
    locations: ["Limassol Legal Office #301", "Geneva Private Banking Hub"],
    organizations: ["Aura Logistics Holding Ltd", "Rostova & Partners Legal"],
    cases: ["Operation Nexus (INV-2026-0142)", "Syndicate CashWash (FIN-2026-0819)"],
    financial: ["Zurich Private Client Escrow"],
    evidenceCount: 8,
  },
];

export default function EntityProfilePage() {
  const { activeInvestigation, currentCaseId, selectInvestigation, investigations } = useInvestigation();

  const isSahilKhanCase = useMemo(() => {
    const id = (currentCaseId || activeInvestigation?.id || "").toLowerCase();
    return id.includes("2025-004") || id.includes("sahil") || id.includes("inv-004");
  }, [currentCaseId, activeInvestigation]);

  const activeEntityList = useMemo(() => {
    return isSahilKhanCase ? SAHIL_KHAN_ENTITIES : NEXUS_ENTITIES;
  }, [isSahilKhanCase]);

  const [selectedEntity, setSelectedEntity] = useState<EntityData>(activeEntityList[0]);
  const [searchQuery, setSearchQuery] = useState("");

  // Update selectedEntity when switching case if needed
  React.useEffect(() => {
    setSelectedEntity(activeEntityList[0]);
  }, [activeEntityList]);

  const filtered = activeEntityList.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col selection:bg-red-600 selection:text-white">
      <NexusHeader moduleTitle="CIPHER ENTITY PROFILE" badge="INTELLIGENCE PROFILES" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Top Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1b2636]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded bg-[#101722] border border-[#1e2a3b] text-[#39d9ff]">
                CASE: {activeInvestigation?.title || (isSahilKhanCase ? "State v. Sahil Khan (CASE-2025-004)" : "Operation Nexus")}
              </span>
              {isSahilKhanCase && (
                <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/40 text-emerald-400">
                  COURT GROUNDED // DELHI HIGH COURT
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-sans">
              CIPHER ENTITY INTELLIGENCE <span className="text-[#39d9ff] text-glow-cyan">DOSSIER</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Case Selector Dropdown */}
            <div className="flex items-center gap-2 bg-[#101722] border border-[#1e2a3b] rounded-xl px-3 py-1.5 text-xs font-mono">
              <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={activeInvestigation?.id || (isSahilKhanCase ? "CASE-2025-004" : "INV-2026-0142")}
                onChange={(e) => selectInvestigation(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                {investigations && investigations.length > 0 ? (
                  investigations.map((inv) => (
                    <option key={inv.id} value={inv.id} className="bg-[#101722] text-white">
                      {inv.id}: {inv.title}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="CASE-2025-004" className="bg-[#101722] text-white">
                      CASE-2025-004: State v. Sahil Khan (Cyber South-West FIR 4/2025)
                    </option>
                    <option value="INV-2026-0142" className="bg-[#101722] text-white">
                      INV-2026-0142: Operation Nexus
                    </option>
                  </>
                )}
              </select>
            </div>

            <Link
              href="/network-analysis"
              className="px-4 py-2 rounded-xl bg-[#101722] hover:bg-[#151e2b] border border-[#1e2a3b] text-xs font-mono font-semibold text-[#39d9ff] flex items-center gap-2 transition-colors"
            >
              <span>View In Topology Graph</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Legal Restraint Notice for CASE-2025-004 */}
        {isSahilKhanCase && (
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 flex items-start gap-3 text-xs text-slate-300">
            <Info className="w-4 h-4 text-[#39d9ff] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#39d9ff] uppercase font-mono tracking-wider block mb-1">
                Legal Jurisprudence &amp; Source Notice (Delhi High Court Order dated 14 Jan 2026)
              </span>
              <p className="leading-relaxed text-slate-400">
                Data in this dossier reflects investigative material recorded during the anticipatory bail proceeding in
                <strong> Bail Application 3788/2025 (FIR 4/2025 PS Cyber South-West Delhi)</strong>. CIPHER correlates investigative evidence and does not determine guilt.
                All individuals are presumed innocent until proven guilty by a court of competent jurisdiction.
              </p>
            </div>
          </div>
        )}

        {/* 2-Column Layout: Entity List (4 cols) & Detail Dossier (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Entity Directory List */}
          <aside className="lg:col-span-4 bg-[#101722] border border-[#1e2a3b] rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entities, aliases..."
                className="w-full bg-[#080b12] border border-[#1e2a3b] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#39d9ff]"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map((item) => {
                const isSelected = selectedEntity.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedEntity(item)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-[#151e2b] border-[#ff3b30] shadow-md shadow-red-950/40"
                        : "bg-[#0b1018] border-[#182333] hover:border-slate-600 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#39d9ff] font-semibold">
                        {item.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                            item.provenance === "COURT_RECORDED"
                              ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-400"
                              : item.provenance === "INVESTIGATIVE_MATERIAL"
                              ? "bg-amber-950/50 border-amber-500/40 text-amber-400"
                              : "bg-blue-950/50 border-blue-500/40 text-blue-400"
                          }`}
                        >
                          {item.provenance}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-tight font-sans">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 truncate">{item.type}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Column: Detailed Entity Intelligence Profile */}
          <section className="lg:col-span-8 bg-[#101722] border border-[#1e2a3b] rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Header with Avatar & Priority */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#1b2636]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#151e2b] to-[#080b12] border border-red-500/50 flex items-center justify-center font-bold text-lg text-white font-mono shadow-inner">
                  {selectedEntity.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-sans">{selectedEntity.name}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                    <span>Aliases: {selectedEntity.aliases.join(", ")}</span>
                    <span>•</span>
                    <span className="text-[#39d9ff]">{selectedEntity.id}</span>
                    <span>•</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                        selectedEntity.provenance === "COURT_RECORDED"
                          ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                          : selectedEntity.provenance === "INVESTIGATIVE_MATERIAL"
                          ? "bg-amber-950/60 border-amber-500/50 text-amber-300"
                          : "bg-blue-950/60 border-blue-500/50 text-blue-300"
                      }`}
                    >
                      {selectedEntity.provenance}
                    </span>
                  </div>
                </div>
              </div>

              <StatusBadge label={selectedEntity.priorityLabel} variant={selectedEntity.priority} size="md" />
            </div>

            {/* "Why this entity is relevant" Callout */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#0b1018] border border-red-900/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#ff3b30] uppercase font-mono tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>Investigative Relevance &amp; Evidentiary Findings</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedEntity.whyRelevant}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              {/* Phones */}
              <div className="p-4 rounded-xl bg-[#0b1018] border border-[#182333] space-y-2">
                <span className="text-slate-400 uppercase text-[10px] flex items-center gap-1.5 font-bold">
                  <Phone className="w-3.5 h-3.5 text-[#39d9ff]" /> Associated Phone Numbers
                </span>
                <ul className="space-y-1 text-slate-200">
                  {selectedEntity.phones.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>

              {/* Vehicles */}
              <div className="p-4 rounded-xl bg-[#0b1018] border border-[#182333] space-y-2">
                <span className="text-slate-400 uppercase text-[10px] flex items-center gap-1.5 font-bold">
                  <Car className="w-3.5 h-3.5 text-amber-400" /> Linked Vehicles &amp; Transport
                </span>
                <ul className="space-y-1 text-slate-200">
                  {selectedEntity.vehicles.map((v, i) => (
                    <li key={i}>• {v}</li>
                  ))}
                </ul>
              </div>

              {/* Locations */}
              <div className="p-4 rounded-xl bg-[#0b1018] border border-[#182333] space-y-2">
                <span className="text-slate-400 uppercase text-[10px] flex items-center gap-1.5 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" /> Key Operating Locations
                </span>
                <ul className="space-y-1 text-slate-200">
                  {selectedEntity.locations.map((l, i) => (
                    <li key={i}>• {l}</li>
                  ))}
                </ul>
              </div>

              {/* Financial */}
              <div className="p-4 rounded-xl bg-[#0b1018] border border-[#182333] space-y-2">
                <span className="text-slate-400 uppercase text-[10px] flex items-center gap-1.5 font-bold">
                  <CreditCard className="w-3.5 h-3.5 text-yellow-400" /> Financial &amp; Bank Accounts
                </span>
                <ul className="space-y-1 text-slate-200">
                  {selectedEntity.financial.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Associated Cases & Evidence Summary */}
            <div className="p-4 rounded-xl bg-[#0b1018] border border-[#182333] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 uppercase text-[10px] block">Associated Case Dossiers</span>
                <span className="text-white font-bold">{selectedEntity.cases.join(" • ")}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 uppercase text-[10px] block">Verified Evidence Exhibits</span>
                <span className="text-[#39d9ff] font-bold">{selectedEntity.evidenceCount} EXHIBITS</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
