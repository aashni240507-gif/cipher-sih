import fs from "fs";
import path from "path";
import { syncInvestigationToNeo4j } from "./neo4j";

export interface InvestigationRecord {
  id: string;
  caseId: string;
  caseName?: string;
  title: string;
  firNumber?: string;
  policeStation?: string;
  crimeCategory?: string;
  crimeDate?: string;
  reportedLoss?: number;
  initialLoss?: number;
  currency?: string;
  currentStage?: string;
  source?: string;
  sourceUrl?: string;
  type: string;
  priority: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
  status: "ACTIVE" | "PENDING_REVIEW" | "MONITORED" | "ARCHIVED" | "CLOSED";
  leadInvestigator: string;
  startDate: string;
  jurisdiction: string;
  description: string;
  entitiesCount: number;
  relationshipsCount: number;
  evidenceCount: number;
  alertsCount: number;
  graphSyncStatus: "SYNCED" | "PENDING_SYNC" | "LOCAL_GRAPH" | "FAILED";
  investigationStatus?: string;
  aliases?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvestigationInput {
  title: string;
  caseId: string;
  type: string;
  priority: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
  leadInvestigator: string;
  startDate: string;
  jurisdiction: string;
  description: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "investigations.json");

const SEED_INVESTIGATIONS: InvestigationRecord[] = [
  {
    id: "inv-004-sahil-khan",
    caseId: "CASE-2025-004",
    caseName: "Sahil Khan v. State Govt. of NCT of Delhi",
    title: "State v. Sahil Khan (Cyber South-West FIR 4/2025)",
    firNumber: "4/2025",
    policeStation: "Cyber South-West Police Station, Delhi",
    jurisdiction: "Cyber South-West, Delhi / Interstate (Jaipur, Alwar, Bihar, Jharkhand, Mewat, MP)",
    crimeCategory: "Cyber Fraud / Financial Fraud",
    crimeDate: "2025-01-15",
    reportedLoss: 2600000,
    initialLoss: 1400000,
    currency: "INR",
    currentStage: "Investigation / Court Proceedings",
    source: "Delhi High Court order dated 14 January 2026",
    sourceUrl: "https://indiankanoon.org/doc/12999253/",
    type: "Interstate Cyber Fraud / Multi-Mule Syndicate",
    priority: "HIGH",
    status: "ACTIVE",
    leadInvestigator: "Inspector Cyber Crime Unit (South-West)",
    startDate: "2025-01-15",
    description:
      "Senior citizen Yahoo customer-care search fraud resulting in APK installation, debit card compromise, ₹14 lakh savings debit, and liquidated fixed deposits totaling ₹26 lakh financial loss. Siphoned funds routed through interstate mule network with ATM cash withdrawals in Jaipur/Bihar and multi-point investigative links connecting Sahil Khan.",
    entitiesCount: 22,
    relationshipsCount: 38,
    evidenceCount: 16,
    alertsCount: 3,
    graphSyncStatus: "LOCAL_GRAPH",
    investigationStatus: "Court Proceedings / Anticipatory Bail Dismissed",
    aliases: ["INV-2025-004", "CASE-2025-004", "inv-004-sahil-khan"],
    createdAt: "2025-01-16T10:00:00.000Z",
    updatedAt: "2026-01-14T17:30:00.000Z",
  },
  {
    id: "inv-001",
    caseId: "INV-2026-0142",
    title: "Operation Nexus",
    type: "Organized Narcotics & Cyber Transport",
    priority: "HIGH",
    status: "ACTIVE",
    leadInvestigator: "Amit Sharma (Lead Analyst L3)",
    startDate: "2026-05-10",
    jurisdiction: "Rotterdam Maritime Port / North America Corridor",
    description:
      "Investigation into coordinated illicit syndicate activities, shell enterprise fronts, burner telecommunication networks, and crypto liquidity movements.",
    entitiesCount: 27,
    relationshipsCount: 43,
    evidenceCount: 14,
    alertsCount: 4,
    graphSyncStatus: "LOCAL_GRAPH",
    createdAt: "2026-05-10T08:30:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-002",
    caseId: "CYB-2026-0481",
    title: "Operation Shadow Breach",
    type: "Cyber Intrusion / C2",
    priority: "HIGH",
    status: "ACTIVE",
    leadInvestigator: "Elena Vance (Cyber Forensics)",
    startDate: "2026-06-12",
    jurisdiction: "Rotterdam / Limassol",
    description:
      "Unauthorized exfiltration of cryptographic credentials and distributed command-and-control beaconing across Baltic nodes.",
    entitiesCount: 18,
    relationshipsCount: 31,
    evidenceCount: 9,
    alertsCount: 2,
    graphSyncStatus: "LOCAL_GRAPH",
    createdAt: "2026-06-12T10:15:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-003",
    caseId: "FIN-2026-0819",
    title: "Syndicate CashWash Ledger",
    type: "Money Laundering & Offshore Wire",
    priority: "MEDIUM",
    status: "ACTIVE",
    leadInvestigator: "Marcus Brody (Financial Intel)",
    startDate: "2026-07-01",
    jurisdiction: "Nicosia / Zurich / London",
    description:
      "Nested offshore shell entities, crypto mixers, and illicit asset obfuscation routing through European clearingbanks.",
    entitiesCount: 34,
    relationshipsCount: 68,
    evidenceCount: 21,
    alertsCount: 1,
    graphSyncStatus: "LOCAL_GRAPH",
    createdAt: "2026-07-01T14:20:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-004",
    caseId: "TRF-2026-0231",
    title: "Taskforce Border Shield",
    type: "Contraband & Port Smuggling",
    priority: "HIGH",
    status: "ACTIVE",
    leadInvestigator: "Sarah Chen (Special Agent)",
    startDate: "2026-07-15",
    jurisdiction: "Texas Corridor / Southern Ports",
    description:
      "Cross-border document forgery syndicate operating through fraudulent charter vehicle leasing networks.",
    entitiesCount: 22,
    relationshipsCount: 39,
    evidenceCount: 12,
    alertsCount: 1,
    graphSyncStatus: "LOCAL_GRAPH",
    createdAt: "2026-07-15T09:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-005",
    caseId: "INV-2025-089",
    title: "Operation Blue Horizon",
    type: "Maritime Precedence File",
    priority: "LOW",
    status: "MONITORED",
    leadInvestigator: "Unassigned / Archive",
    startDate: "2025-11-20",
    jurisdiction: "Rotterdam Docks / Western Shelf",
    description:
      "Rotterdam cargo precedence files correlated with current maritime bill-of-lading anomalies and port logistics manifests.",
    entitiesCount: 14,
    relationshipsCount: 19,
    evidenceCount: 6,
    alertsCount: 0,
    graphSyncStatus: "LOCAL_GRAPH",
    createdAt: "2025-11-20T11:45:00.000Z",
    updatedAt: new Date().toISOString(),
  },
];

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_INVESTIGATIONS, null, 2), "utf-8");
  }
}

export function readInvestigations(): InvestigationRecord[] {
  try {
    ensureDataFile();
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("[CIPHER DB] Error reading investigations file:", err);
    return SEED_INVESTIGATIONS;
  }
}

export function writeInvestigations(items: InvestigationRecord[]): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function getAllInvestigations(): Promise<InvestigationRecord[]> {
  return readInvestigations();
}

export async function getInvestigationById(idOrCaseId: string): Promise<InvestigationRecord | null> {
  const items = readInvestigations();
  const norm = idOrCaseId.toLowerCase().trim();
  const found = items.find(
    (i) =>
      i.id.toLowerCase() === norm ||
      i.caseId.toLowerCase() === norm ||
      i.aliases?.some((a) => a.toLowerCase() === norm) ||
      (i.caseId === "CASE-2025-004" && (norm === "inv-2025-004" || norm === "case-2025-004" || norm === "inv-004" || norm === "inv-004-sahil-khan"))
  );
  return found || null;
}

export async function createInvestigation(
  input: CreateInvestigationInput
): Promise<{ success: boolean; investigation?: InvestigationRecord; error?: string }> {
  // 1. Validation
  if (!input.title || !input.title.trim()) {
    return { success: false, error: "Investigation title is required." };
  }
  if (!input.caseId || !input.caseId.trim()) {
    return { success: false, error: "Case ID is required." };
  }
  if (!input.type || !input.type.trim()) {
    return { success: false, error: "Investigation type is required." };
  }
  if (!input.priority) {
    return { success: false, error: "Please select investigation priority." };
  }
  if (!input.leadInvestigator || !input.leadInvestigator.trim()) {
    return { success: false, error: "Please select a lead investigator." };
  }
  if (!input.startDate || !input.startDate.trim()) {
    return { success: false, error: "Start date is required." };
  }
  if (!input.jurisdiction || !input.jurisdiction.trim()) {
    return { success: false, error: "Primary jurisdictional location is required." };
  }
  if (!input.description || input.description.trim().length < 20) {
    return {
      success: false,
      error: "Operational description must contain at least 20 characters.",
    };
  }

  // 2. Check Uniqueness of Case ID
  const items = readInvestigations();
  const normalizedCaseId = input.caseId.trim().toUpperCase();
  const existing = items.find(
    (i) => i.caseId.trim().toUpperCase() === normalizedCaseId
  );

  if (existing) {
    return {
      success: false,
      error: `Case ID '${normalizedCaseId}' already exists. Please use a unique Case ID.`,
    };
  }

  // 3. Construct Record
  const newId = `inv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  // 4. Synchronize with Neo4j
  const neo4jResult = await syncInvestigationToNeo4j({
    id: newId,
    caseId: normalizedCaseId,
    title: input.title.trim(),
    type: input.type.trim(),
    priority: input.priority,
    status: "ACTIVE",
  });

  const record: InvestigationRecord = {
    id: newId,
    caseId: normalizedCaseId,
    title: input.title.trim(),
    type: input.type.trim(),
    priority: input.priority,
    status: "ACTIVE",
    leadInvestigator: input.leadInvestigator.trim(),
    startDate: input.startDate.trim(),
    jurisdiction: input.jurisdiction.trim(),
    description: input.description.trim(),
    entitiesCount: 0,
    relationshipsCount: 0,
    evidenceCount: 0,
    alertsCount: 0,
    graphSyncStatus: neo4jResult.status,
    createdAt: now,
    updatedAt: now,
  };

  // 5. Persist
  items.unshift(record);
  writeInvestigations(items);

  return { success: true, investigation: record };
}

export async function updateInvestigation(
  id: string,
  updates: Partial<InvestigationRecord>
): Promise<InvestigationRecord | null> {
  const items = readInvestigations();
  const index = items.findIndex((i) => i.id === id || i.caseId === id);
  if (index === -1) return null;

  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  writeInvestigations(items);
  return items[index];
}

export async function deleteInvestigation(id: string): Promise<boolean> {
  const items = readInvestigations();
  const filtered = items.filter((i) => i.id !== id && i.caseId !== id);
  if (filtered.length === items.length) return false;

  writeInvestigations(filtered);
  return true;
}
