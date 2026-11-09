import fs from "fs";
import path from "path";
import { CIPHER_ALERTS, InvestigationAlert } from "./ai/investigation-data";
import { recordAuditEvent } from "./user-service";

export interface AlertRecord {
  id: string;
  investigationId: string;
  title: string;
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "NEW" | "ACKNOWLEDGED" | "INVESTIGATING" | "RESOLVED";
  whyGenerated: string;
  evidence: string;
  confidence: string;
  relatedEntities: string[];
  timestamp: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const ALERTS_FILE = path.join(DATA_DIR, "alerts.json");

const SEED_ALERTS: AlertRecord[] = [
  // Delhi High Court Case (CASE-2025-004)
  {
    id: "ALT-SAHIL-001",
    investigationId: "CASE-2025-004",
    title: "Substantial Cheated Proceeds Credited to Sahil Khan Account (>₹5 Lakh)",
    category: "Unusual Transaction",
    severity: "CRITICAL",
    status: "NEW",
    whyGenerated:
      "Bank clearing records established immediate layer-1 credit of ₹5.18 Lakh into PNB account 4829100234 registered to Sahil Khan within 18 minutes of victim debit.",
    evidence: "Punjab National Bank Statement Acc #4829100234 & Core Banking Transaction Log",
    confidence: "99.8% Deterministic On-Record",
    relatedEntities: ["Sahil Khan (PERSON-001)", "Punjab National Bank Acc #4829100234", "Victim Account (SBI)"],
    timestamp: "2025-01-21T18:00:00Z",
  },
  {
    id: "ALT-SAHIL-002",
    investigationId: "CASE-2025-004",
    title: "ATM CCTV Footage Visual Identification at Cash Withdrawal Kiosks",
    category: "Evidence Correlation",
    severity: "CRITICAL",
    status: "INVESTIGATING",
    whyGenerated:
      "Digital video forensic analysis of Sector 8 Jaipur ATM camera feeds confirmed visual presence of suspect withdrawing cash during the precise debit timestamps.",
    evidence: "ATM Kiosk Security CCTV Cam #02 (Sector 8 Jaipur) & Forensic Facial Comparison Report",
    confidence: "94.6% Match Probability",
    relatedEntities: ["Sahil Khan (PERSON-001)", "ATM Sector 8 Jaipur", "EVD-CCTV-002"],
    timestamp: "2025-01-16T12:00:00Z",
  },
  {
    id: "ALT-SAHIL-003",
    investigationId: "CASE-2025-004",
    title: "Cell-ID Tower Telemetry Confirms Suspect Handset Concurrency in Jaipur & Alwar",
    category: "Sudden Location Change",
    severity: "HIGH",
    status: "NEW",
    whyGenerated:
      "Cell tower telemetry placed mobile number +91 98290 12345 (IMEI 354891002348910) concurrently at the withdrawal coordinates during liquidation window.",
    evidence: "Telecom Tower Dump Sector 8 Jaipur & Tower Intercept Sector 4 Alwar",
    confidence: "98.2% Tower Overlap",
    relatedEntities: ["+91 98290 12345", "Samsung SM-M315F (IMEI 354891002348910)", "Sahil Khan"],
    timestamp: "2025-01-25T14:00:00Z",
  },
  {
    id: "ALT-SAHIL-004",
    investigationId: "CASE-2025-004",
    title: "Account Linked to Multiple National Cybercrime Reporting Portal (NCRP) Incidents",
    category: "Cross-Case Connection",
    severity: "CRITICAL",
    status: "ACKNOWLEDGED",
    whyGenerated:
      "MHA NCRP inter-agency intelligence feed correlated suspect account #4829100234 with 4 separate phishing complaints filed in Haryana and Rajasthan.",
    evidence: "MHA NCRP Incident Notices #NCR-2025-8812, #NCR-2025-8941 & Inter-State Police Advisory",
    confidence: "100% NCRP National Portal Match",
    relatedEntities: ["Punjab National Bank Acc #4829100234", "Sahil Khan", "Interstate Mule Ring"],
    timestamp: "2025-01-23T16:00:00Z",
  },

  // Operation Nexus (INV-2026-0142)
  {
    id: "ALT-801",
    investigationId: "INV-2026-0142",
    title: "Bridge Entity Detected: Viktor R. (TARGET-01)",
    category: "High-Centrality Entity",
    severity: "CRITICAL",
    status: "NEW",
    whyGenerated:
      "Automated modularity analysis isolated Viktor R. as the singular operational bridge linking two previously unconnected trafficking syndicates in Rotterdam and Limassol.",
    evidence: "CDR_251 (27 inter-cluster calls) & SWIFT_WIRE_741 ($320k USDT transfer)",
    confidence: "94% Match Probability",
    relatedEntities: ["Viktor R. (TARGET-01)", "Alexei M. (TARGET-02)", "Elena Rostova"],
    timestamp: "2026-05-10T06:00:00Z",
  },
  {
    id: "ALT-802",
    investigationId: "INV-2026-0142",
    title: "Cross-Case Burner Handset Concurrency",
    category: "Unusual Communication Pattern",
    severity: "HIGH",
    status: "INVESTIGATING",
    whyGenerated:
      "Burner number +1 (555) 019-2834 surfaced concurrently across 3 separate active federal and customs investigations within 48 hours.",
    evidence: "Tower Intercept Dump Sector 4B & Interpol Alert Notice #892",
    confidence: "98% Telemetry Overlap",
    relatedEntities: ["+1 (555) 019-2834", "Courier Mark V."],
    timestamp: "2026-05-10T03:30:00Z",
  },
  {
    id: "ALT-803",
    investigationId: "INV-2026-0142",
    title: "Suspicious Rendezvous Pattern at Dock Warehouse #4",
    category: "Sudden Location Change",
    severity: "MEDIUM",
    status: "ACKNOWLEDGED",
    whyGenerated:
      "ANPR cameras recorded 3 distinct tracked vehicles converging at restricted maritime coordinates during an unscheduled facility blackout.",
    evidence: "ANPR Plate Reader TX-89 & Port Security Camera Log #12",
    confidence: "88% Correlation",
    relatedEntities: ["Black Armored SUV (TX-89)", "Volvo Truck (BX-99)"],
    timestamp: "2026-05-09T21:15:00Z",
  },
  {
    id: "ALT-804",
    investigationId: "INV-2026-0142",
    title: "High-Velocity Blockchain Smurfing Flow",
    category: "Unusual Transaction",
    severity: "CRITICAL",
    status: "NEW",
    whyGenerated:
      "A single $320,000 disbursement was automatically fragmented into 14 micro-wallets and converted through decentralized liquidity pools within 180 seconds.",
    evidence: "Etherscan Hash Digest 0x7F...44b & Subpoena MLAT",
    confidence: "100% On-Chain Verification",
    relatedEntities: ["Crypto Vault 0x7F...44b", "Aura Logistics Ltd"],
    timestamp: "2026-05-09T23:45:00Z",
  },
  {
    id: "ALT-805",
    investigationId: "INV-2026-0142",
    title: "Emerging Sub-Syndicate Community Formation",
    category: "Suspicious Clustering",
    severity: "HIGH",
    status: "RESOLVED",
    whyGenerated:
      "Louvain modularity algorithm detected a dense subgraph of 6 new encrypted telecommunication channels centered around Limassol maritime logistics.",
    evidence: "Adjacency Matrix Eigenvalue Peak (Q=0.74)",
    confidence: "91% Cluster Density",
    relatedEntities: ["Limassol Forwarding Agent", "PanGlobal Shipping"],
    timestamp: "2026-05-08T14:20:00Z",
  },
];

function ensureAlertsFile(): AlertRecord[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ALERTS_FILE)) {
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(SEED_ALERTS, null, 2), "utf-8");
    return SEED_ALERTS;
  }
  try {
    const raw = fs.readFileSync(ALERTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return SEED_ALERTS;
  }
}

function writeAlerts(alerts: AlertRecord[]): void {
  ensureAlertsFile();
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2), "utf-8");
}

export function getAlertsForCase(caseId?: string): AlertRecord[] {
  const alerts = ensureAlertsFile();
  if (!caseId) return alerts;

  const norm = caseId.toLowerCase().trim();
  return alerts.filter((a) => {
    const aNorm = a.investigationId.toLowerCase();
    if (aNorm === norm) return true;
    if (
      (norm.includes("2025-004") || norm.includes("sahil")) &&
      (aNorm.includes("2025-004") || aNorm.includes("sahil"))
    ) {
      return true;
    }
    if (norm.includes("2026-0142") && aNorm.includes("2026-0142")) {
      return true;
    }
    return false;
  });
}

export function getAlertById(id: string): AlertRecord | null {
  const alerts = ensureAlertsFile();
  return alerts.find((a) => a.id === id) || null;
}

export async function updateAlertStatus(
  id: string,
  newStatus: "NEW" | "ACKNOWLEDGED" | "INVESTIGATING" | "RESOLVED",
  user?: { id: string; name: string }
): Promise<{ success: boolean; alert?: AlertRecord; error?: string }> {
  const alerts = ensureAlertsFile();
  const idx = alerts.findIndex((a) => a.id === id);
  if (idx === -1) {
    return { success: false, error: `Alert ${id} not found.` };
  }

  const prev = alerts[idx];
  const updated: AlertRecord = {
    ...prev,
    status: newStatus,
    ...(newStatus === "ACKNOWLEDGED"
      ? { acknowledgedBy: user?.name || "Lead Analyst", acknowledgedAt: new Date().toISOString() }
      : {}),
    ...(newStatus === "RESOLVED"
      ? { resolvedBy: user?.name || "Lead Analyst", resolvedAt: new Date().toISOString() }
      : {}),
  };

  alerts[idx] = updated;
  writeAlerts(alerts);

  // Log Audit Event
  await recordAuditEvent({
    action: newStatus === "RESOLVED" ? "ALERT_RESOLVED" : "ALERT_ACKNOWLEDGED",
    userId: user?.id || "usr-0142-sharma",
    userName: user?.name || "Amit Sharma",
    field: "alert_status",
    previousValue: prev.status,
    newValue: newStatus,
    details: `Alert ${id} ('${prev.title}') transitioned to ${newStatus} in investigation ${prev.investigationId}`,
  });

  return { success: true, alert: updated };
}
