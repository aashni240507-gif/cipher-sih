"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Laptop,
  DollarSign,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import NexusHeader from "@/components/NexusHeader";
import { useAuth } from "@/components/AuthProvider";

interface TemplateItem {
  id: string;
  name: string;
  icon: React.ElementType;
  defaultTitle: string;
  defaultId: string;
  defaultType: string;
  defaultPriority: "high" | "medium" | "low";
  defaultDesc: string;
  defaultInvestigator: string;
  defaultLocation: string;
}

const templates: TemplateItem[] = [
  {
    id: "organized",
    name: "Organized Crime",
    icon: Building2,
    defaultTitle: "Operation Nexus",
    defaultId: "INV-2026-0142",
    defaultType: "Organized Narcotics & Cyber Transport",
    defaultPriority: "high",
    defaultDesc:
      "Investigation into coordinated illicit syndicate activities, shell enterprise fronts, burner telecommunication networks, and crypto liquidity movements.",
    defaultInvestigator: "Amit Sharma (Lead Analyst L3)",
    defaultLocation: "Rotterdam Maritime Port / North America Corridor",
  },
  {
    id: "cyber",
    name: "Cyber Crime",
    icon: Laptop,
    defaultTitle: "Operation Shadow Breach",
    defaultId: "CYB-2026-0481",
    defaultType: "Cyber Intrusion / C2",
    defaultPriority: "high",
    defaultDesc:
      "Unauthorized exfiltration of cryptographic credentials and distributed command-and-control beaconing across Baltic nodes.",
    defaultInvestigator: "Elena Vance (Cyber Forensics)",
    defaultLocation: "Rotterdam / Limassol",
  },
  {
    id: "financial",
    name: "Financial Fraud",
    icon: DollarSign,
    defaultTitle: "Syndicate CashWash Ledger",
    defaultId: "FIN-2026-0819",
    defaultType: "Money Laundering & Offshore Wire",
    defaultPriority: "high",
    defaultDesc:
      "Nested offshore shell entities, crypto mixers, and illicit asset obfuscation routing through European clearingbanks.",
    defaultInvestigator: "Marcus Brody (Financial Intel)",
    defaultLocation: "Nicosia / Zurich / London",
  },
];

export default function CreateNewInvestigationPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const { user } = useAuth();

  // Step 1: Basic Details
  const [title, setTitle] = useState("Operation Nexus");
  const [caseId, setCaseId] = useState("INV-2026-0142");
  const [invType, setInvType] = useState("Organized Narcotics & Cyber Transport");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("high");
  const [description, setDescription] = useState(
    "Investigation into coordinated illicit syndicate activities, shell enterprise fronts, burner telecommunication networks, and crypto liquidity movements."
  );
  const [investigator, setInvestigator] = useState(
    user?.name ? `${user.name} (Lead Analyst L3)` : "Amit Sharma (Lead Analyst L3)"
  );

  useEffect(() => {
    if (user?.name && investigator === "Amit Sharma (Lead Analyst L3)") {
      setInvestigator(`${user.name} (Lead Analyst L3)`);
    }
  }, [user]);

  const [startDate, setStartDate] = useState("2026-05-10");
  const [location, setLocation] = useState("Rotterdam Maritime Port / North America Corridor");

  // Form Validation & Submission State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // Created Investigation Object & ID preservation across wizard steps
  const [createdInvestigation, setCreatedInvestigation] = useState<any>(null);

  // Step 2: Data Sources
  const [dataSources, setDataSources] = useState({
    fir: true,
    cdr: true,
    financial: true,
    surveillance: false,
    criminalHistory: true,
    socialMedia: false,
    intelReports: true,
  });

  const applyTemplate = (t: TemplateItem) => {
    setTitle(t.defaultTitle);
    setCaseId(t.defaultId);
    setInvType(t.defaultType);
    setPriority(t.defaultPriority);
    setDescription(t.defaultDesc);
    setInvestigator(t.defaultInvestigator);
    setLocation(t.defaultLocation);
    setFieldErrors({});
    setApiError(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Investigation title is required.";
    }
    if (!caseId.trim()) {
      errors.caseId = "Case ID is required.";
    }
    if (!invType.trim()) {
      errors.invType = "Investigation type is required.";
    }
    if (!priority) {
      errors.priority = "Please select investigation priority.";
    }
    if (!investigator.trim()) {
      errors.investigator = "Please select a lead investigator.";
    }
    if (!startDate.trim()) {
      errors.startDate = "Start date is required.";
    }
    if (!location.trim()) {
      errors.location = "Primary jurisdictional location is required.";
    }
    if (!description.trim()) {
      errors.description = "Operational description is required.";
    } else if (description.trim().length < 20) {
      errors.description = "Description must contain at least 20 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateInvestigation = async () => {
    setApiError(null);
    setSuccessNotification(null);

    // Validate fields
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        caseId: caseId.trim(),
        type: invType.trim(),
        priority: priority.toUpperCase(),
        leadInvestigator: investigator.trim(),
        startDate: startDate.trim(),
        jurisdiction: location.trim(),
        description: description.trim(),
      };

      const res = await fetch("/api/investigations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 409) {
          setApiError(data.error || "Case ID already exists. Please use a unique Case ID.");
          setFieldErrors((prev) => ({ ...prev, caseId: "Case ID already exists." }));
        } else {
          setApiError(data.error || "Unable to connect to CIPHER intelligence services.");
        }
        setIsSubmitting(false);
        return;
      }

      // Success: store created record
      setCreatedInvestigation(data.investigation);
      setSuccessNotification("Investigation created successfully.");
      setIsSubmitting(false);

      // Automatically advance to Step 2: Add Data Sources
      setStep(2);
    } catch (err: any) {
      console.error("Investigation creation error:", err);
      setApiError("Unable to connect to CIPHER intelligence services.");
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      handleCreateInvestigation();
    } else if (step === 2) {
      setStep(3);
    } else {
      // Step 3 finished: navigate to the created investigation workspace
      const targetId = createdInvestigation?.id || createdInvestigation?.caseId || caseId;
      router.push(`/investigations/workspace?id=${encodeURIComponent(targetId)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f5f7fa] flex flex-col selection:bg-red-600 selection:text-white">
      <NexusHeader moduleTitle="NEW INVESTIGATION" badge="WIZARD" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Success / Error Notification Banners */}
        {successNotification && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between gap-3 text-emerald-300 text-xs font-mono shadow-lg">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                {successNotification} Case Record Registered in CIPHER Database (ID:{" "}
                <span className="font-bold text-white">{createdInvestigation?.caseId || caseId}</span>).
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessNotification(null)}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        {apiError && (
          <div className="p-4 rounded-xl bg-red-950/70 border border-red-500/50 flex items-center gap-3 text-red-300 text-xs font-mono shadow-lg">
            <AlertCircle className="w-5 h-5 text-[#ff3b30] shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="w-full bg-[#101722] border border-[#1e2a3b] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header & Stepper */}
          <header className="px-6 sm:px-8 pt-8 pb-4 border-b border-[#162233]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase font-sans">
                INITIATE NEW <span className="text-[#ff3b30]">INVESTIGATION</span>
              </h1>
              {createdInvestigation && (
                <span className="text-xs font-mono text-[#39d9ff] bg-[#091120] border border-[#1b2b46] px-2.5 py-1 rounded">
                  CASE REGISTERED: {createdInvestigation.caseId}
                </span>
              )}
            </div>

            {/* Stepper Navigation */}
            <nav aria-label="Progress" className="mt-6 mb-2">
              <ol className="flex items-center gap-4 sm:gap-8 text-xs sm:text-sm font-mono font-medium">
                {/* Step 1 */}
                <li
                  onClick={() => setStep(1)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <span
                    className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs sm:text-sm transition-all ${
                      step >= 1
                        ? "border-2 border-[#ff3b30] text-[#ff3b30] stepper-glow bg-red-950/40"
                        : "border border-slate-700 text-slate-400 bg-slate-900/50"
                    }`}
                  >
                    1
                  </span>
                  <span className={step === 1 ? "text-white font-bold" : "text-slate-400"}>
                    BASIC DETAILS
                  </span>
                </li>

                <li className="text-slate-600 select-none">→</li>

                {/* Step 2 */}
                <li
                  onClick={() => {
                    if (createdInvestigation) setStep(2);
                  }}
                  className={`flex items-center gap-3 ${createdInvestigation ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                >
                  <span
                    className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs sm:text-sm transition-all ${
                      step >= 2
                        ? "border-2 border-[#ff3b30] text-[#ff3b30] stepper-glow bg-red-950/40"
                        : "border border-slate-700 text-slate-400 bg-slate-900/50"
                    }`}
                  >
                    2
                  </span>
                  <span className={step === 2 ? "text-white font-bold" : "text-slate-400"}>
                    ADD DATA SOURCES
                  </span>
                </li>

                <li className="text-slate-600 select-none">→</li>

                {/* Step 3 */}
                <li
                  onClick={() => {
                    if (createdInvestigation) setStep(3);
                  }}
                  className={`flex items-center gap-3 ${createdInvestigation ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                >
                  <span
                    className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs sm:text-sm transition-all ${
                      step === 3
                        ? "border-2 border-[#ff3b30] text-[#ff3b30] stepper-glow bg-red-950/40"
                        : "border border-slate-700 text-slate-400 bg-slate-900/50"
                    }`}
                  >
                    3
                  </span>
                  <span className={step === 3 ? "text-white font-bold" : "text-slate-400"}>
                    REVIEW &amp; CREATE
                  </span>
                </li>
              </ol>
            </nav>
          </header>

          {/* STEP 1: Basic Details */}
          {step === 1 && (
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Form Area */}
              <section className="lg:col-span-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Investigation Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-300 uppercase">
                      Investigation Title <span className="text-[#ff3b30]">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: "" }));
                      }}
                      placeholder="e.g. Operation Test Alpha"
                      className={`w-full bg-[#080b12] border text-white rounded-lg px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition-colors ${
                        fieldErrors.title ? "border-[#ff3b30] bg-red-950/20" : "border-[#1e2a3b] focus:border-[#39d9ff]"
                      }`}
                    />
                    {fieldErrors.title && (
                      <p className="text-[11px] font-mono text-[#ff3b30]">{fieldErrors.title}</p>
                    )}
                  </div>

                  {/* Case ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-300 uppercase">
                      Case ID <span className="text-[#ff3b30]">*</span>
                    </label>
                    <input
                      type="text"
                      value={caseId}
                      onChange={(e) => {
                        setCaseId(e.target.value);
                        if (fieldErrors.caseId) setFieldErrors((p) => ({ ...p, caseId: "" }));
                      }}
                      placeholder="e.g. INV-TEST-001"
                      className={`w-full bg-[#080b12] border text-white rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:outline-none transition-colors ${
                        fieldErrors.caseId ? "border-[#ff3b30] bg-red-950/20" : "border-[#1e2a3b] focus:border-[#39d9ff]"
                      }`}
                    />
                    {fieldErrors.caseId && (
                      <p className="text-[11px] font-mono text-[#ff3b30]">{fieldErrors.caseId}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Investigation Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-300 uppercase">
                      Investigation Type <span className="text-[#ff3b30]">*</span>
                    </label>
                    <input
                      type="text"
                      value={invType}
                      onChange={(e) => {
                        setInvType(e.target.value);
                        if (fieldErrors.invType) setFieldErrors((p) => ({ ...p, invType: "" }));
                      }}
                      placeholder="e.g. Organized Crime"
                      className={`w-full bg-[#080b12] border text-white rounded-lg px-3.5 py-2.5 text-xs focus:outline-none transition-colors ${
                        fieldErrors.invType ? "border-[#ff3b30] bg-red-950/20" : "border-[#1e2a3b] focus:border-[#39d9ff]"
                      }`}
                    />
                    {fieldErrors.invType && (
                      <p className="text-[11px] font-mono text-[#ff3b30]">{fieldErrors.invType}</p>
                    )}
                  </div>

                  {/* Priority Level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-300 uppercase">
                      Priority Status <span className="text-[#ff3b30]">*</span>
                    </label>
                    <div className="flex items-center gap-2 pt-0.5">
                      {(["low", "medium", "high"] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => {
                            setPriority(lvl);
                            if (fieldErrors.priority) setFieldErrors((p) => ({ ...p, priority: "" }));
                          }}
                          className={`flex-1 py-2 rounded-lg text-xs font-mono font-semibold uppercase border transition-all ${
                            priority === lvl
                              ? lvl === "high"
                                ? "bg-red-950 text-red-300 border-[#ff3b30]"
                                : lvl === "medium"
                                ? "bg-amber-950 text-amber-300 border-amber-500"
                                : "bg-sky-950 text-sky-300 border-sky-500"
                              : "bg-[#080b12] text-slate-500 border-[#1e2a3b]"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                    {fieldErrors.priority && (
                      <p className="text-[11px] font-mono text-[#ff3b30]">{fieldErrors.priority}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Assigned Investigator */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-300 uppercase">
                      Assigned Lead Investigator <span className="text-[#ff3b30]">*</span>
                    </label>
                    <input
                      type="text"
                      value={investigator}
                      onChange={(e) => {
                        setInvestigator(e.target.value);
                        if (fieldErrors.investigator) setFieldErrors((p) => ({ ...p, investigator: "" }));
                      }}
                      placeholder="e.g. Amit Sharma (Lead Analyst L3)"
                      className={`w-full bg-[#080b12] border text-white rounded-lg px-3.5 py-2.5 text-xs focus:outline-none transition-colors ${
                        fieldErrors.investigator ? "border-[#ff3b30] bg-red-950/20" : "border-[#1e2a3b] focus:border-[#39d9ff]"
                      }`}
                    />
                    {fieldErrors.investigator && (
                      <p className="text-[11px] font-mono text-[#ff3b30]">{fieldErrors.investigator}</p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-300 uppercase">
                      Start Date <span className="text-[#ff3b30]">*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (fieldErrors.startDate) setFieldErrors((p) => ({ ...p, startDate: "" }));
                      }}
                      className={`w-full bg-[#080b12] border text-white rounded-lg px-3.5 py-2.5 text-xs font-mono focus:outline-none transition-colors ${
                        fieldErrors.startDate ? "border-[#ff3b30] bg-red-950/20" : "border-[#1e2a3b] focus:border-[#39d9ff]"
                      }`}
                    />
                    {fieldErrors.startDate && (
                      <p className="text-[11px] font-mono text-[#ff3b30]">{fieldErrors.startDate}</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold font-mono text-slate-300 uppercase">
                    Primary Jurisdictional Location <span className="text-[#ff3b30]">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (fieldErrors.location) setFieldErrors((p) => ({ ...p, location: "" }));
                    }}
                    placeholder="e.g. Rotterdam Maritime Port / North America Corridor"
                    className={`w-full bg-[#080b12] border text-white rounded-lg px-3.5 py-2.5 text-xs focus:outline-none transition-colors ${
                      fieldErrors.location ? "border-[#ff3b30] bg-red-950/20" : "border-[#1e2a3b] focus:border-[#39d9ff]"
                    }`}
                  />
                  {fieldErrors.location && (
                    <p className="text-[11px] font-mono text-[#ff3b30]">{fieldErrors.location}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold font-mono text-slate-300 uppercase">
                    Operational Description <span className="text-[#ff3b30]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (fieldErrors.description) setFieldErrors((p) => ({ ...p, description: "" }));
                    }}
                    placeholder="Provide operational background and primary investigative focus (min 20 characters)..."
                    className={`w-full bg-[#080b12] border text-white rounded-lg p-3 text-xs leading-relaxed focus:outline-none resize-none transition-colors ${
                      fieldErrors.description ? "border-[#ff3b30] bg-red-950/20" : "border-[#1e2a3b] focus:border-[#39d9ff]"
                    }`}
                  />
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    {fieldErrors.description ? (
                      <span className="text-[#ff3b30]">{fieldErrors.description}</span>
                    ) : (
                      <span>Minimum 20 characters required</span>
                    )}
                    <span>{description.length} / 500</span>
                  </div>
                </div>
              </section>

              {/* Right: Quick Templates */}
              <aside className="lg:col-span-4 bg-[#080b12] border border-[#1e2a3b] rounded-xl p-5 space-y-3">
                <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider block">
                  Quick Intelligence Templates
                </span>
                <p className="text-[11px] text-slate-400">
                  Select a template to automatically populate standard case classifications and intelligence metadata:
                </p>

                <div className="space-y-2 pt-2">
                  {templates.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => applyTemplate(t)}
                        className="w-full p-3 rounded-lg bg-[#101722] hover:bg-[#151e2b] border border-[#1e2a3b] hover:border-[#ff3b30] flex items-center gap-3 text-left transition-all group"
                      >
                        <div className="w-8 h-8 rounded-md bg-[#162233] flex items-center justify-center text-[#39d9ff] group-hover:text-[#ff3b30] shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block group-hover:text-[#ff3b30]">
                            {t.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 block truncate max-w-[170px]">
                            {t.defaultId}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </aside>
            </div>
          )}

          {/* STEP 2: Add Data Sources */}
          {step === 2 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-base font-bold text-white uppercase font-sans">
                  Select Associated Intelligence Data Sources
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose which telecommunications, banking, or surveillance feeds to attach to this dossier.
                </p>
              </div>

              {/* Checkboxes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  { key: "fir", name: "FIR / Police Incident Reports", sub: "Incident declarations & complaints" },
                  { key: "cdr", name: "Call Detail Records (CDR)", sub: "Towers, IMSI/IMEI, call logs" },
                  { key: "financial", name: "Financial Transactions", sub: "SWIFT, crypto ledgers, wires" },
                  { key: "surveillance", name: "Surveillance Reports", sub: "Field photos, vehicle tailing" },
                  { key: "criminalHistory", name: "Criminal History Database", sub: "Prior records & biometrics" },
                  { key: "socialMedia", name: "Social Media Intelligence", sub: "Open source threat chatter" },
                  { key: "intelReports", name: "Intelligence Reports", sub: "Interpol & agency memos" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="p-4 rounded-xl bg-[#080b12] border border-[#1e2a3b] flex items-start gap-3 cursor-pointer hover:border-[#39d9ff] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={dataSources[item.key as keyof typeof dataSources]}
                      onChange={(e) =>
                        setDataSources({ ...dataSources, [item.key]: e.target.checked })
                      }
                      className="mt-1 w-4 h-4 rounded bg-[#101722] border-[#1e2a3b] text-[#ff3b30] focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">{item.name}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{item.sub}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Upload Files CTA */}
              <div className="p-6 rounded-xl bg-[#080b12] border border-dashed border-[#1e2a3b] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Upload Raw Data Files</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Attached: 3 data archives (PDF, CSV telecom dumps)
                  </p>
                </div>
                <Link
                  href="/investigations/data-sources"
                  className="px-4 py-2 rounded-lg bg-[#151e2b] hover:bg-[#1a2638] text-xs font-mono font-semibold text-[#39d9ff] border border-[#1e2a3b] flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>[ UPLOAD FILES ]</span>
                </Link>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Create */}
          {step === 3 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-base font-bold text-white uppercase font-sans">
                  Review Investigation Dossier Setup
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Verify dossier configuration before initializing automated relationship extraction.
                </p>
              </div>

              <div className="bg-[#080b12] border border-[#1e2a3b] rounded-xl p-6 space-y-5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#162233] pb-3">
                  <span className="font-mono text-slate-500 uppercase">Case Identifier</span>
                  <span className="font-mono font-bold text-[#ff3b30] text-sm">
                    {createdInvestigation?.caseId || caseId}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block uppercase font-mono text-[10px]">Title</span>
                    <span className="text-white font-bold text-sm">
                      {createdInvestigation?.title || title}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-mono text-[10px]">Priority</span>
                    <span className="text-[#ff3b30] font-bold uppercase font-mono">
                      {createdInvestigation?.priority || priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-mono text-[10px]">Type</span>
                    <span className="text-slate-200">{createdInvestigation?.type || invType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-mono text-[10px]">Investigator</span>
                    <span className="text-slate-200">
                      {createdInvestigation?.leadInvestigator || investigator}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-mono text-[10px]">Start Date</span>
                    <span className="text-slate-200 font-mono">
                      {createdInvestigation?.startDate || startDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-mono text-[10px]">Location</span>
                    <span className="text-slate-200">
                      {createdInvestigation?.jurisdiction || location}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#162233]">
                  <span className="text-slate-500 block uppercase font-mono text-[10px] mb-1">
                    Operational Scope
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-[#101722] p-3 rounded-lg border border-[#1e2a3b]">
                    {createdInvestigation?.description || description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs pt-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Database record verified. Graph status: {createdInvestigation?.graphSyncStatus || "LOCAL_GRAPH"}.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <footer className="px-6 sm:px-8 py-5 border-t border-[#162233] bg-[#0b1018] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                className="px-5 py-2.5 rounded-lg bg-[#101722] hover:bg-[#151e2b] border border-[#1e2a3b] text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <Link
                href="/investigations"
                className="px-5 py-2.5 rounded-lg bg-[#101722] hover:bg-[#151e2b] border border-[#1e2a3b] text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </Link>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleNext}
              className={`px-6 py-2.5 rounded-lg btn-red-glow text-white font-semibold text-xs tracking-wider uppercase font-mono flex items-center gap-2 transition-all ${
                isSubmitting ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Investigation...</span>
                </>
              ) : step === 3 ? (
                <>
                  <span>[ OPEN INVESTIGATION WORKSPACE ]</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>NEXT STEP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
}
