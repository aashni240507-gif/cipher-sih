import { NextRequest } from "next/server";
import {
  getConversation,
  createConversation,
  addMessageToConversation,
  getConversationHistoryForPrompt,
  ToolCallRecord,
  EvidenceCitation,
} from "@/lib/ai/chat-service";
import { handleChatStream } from "@/lib/ai/ollama-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = body.message;
    let conversationId = body.conversationId;
    const uploadedContext = body.uploadedContext;
    const userId = body.userId || "usr-analyst-01";
    const investigationId = body.investigationId || "INV-2026-0142";

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(
        JSON.stringify({ error: "A valid non-empty 'message' string is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Ensure conversation exists
    if (!conversationId) {
      const newConv = createConversation({
        userId,
        investigationId,
        title: message.trim().slice(0, 36) + (message.length > 36 ? "..." : ""),
      });
      conversationId = newConv.id;
    } else {
      const existing = getConversation(conversationId);
      if (!existing) {
        createConversation({
          userId,
          investigationId,
          title: message.trim().slice(0, 36) + (message.length > 36 ? "..." : ""),
        });
      }
    }

    // Record user message
    addMessageToConversation(conversationId, {
      role: "user",
      content: message,
    });

    // Retrieve history for prompt
    const history = getConversationHistoryForPrompt(conversationId, 6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Setup streaming response
    const encoder = new TextEncoder();
    let accumulatedContent = "";
    const activeToolCalls: ToolCallRecord[] = [];
    let recordedCitations: EvidenceCitation[] = [];
    let recordedFollowUps: string[] = [];
    let detectedLang: "en" | "hi" | "hinglish" = "en";

    const stream = new ReadableStream({
      async start(controller) {
        // First emit conversation ID to the client
        const initPayload = `event: init\ndata: ${JSON.stringify({ conversationId })}\n\n`;
        controller.enqueue(encoder.encode(initPayload));

        try {
          const streamGen = handleChatStream({
            query: message,
            conversationId: conversationId!,
            history,
            uploadedContext,
          });

          for await (const event of streamGen) {
            if (event.type === "token" && event.token) {
              accumulatedContent += event.token;
            } else if (event.type === "tool_start" && event.tool) {
              activeToolCalls.push({
                tool: event.tool,
                status: "running",
                summary: event.status,
              });
            } else if (event.type === "tool_end" && event.tool) {
              const existingTool = activeToolCalls.find((t) => t.tool === event.tool);
              if (existingTool) {
                existingTool.status = "completed";
                existingTool.summary = event.summary;
              }
            } else if (event.type === "metadata") {
              if (event.detectedLanguage) detectedLang = event.detectedLanguage;
              if (event.citations) recordedCitations = event.citations;
              if (event.followUps) recordedFollowUps = event.followUps;
            }

            const chunkPayload = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(chunkPayload));
          }

          // Persist the assistant message once stream concludes
          if (accumulatedContent.trim()) {
            addMessageToConversation(conversationId!, {
              role: "assistant",
              content: accumulatedContent,
              detectedLanguage: detectedLang,
              toolCalls: activeToolCalls,
              evidenceCitations: recordedCitations,
              suggestedFollowUps: recordedFollowUps,
            });
          }
        } catch (streamErr: any) {
          console.error("[ChatStreamRoute] Error during stream execution:", streamErr);
          const errPayload = `event: error\ndata: ${JSON.stringify({
            error: streamErr?.message || "Internal streaming error",
          })}\n\n`;
          controller.enqueue(encoder.encode(errPayload));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: any) {
    console.error("[ChatStreamRoute] Failed to initialize stream:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
