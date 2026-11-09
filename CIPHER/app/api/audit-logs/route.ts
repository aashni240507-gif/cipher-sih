import { NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/user-service";

export async function GET() {
  try {
    const logs = await getAuditLogs();
    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error: any) {
    console.error("[API] GET /api/audit-logs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve audit logs." },
      { status: 500 }
    );
  }
}
