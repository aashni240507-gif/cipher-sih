import { NextRequest, NextResponse } from "next/server";
import { getReportById } from "@/lib/report-service";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await context.params;
    const reportId = resolvedParams.id;
    const report = getReportById(reportId);
    if (!report) {
      return NextResponse.json(
        { success: false, error: `Report ${reportId} not found` },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve report" },
      { status: 500 }
    );
  }
}
