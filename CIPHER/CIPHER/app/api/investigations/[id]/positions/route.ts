import { NextRequest, NextResponse } from "next/server";
import { saveNodePositions } from "@/lib/investigation-graph-service";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const positions = body.positions;

    if (!positions || typeof positions !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid positions object." },
        { status: 400 }
      );
    }

    await saveNodePositions(id, positions);

    return NextResponse.json({
      success: true,
      message: "Node positions saved successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save positions." },
      { status: 500 }
    );
  }
}
