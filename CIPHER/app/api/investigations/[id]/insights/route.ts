import { NextRequest, NextResponse } from "next/server";
import { getInvestigationById } from "@/lib/investigation-service";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const item = await getInvestigationById(id);

    if (!item) {
      return NextResponse.json(
        { success: false, error: `Investigation '${id}' not found.` },
        { status: 404 }
      );
    }

    const insights = [
      {
        id: "ins-01",
        title: "High-Centrality Bridge Entity Detected",
        type: "Topology Anomaly",
        confidence: "94% Confidence",
        summary:
          "TARGET-01 exhibits a betweenness centrality score of 0.94, functioning as the sole communication link between the port logistics cluster and Limassol offshore corporate holdings.",
        suggestedAction: "Initiate targeted communications intercept subpoena.",
      },
      {
        id: "ins-02",
        title: "Cross-Case Precedent Match (INV-2025-089)",
        type: "Entity Concurrency",
        confidence: "89% Confidence",
        summary:
          "Aura Logistics registration records match corporate shell filings previously identified in Rotterdam narcotics investigation INV-2025-089.",
        suggestedAction: "Correlate historical shipping manifests.",
      },
      {
        id: "ins-03",
        title: "Dispersed Crypto Smurfing Pattern",
        type: "Financial Pattern",
        confidence: "96% Confidence",
        summary:
          "Transfer of $320,000 USDT was divided into 4 sub-transactions under $100,000 before reaching the decentralized mixer contract.",
        suggestedAction: "Submit blockchain freeze request to compliance units.",
      },
    ];

    return NextResponse.json({
      success: true,
      investigationId: item.id,
      caseId: item.caseId,
      insightsCount: insights.length,
      insights,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error retrieving investigation insights." },
      { status: 500 }
    );
  }
}
