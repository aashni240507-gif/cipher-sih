import { NextRequest, NextResponse } from "next/server";
import { executeAIQuery, AIQueryInput } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AIQueryInput;

    if (!body.query || !body.query.trim()) {
      return NextResponse.json(
        { success: false, error: "Inquiry query is required." },
        { status: 400 }
      );
    }

    const result = await executeAIQuery(body);

    return NextResponse.json({
      success: true,
      query: body.query,
      detectedLanguage: result.detectedLanguage,
      responseLanguage: result.responseLanguage,
      response: {
        text: result.text,
        answerSummary: result.answerSummary,
        evidenceLinks: result.evidenceLinks,
        relatedEntities: result.relatedEntities,
        confidence: result.confidence,
        sourceReferences: result.sourceReferences,
      },
    });
  } catch (error: any) {
    console.error("[API] POST /api/ai/query error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process CIPHER AI inquiry.",
      },
      { status: 500 }
    );
  }
}
