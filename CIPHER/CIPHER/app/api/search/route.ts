import { NextRequest, NextResponse } from "next/server";
import { readInvestigations } from "@/lib/investigation-service";
import { CIPHER_ENTITIES, CIPHER_EVIDENCE, CIPHER_TRANSACTIONS, CIPHER_COMMUNICATIONS, CIPHER_TIMELINE } from "@/lib/ai/investigation-data";
import { getAlertsForCase } from "@/lib/alert-service";
import { readAllEvidence } from "@/lib/evidence-service";

export interface GlobalSearchResult {
  id: string;
  name: string;
  type: string;
  category: "people" | "phones" | "vehicles" | "locations" | "cases" | "transactions" | "evidence" | "alerts";
  relatedCases: string[];
  connectionsCount: number;
  relevance: string;
  source: string;
  timestamp?: string;
  targetUrl: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").toLowerCase().trim();
    const categoryFilter = searchParams.get("category") || "ALL";

    const results: GlobalSearchResult[] = [];

    // 1. Investigations
    const investigations = readInvestigations();
    for (const inv of investigations) {
      const matches =
        !q ||
        (inv.title || "").toLowerCase().includes(q) ||
        (inv.caseId || "").toLowerCase().includes(q) ||
        (inv.description || "").toLowerCase().includes(q) ||
        (inv.jurisdiction || "").toLowerCase().includes(q);

      if (matches) {
        results.push({
          id: inv.caseId,
          name: inv.title,
          type: `Investigation Dossier (${inv.type || "Active Case"})`,
          category: "cases",
          relatedCases: [inv.caseId],
          connectionsCount: inv.entitiesCount || 18,
          relevance: "100% Primary Dossier",
          source: inv.jurisdiction || "Jurisdictional Command",
          timestamp: inv.startDate,
          targetUrl: `/investigations?caseId=${inv.caseId}`,
        });
      }
    }

    // 2. Entities (from knowledge base)
    for (const ent of CIPHER_ENTITIES) {
      const matches =
        !q ||
        (ent.name || "").toLowerCase().includes(q) ||
        (ent.id || "").toLowerCase().includes(q) ||
        (ent.label || "").toLowerCase().includes(q) ||
        (ent.aliases || []).some((a) => (a || "").toLowerCase().includes(q)) ||
        (ent.details || "").toLowerCase().includes(q);

      if (matches) {
        let cat: GlobalSearchResult["category"] = "people";
        if (ent.type === "PHONE") cat = "phones";
        else if (ent.type === "VEHICLE") cat = "vehicles";
        else if (ent.type === "LOCATION") cat = "locations";

        results.push({
          id: ent.id,
          name: ent.name,
          type: `${ent.type} (${ent.role || "Target Record"})`,
          category: cat,
          relatedCases: ent.investigations || ["CASE-2025-004"],
          connectionsCount: ent.directConnections?.length || 4,
          relevance: "98.5% Forensic Match",
          source: (ent.details || "").slice(0, 48) + "...",
          targetUrl: `/entities?search=${encodeURIComponent(ent.name)}`,
        });
      }
    }

    // 3. Evidence Vault Items
    const allEvidence = readAllEvidence();
    for (const ev of allEvidence) {
      const matches =
        !q ||
        (ev.title || "").toLowerCase().includes(q) ||
        (ev.id || "").toLowerCase().includes(q) ||
        (ev.summary || "").toLowerCase().includes(q) ||
        (ev.source || "").toLowerCase().includes(q) ||
        (ev.hash && (ev.hash || "").toLowerCase().includes(q));

      if (matches) {
        results.push({
          id: ev.id,
          name: ev.title,
          type: `Forensic Evidence (${ev.type || "Exh"})`,
          category: "evidence",
          relatedCases: [ev.caseId],
          connectionsCount: ev.relatedEntities?.length || 2,
          relevance: "97.2% Evidentiary Correlation",
          source: ev.source || "Digital Vault",
          timestamp: ev.date,
          targetUrl: `/evidence?id=${ev.id}`,
        });
      }
    }

    // 4. Alerts
    const alerts = getAlertsForCase();
    for (const alt of alerts) {
      const matches =
        !q ||
        (alt.title || "").toLowerCase().includes(q) ||
        (alt.id || "").toLowerCase().includes(q) ||
        (alt.whyGenerated || "").toLowerCase().includes(q) ||
        (alt.relatedEntities || []).some((e) => (e || "").toLowerCase().includes(q));

      if (matches) {
        results.push({
          id: alt.id,
          name: alt.title,
          type: `Investigative Alert (${alt.severity || "Anomaly"})`,
          category: "alerts",
          relatedCases: [alt.investigationId],
          connectionsCount: (alt.relatedEntities || []).length,
          relevance: alt.confidence || "95.0% Threat Correlation",
          source: alt.evidence || "Automated Anomaly Detector",
          timestamp: alt.timestamp,
          targetUrl: `/alerts?id=${alt.id}`,
        });
      }
    }

    // 5. Financial Transactions
    for (const tx of CIPHER_TRANSACTIONS) {
      const matches =
        !q ||
        (tx.id || "").toLowerCase().includes(q) ||
        (tx.sender || "").toLowerCase().includes(q) ||
        (tx.recipient || "").toLowerCase().includes(q) ||
        (tx.flag || "").toLowerCase().includes(q);

      if (matches) {
        results.push({
          id: tx.id,
          name: `${tx.currency} ${tx.amount.toLocaleString()} (${tx.sender} → ${tx.recipient})`,
          type: `Transaction Flow (${tx.channel || "Banking"})`,
          category: "transactions",
          relatedCases: [tx.investigationId],
          connectionsCount: 2,
          relevance: "100% On-Record Ledger",
          source: tx.flag || "Suspicious Financial Transfer",
          timestamp: tx.timestamp,
          targetUrl: `/timeline?highlight=${tx.id}`,
        });
      }
    }

    // Apply category filtering
    const filtered =
      categoryFilter === "ALL"
        ? results
        : results.filter((r) => r.category === categoryFilter);

    return NextResponse.json({
      success: true,
      query: q,
      totalMatches: filtered.length,
      results: filtered.slice(0, 40),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Search failed" },
      { status: 500 }
    );
  }
}
