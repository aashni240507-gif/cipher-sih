/**
 * CIPHER Authoritative Data Seeding Script
 * Seeds users, investigations, evidence exhibits, alerts, timeline events,
 * data sources, reports, and graph structures across multiple investigations.
 */

const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log("==================================================");
console.log("CIPHER INTELLIGENCE PLATFORM — DATABASE SEEDING");
console.log("==================================================");

// 1. Seed Users
const usersFile = path.join(dataDir, "users.json");
const users = [
  {
    id: "usr-0142-sharma",
    email: "analyst.sharma@cipher.intel",
    name: "Amit Sharma",
    badgeNumber: "CPH-8921-ND",
    clearanceLevel: "LEVEL 3 - STRICT CLASSIFIED",
    role: "INVESTIGATOR",
    agencyDivision: "Special Operations Cyber Analysis Division",
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr-0143-vance",
    email: "analyst.vance@cipher.intel",
    name: "Elena Vance",
    badgeNumber: "CPH-4412-CY",
    clearanceLevel: "LEVEL 4 - TOP SECRET",
    role: "ADMIN",
    agencyDivision: "Transnational Cyber & Telecom Forensics",
    createdAt: "2026-01-12T09:30:00.000Z",
    updatedAt: new Date().toISOString(),
  },
];
fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf-8");
console.log(`[SEED] Users: ${users.length} seeded -> ${usersFile}`);

// 2. Clear dynamic caches to trigger pristine seed population on next read
const clearFiles = [
  "investigations.json",
  "alerts.json",
  "data-sources.json",
  "evidence.json",
  "reports.json",
  "graph-store.json",
];

for (const f of clearFiles) {
  const p = path.join(dataDir, f);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
  }
}
console.log("[SEED] Reset dynamic json stores to trigger auto-population of initial models.");

console.log("==================================================");
console.log("ACTIVE GROUNDED DOSSIERS INITIALIZED:");
console.log("  1. CASE-2025-004: Sahil Khan v. State (Delhi High Court Bail Appl 3788/2025)");
console.log("  2. INV-2026-0142: Operation Nexus (Maritime Port Logistics & Burner Telephony)");
console.log("  3. CYB-2026-0481: Operation Shadow Breach (Baltic C2 Intrusion)");
console.log("  4. FIN-2026-0819: Syndicate CashWash Ledger (Cross-Border Smurfing)");
console.log("==================================================");
console.log("DATABASE SEEDING COMPLETE.");
