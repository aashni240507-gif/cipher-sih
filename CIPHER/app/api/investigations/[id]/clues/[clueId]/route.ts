import { NextRequest, NextResponse } from "next/server";
import {
  updateInvestigatorClue,
  deleteInvestigatorClue,
} from "@/lib/investigation-graph-service";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; clueId: string }> }
) {
  try {
    const { id, clueId } = await context.params;
    const body = await req.json().catch(() => ({}));

    const result = await updateInvestigatorClue(id, clueId, body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      updatedNode: result.updatedNode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update clue." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; clueId: string }> }
) {
  try {
    const { id, clueId } = await context.params;
    const result = await deleteInvestigatorClue(id, clueId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Clue deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete clue." },
      { status: 500 }
    );
  }
}
