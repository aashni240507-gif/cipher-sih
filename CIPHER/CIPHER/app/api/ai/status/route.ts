import { NextResponse } from "next/server";
import { checkOllamaConnection, aiConfig } from "@/lib/ai/config";

export async function GET() {
  try {
    const status = await checkOllamaConnection();
    return NextResponse.json({
      success: true,
      ...status,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        connected: false,
        model: aiConfig.model,
        provider: aiConfig.provider,
        error: err?.message || "Failed to check AI status",
      },
      { status: 500 }
    );
  }
}
