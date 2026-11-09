import { NextRequest, NextResponse } from "next/server";
import {
  listConversations,
  createConversation,
} from "@/lib/ai/chat-service";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") || "usr-analyst-01";
    const conversations = listConversations(userId);
    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to list conversations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const newConv = createConversation({
      userId: body.userId || "usr-analyst-01",
      investigationId: body.investigationId || "INV-2026-0142",
      title: body.title || "New Investigation Chat",
    });

    return NextResponse.json({
      success: true,
      conversation: newConv,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create conversation" },
      { status: 500 }
    );
  }
}
