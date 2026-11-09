import { NextRequest, NextResponse } from "next/server";
import {
  getConversation,
  renameConversation,
  deleteConversation,
} from "@/lib/ai/chat-service";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const conversation = getConversation(id);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch conversation" },
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
    const body = await req.json().catch(() => ({}));
    const newTitle = body.title;

    if (!newTitle || typeof newTitle !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid 'title' string is required" },
        { status: 400 }
      );
    }

    const updated = renameConversation(id, newTitle);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to rename conversation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = deleteConversation(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
