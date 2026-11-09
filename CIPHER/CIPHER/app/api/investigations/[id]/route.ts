import { NextRequest, NextResponse } from "next/server";
import {
  getInvestigationById,
  updateInvestigation,
  deleteInvestigation,
} from "@/lib/investigation-service";

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

    return NextResponse.json({ success: true, investigation: item });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error retrieving investigation." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updated = await updateInvestigation(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Investigation '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Investigation updated successfully.",
      investigation: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error updating investigation." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteInvestigation(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Investigation '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Investigation archived and removed successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error deleting investigation." },
      { status: 500 }
    );
  }
}
