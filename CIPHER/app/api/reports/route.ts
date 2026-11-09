import { NextRequest, NextResponse } from "next/server";
import { getAllReports, generateReport } from "@/lib/report-service";
import { getAuthenticatedUser } from "@/lib/auth-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("caseId") || undefined;
    const reports = getAllReports(caseId);
    return NextResponse.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();

    const caseId = body.caseId || "CASE-2025-004";
    const reportType = body.reportType || "CIPHER Investigation Summary";
    const customNotes = body.customNotes || "";

    const report = await generateReport({
      caseId,
      reportType,
      analystName: user?.fullName || body.analystName || "Amit Sharma",
      analystRole: user?.role || "Lead Intelligence Analyst (L3)",
      customNotes,
    });

    return NextResponse.json({
      success: true,
      message: "Judicial Intelligence Report successfully compiled with cryptographic digest",
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}
