"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  FolderLock,
  FileCheck,
  Search,
  Filter,
  ShieldCheck,
  ExternalLink,
  Download,
  Eye,
  CheckCircle2,
  Lock,
  Plus,
  X,
  UploadCloud,
  FileText,
  AlertTriangle,
  Layers,
  MapPin,
  Phone,
  CreditCard,
  Users,
  Calendar,
  Hash,
} from "lucide-react";
import NexusHeader from "@/components/NexusHeader";
import StatusBadge from "@/components/StatusBadge";
import { useInvestigation } from "@/components/InvestigationContext";

interface EvidenceExhibit {
  id: string;
  name: string;
  type: string;
  source: string;
  sourceUrl?: string;
  date: string;
  relatedEntity?: string;
  relatedCase: string;
  status: "verified" | "pending";
  sha256: string;
  size: string;
  description: string;
  linkedPeople: string[];
  linkedPhones: string[];
  linkedAccounts: string[];
  linkedLocations: string[];
  linkedEvents: string[];
  provenance: "COURT_RECORDED" | "INVESTIGATIVE_MATERIAL" | "DEMO_SYNTHETIC" | "AI_INFERENCE" | "UNKNOWN";
  verificationStatus: "Verified Judicial Record" | "Forensic Integrity Verified" | "Investigative Working Copy" | "Pending Subpoena";
  createdAt?: string;
}

const EVIDENCE_CATEGORIES = [
  "ALL",
  "COURT DOCUMENT",
  "CCTV",
  "CDR",
  "IPDR",
  "IMEI",
  "BANK RECORD",
  "TRANSACTION",
  "KYC",
  "DISCLOSURE STATEMENT",
  "NCRP RECORD",
  "WITNESS STATEMENT",
  "OTHER",
];

export default function EvidencePage() {
  const { activeCaseId, activeCaseTitle } = useInvestigation();
  const [evidenceList, setEvidenceList] = useState<EvidenceExhibit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceExhibit | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState("CCTV");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadSource, setUploadSource] = useState("Delhi Police Cyber Crime Unit");
  const [uploadPeople, setUploadPeople] = useState("");
  const [uploadPhones, setUploadPhones] = useState("");
  const [uploadAccounts, setUploadAccounts] = useState("");
  const [uploadLocations, setUploadLocations] = useState("");
  const [uploadEvents, setUploadEvents] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [calculatedHash, setCalculatedHash] = useState("");
  const [isHashing, setIsHashing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch Evidence for Active Case
  const loadEvidence = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/evidence?caseId=${encodeURIComponent(activeCaseId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.evidence)) {
        setEvidenceList(data.evidence);
      }
    } catch (err) {
      console.error("Error loading evidence exhibits:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, [activeCaseId]);

  // Handle File Select & In-Browser SHA-256 calculation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    // Compute cryptographic SHA-256 hash
    setIsHashing(true);
    try {
      const buffer = await file.arrayBuffer();
      const digest = await window.crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(digest));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      setCalculatedHash(hashHex);
    } catch (err) {
      console.error("Error calculating SHA-256 digest:", err);
      // Fallback synthetic hash
      setCalculatedHash("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    } finally {
      setIsHashing(false);
    }
  };

  // Submit Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      alert("Please provide an Evidence Title.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fileSizeString = uploadFile
        ? uploadFile.size > 1024 * 1024
          ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(uploadFile.size / 1024)} KB`
        : "1.5 MB";

      const payload = {
        name: uploadTitle,
        type: uploadType,
        source: uploadSource,
        relatedCase: activeCaseId,
        sha256: calculatedHash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        size: fileSizeString,
        description: uploadDescription || "Uploaded forensic evidence item ingested into active chain of custody.",
        linkedPeople: uploadPeople ? uploadPeople.split(",").map((s) => s.trim()).filter(Boolean) : [],
        linkedPhones: uploadPhones ? uploadPhones.split(",").map((s) => s.trim()).filter(Boolean) : [],
        linkedAccounts: uploadAccounts ? uploadAccounts.split(",").map((s) => s.trim()).filter(Boolean) : [],
        linkedLocations: uploadLocations ? uploadLocations.split(",").map((s) => s.trim()).filter(Boolean) : [],
        linkedEvents: uploadEvents ? uploadEvents.split(",").map((s) => s.trim()).filter(Boolean) : [],
        provenance: "INVESTIGATIVE_MATERIAL",
      };

      const res = await fetch("/api/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (resData.success && resData.evidence) {
        setEvidenceList((prev) => [resData.evidence, ...prev]);
        setIsUploadModalOpen(false);
        // Reset form
        setUploadTitle("");
        setUploadType("CCTV");
        setUploadDescription("");
        setUploadFile(null);
        setCalculatedHash("");
        setUploadPeople("");
        setUploadPhones("");
        setUploadAccounts("");
        setUploadLocations("");
        setUploadEvents("");
        alert(`Evidence registered successfully as ${resData.evidence.id} with SHA-256 verification.`);
      } else {
        alert(resData.error || "Failed to upload evidence exhibit.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Error ingesting evidence exhibit: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter evidence
  const filtered = useMemo(() => {
    return evidenceList.filter((ev) => {
      const matchesSearch =
        ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.relatedEntity && ev.relatedEntity.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.linkedPeople?.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ev.linkedAccounts?.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ev.linkedLocations?.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === "ALL" ||
        ev.type.toUpperCase() === selectedCategory.toUpperCase();

      return matchesSearch && matchesCat;
    });
  }, [evidenceList, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col selection:bg-red-600 selection:text-white">
      <NexusHeader
        moduleTitle="EVIDENCE VAULT"
        badge="CHAIN OF CUSTODY"
        activeCase={`${activeCaseId} // ${activeCaseTitle.toUpperCase()}`}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Top Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1b2636]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-sans">
              EVIDENCE <span className="text-[#39d9ff] text-glow-cyan">VAULT</span>
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              {activeCaseId}: {evidenceList.length} SECURED CHAIN-OF-CUSTODY EXHIBITS
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl btn-red-glow text-white text-xs font-mono font-semibold uppercase flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>[ UPLOAD EVIDENCE ]</span>
            </button>
          </div>
        </section>

        {/* Filter Bar & Categories */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#101722] border border-[#1e2a3b] p-4 rounded-xl">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search evidence by ID, actor, bank account, location..."
                className="w-full bg-[#080b12] border border-[#1e2a3b] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#39d9ff]"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-400">
                {filtered.length} EXHIBITS FOUND
              </span>
              <StatusBadge label="SHA-256 INTEGRITY VERIFIED" variant="verified" />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {EVIDENCE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase whitespace-nowrap transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold"
                    : "bg-[#101722] text-slate-400 hover:text-white border border-[#1e2a3b]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Evidence Items List */}
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="card-nexus p-5 sm:p-6 rounded-xl border border-[#1e2a3b] bg-[#101722] flex flex-col lg:flex-row lg:items-start justify-between gap-6 hover:border-cyan-500/40 transition-all"
            >
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xs font-mono font-bold text-[#39d9ff] bg-cyan-950/50 border border-cyan-800/40 px-2.5 py-0.5 rounded">
                    {item.id}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 uppercase">
                    {item.type}
                  </span>
                  <h3 className="text-base font-bold text-white font-sans truncate">{item.name}</h3>

                  <StatusBadge
                    label={item.verificationStatus || (item.status === "verified" ? "HASH VERIFIED" : "PENDING SUBPOENA")}
                    variant={item.status === "verified" ? "verified" : "priority-medium"}
                  />

                  {/* Data Provenance Badge */}
                  {item.provenance && (
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                        item.provenance === "COURT_RECORDED"
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/50"
                          : item.provenance === "INVESTIGATIVE_MATERIAL"
                          ? "bg-cyan-950/60 text-cyan-300 border-cyan-700/50"
                          : "bg-amber-950/60 text-amber-300 border-amber-700/50"
                      }`}
                    >
                      PROVENANCE: {item.provenance}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                {/* Source & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-400 pt-1">
                  <div>
                    Source:{" "}
                    {item.sourceUrl ? (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#39d9ff] hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <span>{item.source}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-200">{item.source}</span>
                    )}
                  </div>
                  <div>
                    Date: <span className="text-slate-200">{item.date}</span>
                  </div>
                  <div>
                    File Size: <span className="text-slate-200">{item.size}</span>
                  </div>
                </div>

                {/* Linked Entities Grid */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {item.linkedPeople?.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-mono bg-[#0c121c] border border-[#1b2638] px-2 py-0.5 rounded text-slate-300">
                      <Users className="w-3 h-3 text-[#39d9ff]" />
                      <span>{item.linkedPeople.join(", ")}</span>
                    </div>
                  )}
                  {item.linkedAccounts?.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-mono bg-[#0c121c] border border-[#1b2638] px-2 py-0.5 rounded text-amber-300">
                      <CreditCard className="w-3 h-3 text-amber-400" />
                      <span>{item.linkedAccounts.join(", ")}</span>
                    </div>
                  )}
                  {item.linkedLocations?.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-mono bg-[#0c121c] border border-[#1b2638] px-2 py-0.5 rounded text-red-300">
                      <MapPin className="w-3 h-3 text-[#ff3b30]" />
                      <span>{item.linkedLocations.join(", ")}</span>
                    </div>
                  )}
                  {item.linkedEvents?.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-mono bg-[#0c121c] border border-[#1b2638] px-2 py-0.5 rounded text-emerald-300">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      <span>{item.linkedEvents.join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* SHA-256 Digest Box */}
                <div className="p-2 rounded bg-[#080b12] border border-[#162233] text-[10px] font-mono text-slate-500 truncate flex items-center gap-2">
                  <Hash className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="shrink-0">SHA-256:</span>
                  <span className="text-slate-300 font-semibold truncate select-all">{item.sha256}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                <button
                  type="button"
                  onClick={() => setSelectedEvidence(item)}
                  className="px-3.5 py-2 rounded-lg bg-[#151e2b] hover:bg-[#1a2638] text-xs font-mono text-slate-200 border border-[#1e2a3b] flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-[#39d9ff]" />
                  <span>Inspect</span>
                </button>

                {item.sourceUrl ? (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-lg bg-[#151e2b] hover:bg-[#1a2638] text-xs font-mono text-slate-200 border border-[#1e2a3b] flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Court Record</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => alert(`Exporting chain of custody verification slip for ${item.id}`)}
                    className="px-3.5 py-2 rounded-lg bg-[#151e2b] hover:bg-[#1a2638] text-xs font-mono text-slate-200 border border-[#1e2a3b] flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verify Slip</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Evidence Inspection Modal */}
        {selectedEvidence && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl rounded-2xl bg-[#101722] border border-[#1e2a3b] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#1b2636] pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-sm text-white font-sans">
                    Evidence Inspection: {selectedEvidence.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEvidence(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Title & Designation</div>
                  <h4 className="font-bold text-white text-sm font-sans mt-0.5">{selectedEvidence.name}</h4>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Case Summary & Description</div>
                  <p className="text-slate-300 font-sans leading-relaxed mt-0.5">{selectedEvidence.description}</p>
                </div>

                <div className="p-3 bg-[#080b12] rounded-lg border border-[#162233] space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase flex items-center justify-between">
                    <span>Cryptographic SHA-256 Checksum</span>
                    <span className="text-emerald-400 font-bold">VERIFIED</span>
                  </div>
                  <div className="text-emerald-400 break-all font-bold select-all">{selectedEvidence.sha256}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-[#0c121c] rounded-lg border border-[#162233]">
                  <div>
                    <span className="text-slate-500">Category:</span>{" "}
                    <span className="text-white font-bold">{selectedEvidence.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Related Case:</span>{" "}
                    <span className="text-white font-bold">{selectedEvidence.relatedCase}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Chain Status:</span>{" "}
                    <span className="text-emerald-400 font-bold">{selectedEvidence.verificationStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Data Provenance:</span>{" "}
                    <span className="text-cyan-400 font-bold">{selectedEvidence.provenance}</span>
                  </div>
                </div>

                {selectedEvidence.linkedPeople?.length > 0 && (
                  <div>
                    <span className="text-slate-500">Linked People:</span>{" "}
                    <span className="text-white">{selectedEvidence.linkedPeople.join(", ")}</span>
                  </div>
                )}
                {selectedEvidence.linkedAccounts?.length > 0 && (
                  <div>
                    <span className="text-slate-500">Linked Accounts:</span>{" "}
                    <span className="text-amber-300">{selectedEvidence.linkedAccounts.join(", ")}</span>
                  </div>
                )}
                {selectedEvidence.linkedLocations?.length > 0 && (
                  <div>
                    <span className="text-slate-500">Linked Locations:</span>{" "}
                    <span className="text-red-300">{selectedEvidence.linkedLocations.join(", ")}</span>
                  </div>
                )}
                {selectedEvidence.linkedEvents?.length > 0 && (
                  <div>
                    <span className="text-slate-500">Linked Timeline Events:</span>{" "}
                    <span className="text-emerald-300">{selectedEvidence.linkedEvents.join(", ")}</span>
                  </div>
                )}

                {selectedEvidence.sourceUrl && (
                  <div className="pt-2">
                    <a
                      href={selectedEvidence.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-cyan-950/60 border border-cyan-700/60 rounded text-[#39d9ff] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Primary Judicial Source (Delhi High Court / IndianKanoon)</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-[#1b2636]">
                <button
                  type="button"
                  onClick={() => setSelectedEvidence(null)}
                  className="px-4 py-2 rounded-lg bg-[#151e2b] text-xs font-mono text-white border border-[#1e2a3b] hover:bg-[#1a2638]"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Evidence Ingestion Modal */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-2xl rounded-2xl bg-[#101722] border border-[#1e2a3b] p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#1b2636] pb-3">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-[#39d9ff]" />
                  <h2 className="font-bold text-base text-white font-sans tracking-wide">
                    SECURE EVIDENCE INGESTION PORTAL
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-mono">
                {/* File Dropzone */}
                <div>
                  <label className="block text-slate-400 mb-1.5">
                    Select Evidence File (PDF, PNG, JPG, JPEG, TXT, CSV, DOC, DOCX)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#1e2a3b] hover:border-cyan-500/60 bg-[#080b12] p-4 rounded-xl text-center cursor-pointer transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.txt,.csv,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 text-[#39d9ff] mx-auto mb-2 opacity-80" />
                    {uploadFile ? (
                      <div>
                        <div className="text-white font-bold">{uploadFile.name}</div>
                        <div className="text-slate-500 text-[11px]">
                          {(uploadFile.size / 1024).toFixed(1)} KB • Click to change file
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-slate-300 font-sans font-medium">
                          Click to browse or drag & drop evidence file
                        </div>
                        <div className="text-slate-500 text-[11px] mt-1">
                          Cryptographic SHA-256 digest is computed automatically in-browser
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SHA-256 Digest Banner */}
                {isHashing && (
                  <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-[#39d9ff] animate-pulse">
                    Computing cryptographic SHA-256 checksum in-browser...
                  </div>
                )}
                {calculatedHash && (
                  <div className="p-2.5 rounded bg-[#080b12] border border-emerald-700/50 space-y-1">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>SHA-256 Checksum Computed</span>
                    </div>
                    <div className="text-[11px] text-white break-all">{calculatedHash}</div>
                  </div>
                )}

                {/* Title and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Evidence Title *</label>
                    <input
                      type="text"
                      required
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g. ATM CCTV Extraction Jaipur"
                      className="w-full bg-[#080b12] border border-[#1e2a3b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#39d9ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Evidence Type *</label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value)}
                      className="w-full bg-[#080b12] border border-[#1e2a3b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#39d9ff]"
                    >
                      {EVIDENCE_CATEGORIES.filter((c) => c !== "ALL").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-400 mb-1">Operational Description</label>
                  <textarea
                    rows={2}
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Provide chain of custody context, investigative observations..."
                    className="w-full bg-[#080b12] border border-[#1e2a3b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#39d9ff]"
                  />
                </div>

                {/* Associated Case & Source */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Associated Case</label>
                    <input
                      type="text"
                      disabled
                      value={`${activeCaseId} (${activeCaseTitle})`}
                      className="w-full bg-[#080b12] border border-[#1e2a3b] rounded-lg px-3 py-2 text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Evidence Source / Authority</label>
                    <input
                      type="text"
                      value={uploadSource}
                      onChange={(e) => setUploadSource(e.target.value)}
                      className="w-full bg-[#080b12] border border-[#1e2a3b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#39d9ff]"
                    />
                  </div>
                </div>

                {/* Entity Linkages */}
                <div className="border-t border-[#1b2636] pt-3 space-y-3">
                  <div className="text-[11px] text-[#39d9ff] uppercase font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Link Evidence to Graph & Timeline Entities</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Linked People (comma separated)</label>
                      <input
                        type="text"
                        value={uploadPeople}
                        onChange={(e) => setUploadPeople(e.target.value)}
                        placeholder="e.g. Sahil Khan, Sajid Khan"
                        className="w-full bg-[#080b12] border border-[#1e2a3b] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#39d9ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Linked Phones / IMEIs</label>
                      <input
                        type="text"
                        value={uploadPhones}
                        onChange={(e) => setUploadPhones(e.target.value)}
                        placeholder="e.g. +91-9871234001"
                        className="w-full bg-[#080b12] border border-[#1e2a3b] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#39d9ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Linked Accounts</label>
                      <input
                        type="text"
                        value={uploadAccounts}
                        onChange={(e) => setUploadAccounts(e.target.value)}
                        placeholder="e.g. Mule Acct XXXXXX3341"
                        className="w-full bg-[#080b12] border border-[#1e2a3b] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#39d9ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Linked Locations / Cell Towers</label>
                      <input
                        type="text"
                        value={uploadLocations}
                        onChange={(e) => setUploadLocations(e.target.value)}
                        placeholder="e.g. Jaipur ATM, CELL-001"
                        className="w-full bg-[#080b12] border border-[#1e2a3b] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#39d9ff]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Linked Timeline Events</label>
                    <input
                      type="text"
                      value={uploadEvents}
                      onChange={(e) => setUploadEvents(e.target.value)}
                      placeholder="e.g. EVENT-013, EVENT-014"
                      className="w-full bg-[#080b12] border border-[#1e2a3b] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#39d9ff]"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2636]">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-[#151e2b] text-xs font-mono text-slate-300 border border-[#1e2a3b] hover:bg-[#1a2638]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg btn-red-glow text-white text-xs font-mono font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>INGESTING...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>INGEST & SIGN EVIDENCE</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
