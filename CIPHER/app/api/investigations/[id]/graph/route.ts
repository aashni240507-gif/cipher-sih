import { NextRequest, NextResponse } from "next/server";
import { getInvestigationGraph } from "@/lib/investigation-graph-service";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const graphData = await getInvestigationGraph(id);

    return NextResponse.json({
      success: true,
      investigationId: graphData.investigationId,
      caseId: graphData.caseId,
      title: graphData.title,
      nodesCount: graphData.nodes.length,
      edgesCount: graphData.edges.length,
      nodes: graphData.nodes,
      edges: graphData.edges,
      lastUpdated: graphData.lastUpdated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error retrieving investigation graph." },
      { status: 500 }
    );
  }
}
