import { NextRequest, NextResponse } from "next/server";
import { getAlertById, updateAlertStatus } from "@/lib/alert-service";
import { getAuthenticatedUser } from "@/lib/auth-service";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await context.params;
    const alertId = resolvedParams.id;
    const alert = getAlertById(alertId);
    if (!alert) {
      return NextResponse.json(
        { success: false, error: `Alert ${alertId} not found` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, alert });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve alert" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await context.params;
    const alertId = resolvedParams.id;
    const user = await getAuthenticatedUser(req);
    const body = await req.json();
    const newStatus = body.status;

    if (!newStatus || !["NEW", "ACKNOWLEDGED", "INVESTIGATING", "RESOLVED"].includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: "Invalid status. Must be NEW, ACKNOWLEDGED, INVESTIGATING, or RESOLVED." },
        { status: 400 }
      );
    }

    const result = await updateAlertStatus(alertId, newStatus, user ? { id: user.id, name: user.name } : undefined);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Alert ${alertId} status updated to ${newStatus}`,
      alert: result.alert,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update alert" },
      { status: 500 }
    );
  }
}
