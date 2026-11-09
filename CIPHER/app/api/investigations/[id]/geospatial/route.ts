import { NextRequest, NextResponse } from "next/server";
import { getInvestigationGeospatialData } from "@/lib/geospatial-service";
import { recordAuditEvent } from "@/lib/user-service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const geospatialData = getInvestigationGeospatialData(id);

    // Record audit event for geospatial access
    await recordAuditEvent({
      id: `aud-${Date.now().toString(36)}`,
      action: "GEOSPATIAL_ACCESSED",
      userId: "usr-analyst-01",
      userName: "Amit Sharma",
      field: "geospatial",
      details: `Accessed tactical geospatial map for investigation ${geospatialData.caseId} (${geospatialData.title})`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: geospatialData,
    });
  } catch (error: any) {
    console.error("[Geospatial API] Error retrieving geospatial data:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load geospatial data." },
      { status: 500 }
    );
  }
}
