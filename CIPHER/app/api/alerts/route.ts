import { NextRequest, NextResponse } from "next/server";
import { getAlertsForCase } from "@/lib/alert-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("caseId") || searchParams.get("investigationId") || undefined;
    const alerts = getAlertsForCase(caseId);

    return NextResponse.json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
