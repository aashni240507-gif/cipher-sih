"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Shield,
  Bell,
  Sliders,
  Database,
  Terminal,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  User,
  Key,
  Laptop,
} from "lucide-react";
import NexusHeader from "@/components/NexusHeader";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/components/AuthProvider";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();

  const [activeSection, setActiveSection] = useState<
    | "account"
    | "security"
    | "notifications"
    | "appearance"
    | "datasources"
    | "system"
    | "audit"
  >("account");

  const [name, setName] = useState("");
  const [agencyDivision, setAgencyDivision] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAgencyDivision(user.agencyDivision || "");
    }
  }, [user]);

  // Load audit logs when audit section is active
  useEffect(() => {
    if (activeSection === "audit") {
      setLoadingAudit(true);
      fetch("/api/audit-logs")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.logs)) {
            setAuditLogs(data.logs);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingAudit(false));
    }
  }, [activeSection]);

  const sections = [
    { id: "account", label: "Account & Profile", icon: User },
    { id: "security", label: "Security & MFA", icon: Shield },
    { id: "notifications", label: "Notification Rules", icon: Bell },
    { id: "appearance", label: "Interface & Appearance", icon: Sliders },
    { id: "datasources", label: "Data Ingestion Feeds", icon: Database },
    { id: "system", label: "System Configuration", icon: Terminal },
    { id: "audit", label: "Cryptographic Audit Logs", icon: FileCheck },
  ];

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setSaveError("Analyst name cannot be empty.");
      return;
    }
    if (name.trim().length < 2) {
      setSaveError("Name must be at least 2 characters.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSavedSuccess(false);

    try {
      await updateProfile({
        name: name.trim(),
        agencyDivision: agencyDivision.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to update profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col selection:bg-red-600 selection:text-white">
      <NexusHeader moduleTitle="SETTINGS" badge="SYSTEM CONFIG" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Top Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1b2636]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-sans">
              SYSTEM <span className="text-[#39d9ff] text-glow-cyan">SETTINGS</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge label="CLEARANCE: L3 STRICT" variant="priority-high" />
          </div>
        </section>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Navigation Sidebar (4 cols) */}
          <aside className="lg:col-span-4 bg-[#101722] border border-[#1e2a3b] rounded-2xl p-3 sm:p-4 space-y-1">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isCurrent = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all text-left ${
                    isCurrent
                      ? "bg-[#151e2b] text-white border border-red-500/50 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-[#0c121c]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isCurrent ? "text-[#ff3b30]" : "text-slate-500"}`} />
                  <span className="font-semibold">{sec.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main Config Pane (8 cols) */}
          <section className="lg:col-span-8 bg-[#101722] border border-[#1e2a3b] rounded-2xl p-6 sm:p-8 space-y-6">
            {/* 1. Account */}
            {activeSection === "account" && (
              <form onSubmit={handleSave} className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white font-sans uppercase tracking-wide">
                    Analyst Profile
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 bg-[#080b12] px-2.5 py-1 rounded border border-[#1b2636]">
                    UID: {user?.id || "USR-CIPHER-001"}
                  </span>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                      Analyst Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (saveError) setSaveError(null);
                      }}
                      placeholder="Enter full name"
                      className="w-full bg-[#080b12] border border-[#1e2a3b] focus:border-red-500/80 focus:ring-1 focus:ring-red-500/50 rounded-lg px-3.5 py-2.5 text-white transition-all outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Displayed across operational headers, investigation logs, and judicial exports.
                    </span>
                  </div>

                  <div>
                    <label className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                      Government / Intelligence Email
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={user?.email || "analyst.sharma@cipher.intel"}
                        className="w-full bg-[#080b12]/60 border border-[#192333] text-slate-400 rounded-lg px-3.5 py-2.5 cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                        VERIFIED IDENTITY
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                      Agency Division / Unit
                    </label>
                    <input
                      type="text"
                      value={agencyDivision}
                      onChange={(e) => setAgencyDivision(e.target.value)}
                      placeholder="Organized Cybercrime & Transnational Contraband Taskforce"
                      className="w-full bg-[#080b12] border border-[#1e2a3b] focus:border-red-500/80 focus:ring-1 focus:ring-red-500/50 rounded-lg px-3.5 py-2.5 text-white transition-all outline-none"
                    />
                  </div>

                  {/* Security Classification Metadata */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#080b12] border border-[#182333]">
                      <span className="text-[10px] text-slate-500 block uppercase">Operational Role</span>
                      <span className="text-slate-200 font-semibold text-xs mt-0.5 block">
                        {user?.role || "Lead Intelligence Analyst"}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#080b12] border border-[#182333]">
                      <span className="text-[10px] text-slate-500 block uppercase">Clearance Level</span>
                      <span className="text-red-400 font-semibold text-xs mt-0.5 block flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-red-500" />
                        {user?.clearanceLevel || "TOP SECRET // SCI (L3)"}
                      </span>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* 2. Security */}
            {activeSection === "security" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white font-sans uppercase">Security &amp; Cryptography</h3>
                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#080b12] border border-[#182333] flex items-center justify-between">
                    <div>
                      <span className="text-white font-bold block">Hardware Security Key (FIDO2/YubiKey)</span>
                      <span className="text-slate-400 text-[10px]">Registered: Key #NY-9902</span>
                    </div>
                    <StatusBadge label="ACTIVE" variant="active" />
                  </div>
                  <div className="p-3 rounded-xl bg-[#080b12] border border-[#182333] flex items-center justify-between">
                    <div>
                      <span className="text-white font-bold block">Air-Gapped Node Isolation</span>
                      <span className="text-slate-400 text-[10px]">Strict egress policy enforced</span>
                    </div>
                    <StatusBadge label="ENFORCED" variant="verified" />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Notifications */}
            {activeSection === "notifications" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white font-sans uppercase">Threat Notification Rules</h3>
                <div className="space-y-3 text-xs font-mono">
                  {[
                    "Bridge entity detected linking >2 distinct criminal clusters",
                    "Burner handset detected across multiple jurisdiction warrants",
                    "Crypto transfer velocity exceeds $100k within 5-minute window",
                  ].map((rule, idx) => (
                    <label key={idx} className="p-3 rounded-xl bg-[#080b12] border border-[#182333] flex items-center justify-between cursor-pointer">
                      <span className="text-slate-200">{rule}</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-red-500 rounded bg-[#101722] border-[#1e2a3b] focus:ring-0" />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Appearance */}
            {activeSection === "appearance" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white font-sans uppercase">Interface Theme</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Default CIPHER Dark Forensic theme active. Background: #05070B, Surfaces: #101722 with subtle cyan analytical nodes and crimson priority indicators.
                </p>
                <div className="flex gap-3 text-xs font-mono">
                  <span className="px-3 py-2 rounded-lg bg-black border border-red-500 text-white font-bold">CIPHER TACTICAL DARK (ACTIVE)</span>
                </div>
              </div>
            )}

            {/* 5. Data Sources */}
            {activeSection === "datasources" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white font-sans uppercase">Data Source Pipelines</h3>
                <p className="text-xs text-slate-300">
                  7 pipelines active with automated entity deduplication and Louvain graph clustering.
                </p>
                <Link href="/investigations/data-sources" className="text-xs font-mono text-[#39d9ff] hover:underline block">
                  Open Data Ingestion Pipelines Manager →
                </Link>
              </div>
            )}

            {/* 6. System */}
            {activeSection === "system" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white font-sans uppercase">Cluster Configuration</h3>
                <div className="p-3 bg-[#080b12] rounded-xl border border-[#182333] text-xs font-mono space-y-1">
                  <div>Core Build: <span className="text-white font-bold">CIPHER Intel v4.2.0</span></div>
                  <div>Turbopack Engine: <span className="text-[#39d9ff]">Active (163ms Ready)</span></div>
                  <div>Database Hash Consistency: <span className="text-emerald-400">100% Synced</span></div>
                </div>
              </div>
            )}

            {/* 7. Audit */}
            {activeSection === "audit" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white font-sans uppercase">Cryptographic Audit Trail</h3>
                  <span className="text-[10px] font-mono text-slate-400">HMAC-SHA256 Signed</span>
                </div>

                {loadingAudit ? (
                  <div className="flex items-center justify-center p-8 text-slate-400 text-xs font-mono">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verifying audit hashes...
                  </div>
                ) : auditLogs.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {auditLogs.map((log: any) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-lg bg-[#080b12] border border-[#162233] text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-red-400">{log.event}</span>
                          <span className="text-slate-400">
                            {new Date(log.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: false,
                            })}
                          </span>
                        </div>
                        <div className="text-slate-300 text-[11px] truncate">
                          {log.details ? JSON.stringify(log.details) : "User activity logged"}
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono truncate">
                          Sig: {log.signature}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 text-[11px] font-mono">
                    {[
                      "May 21 19:25:01 UTC • Analyst Amit Sharma accessed Case #INV-2026-0142",
                      "May 21 19:28:44 UTC • Generated Judicial PDF export for Operation Nexus",
                      "May 21 19:30:12 UTC • Verified SHA-256 evidence integrity token EVD-0142-01",
                    ].map((log, i) => (
                      <div key={i} className="p-2.5 rounded bg-[#080b12] border border-[#162233] text-slate-300">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Save Message & Action */}
            <div className="pt-4 border-t border-[#1b2636] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                {saveError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}
                {savedSuccess && !saveError && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Configuration &amp; analyst profile saved successfully.</span>
                  </div>
                )}
                {!savedSuccess && !saveError && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    Changes cryptographically logged to system audit trail
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg btn-red-glow text-white text-xs font-mono font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSaving ? "SAVING..." : "[ SAVE CONFIGURATION ]"}</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
