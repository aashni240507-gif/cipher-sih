export interface GraphNode {
  id: string;
  label: string;
  name: string;
  type: "suspect" | "person" | "phone" | "vehicle" | "location" | "org" | "case" | "financial";
  x: number;
  y: number;
  risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  details: string;
  centrality: string;
  cluster: number;
  status?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type?: "suspect" | "communication" | "financial" | "location" | "org" | "case" | "vehicle";
  isHighRisk?: boolean;
}

// Normalized initial dataset matching CIPHER investigation requirements
export const defaultNodes: GraphNode[] = [
  {
    id: "target-01",
    label: "TARGET-01",
    name: "Viktor R. (Syndicate Leader)",
    type: "suspect",
    x: 480,
    y: 260,
    risk: "CRITICAL",
    details: "Primary syndicate orchestrator. Connected to 14 financial flows and command hierarchy.",
    centrality: "0.94",
    cluster: 1,
    status: "Under Active Surveillance",
  },
  {
    id: "suspect-02",
    label: "SUSPECT-02",
    name: "Alexei M. (Logistics Enforcer)",
    type: "suspect",
    x: 330,
    y: 160,
    risk: "HIGH",
    details: "Logistics enforcer, oversees maritime freight transshipment and port security evasion.",
    centrality: "0.78",
    cluster: 1,
    status: "High Priority Intercept",
  },
  {
    id: "phone-001",
    label: "Phone +1",
    name: "+1 (555) 019-2834",
    type: "phone",
    x: 220,
    y: 90,
    risk: "HIGH",
    details: "Burner handset detected during 3 coordinated operations in port terminal zones.",
    centrality: "0.65",
    cluster: 1,
    status: "Cell Tower Monitored",
  },
  {
    id: "person-mark",
    label: "Mark V.",
    name: "Mark V. (Courier Associate)",
    type: "person",
    x: 650,
    y: 150,
    risk: "MEDIUM",
    details: "Courier driver, frequents southern transit corridors and secondary drop zones.",
    centrality: "0.52",
    cluster: 2,
    status: "Flagged Crossing",
  },
  {
    id: "person-elena",
    label: "Elena Rostova",
    name: "Elena Rostova (Legal Rep)",
    type: "person",
    x: 750,
    y: 290,
    risk: "MEDIUM",
    details: "Legal representative and authorized signatory for Aura Logistics and offshore accounts.",
    centrality: "0.61",
    cluster: 2,
    status: "Subpoena Issued",
  },
  {
    id: "org-aura",
    label: "Aura Logistics",
    name: "Aura Logistics Holding",
    type: "org",
    x: 250,
    y: 270,
    risk: "HIGH",
    details: "Registered shell freight enterprise in Limassol with multi-tier offshore holding structure.",
    centrality: "0.82",
    cluster: 2,
    status: "Asset Freeze Pending",
  },
  {
    id: "vehicle-suv",
    label: "Armored SUV",
    name: "Black Armored SUV (TX-89)",
    type: "vehicle",
    x: 580,
    y: 390,
    risk: "MEDIUM",
    details: "Leased reinforced vehicle tracked across 4 international border crossings in 60 days.",
    centrality: "0.56",
    cluster: 2,
    status: "GPS Beacon Active",
  },
  {
    id: "fin-vault",
    label: "Crypto Vault",
    name: "Crypto Vault 0x7F...44b",
    type: "financial",
    x: 270,
    y: 440,
    risk: "CRITICAL",
    details: "$640k USDT liquidity pool routed through sanctioned mixing protocol.",
    centrality: "0.89",
    cluster: 1,
    status: "OFAC Monitored",
  },
  {
    id: "loc-dock",
    label: "Dock Warehouse",
    name: "Dock Warehouse #4",
    type: "location",
    x: 130,
    y: 360,
    risk: "HIGH",
    details: "Covert maritime staging facility, perimeter security feed systematically bypassed.",
    centrality: "0.71",
    cluster: 3,
    status: "Physical Staking Active",
  },
  {
    id: "case-089",
    label: "Case #089",
    name: "Case #INV-2025-089",
    type: "case",
    x: 110,
    y: 170,
    risk: "LOW",
    details: "Prior port narcotics investigation in Rotterdam with identical vessel registry patterns.",
    centrality: "0.41",
    cluster: 3,
    status: "Archived Precedent",
  },
  {
    id: "phone-002",
    label: "Phone +2",
    name: "+1 (555) 843-9912",
    type: "phone",
    x: 800,
    y: 160,
    risk: "LOW",
    details: "Encrypted VoIP satellite line linked to Aura Logistics registration records.",
    centrality: "0.38",
    cluster: 2,
    status: "Intercept Signal Weak",
  },
];

export const defaultEdges: GraphEdge[] = [
  { id: "e1", source: "target-01", target: "suspect-02", label: "Direct Orders", type: "suspect", isHighRisk: true },
  { id: "e2", source: "target-01", target: "phone-001", label: "Frequent Contact", type: "communication", isHighRisk: true },
  { id: "e3", source: "target-01", target: "org-aura", label: "Corporate Secretary", type: "org", isHighRisk: true },
  { id: "e4", source: "target-01", target: "fin-vault", label: "Private Key Access", type: "financial", isHighRisk: true },
  { id: "e5", source: "target-01", target: "vehicle-suv", label: "Passenger / User", type: "vehicle", isHighRisk: false },
  { id: "e6", source: "target-01", target: "loc-dock", label: "Staging Location", type: "location", isHighRisk: true },
  { id: "e7", source: "suspect-02", target: "org-aura", label: "Ops Associate", type: "suspect", isHighRisk: false },
  { id: "e8", source: "suspect-02", target: "phone-001", label: "Carrier Device", type: "communication", isHighRisk: false },
  { id: "e9", source: "phone-001", target: "case-089", label: "Intercepted SMS", type: "case", isHighRisk: false },
  { id: "e10", source: "org-aura", target: "loc-dock", label: "Lease Contract", type: "org", isHighRisk: false },
  { id: "e11", source: "loc-dock", target: "fin-vault", label: "Hardware Wallet Found", type: "financial", isHighRisk: true },
  { id: "e12", source: "person-mark", target: "vehicle-suv", label: "Registered Driver", type: "vehicle", isHighRisk: false },
  { id: "e13", source: "person-mark", target: "target-01", label: "Courier Contact", type: "suspect", isHighRisk: false },
  { id: "e14", source: "vehicle-suv", target: "person-elena", label: "Co-Occupant", type: "vehicle", isHighRisk: false },
  { id: "e15", source: "person-elena", target: "org-aura", label: "Corporate Secretary", type: "org", isHighRisk: false },
  { id: "e16", source: "person-elena", target: "phone-002", label: "Subscriber", type: "communication", isHighRisk: false },
];
