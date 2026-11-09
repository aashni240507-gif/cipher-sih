import { NextRequest, NextResponse } from "next/server";
import { connectInvestigatorClue } from "@/lib/investigation-graph-service";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; clueId: string }> }
) {
  try {
    const { id, clueId } = await context.params;
    const body = await req.json().catch(() => ({}));

    const targetId = body.targetId;
    const relationshipType = body.relationshipType || "Potential Connection";
    const notes = body.notes;

    if (!targetId) {
      return NextResponse.json(
        { success: false, error: "Target node ID is required." },
        { status: 400 }
      );
    }

    const result = await connectInvestigatorClue(
      id,
      clueId,
      targetId,
      relationshipType,
      notes
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      newEdge: result.newEdge,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to connect clue." },
      { status: 500 }
    );
  }
}
