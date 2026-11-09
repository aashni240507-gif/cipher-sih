import { NextRequest, NextResponse } from "next/server";
import {
  getInvestigationGraph,
  addInvestigatorClue,
} from "@/lib/investigation-graph-service";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const graphData = await getInvestigationGraph(id);
    const clues = graphData.nodes.filter(
      (n: any) => n.isAnalystClue || n.id.startsWith("clue-")
    );

    return NextResponse.json({
      success: true,
      investigationId: graphData.investigationId,
      caseId: graphData.caseId,
      count: clues.length,
      clues,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve clues." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));

    const result = await addInvestigatorClue(id, body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      clueNode: result.clueNode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create clue." },
      { status: 500 }
    );
  }
}
