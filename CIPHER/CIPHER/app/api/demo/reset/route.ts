import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { recordAuditEvent } from "@/lib/user-service";

export async function POST(req: NextRequest) {
  try {
    // Only allow in development or demo mode
    const isDev = process.env.NODE_ENV !== "production" || process.env.ENABLE_DEMO_RESET === "true";
    if (!isDev) {
      return NextResponse.json(
        { success: false, error: "Demo reset is only available in development/demo environment." },
        { status: 403 }
      );
    }

    const dataDir = path.join(process.cwd(), "data");

    // Clear dynamic files so seed constants re-populate cleanly
    const filesToReset = [
      "investigations.json",
      "alerts.json",
      "data-sources.json",
      "evidence.json",
      "reports.json",
      "graph-store.json",
      "audit-logs.json",
    ];

    for (const f of filesToReset) {
      const p = path.join(dataDir, f);
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
      }
    }

    await recordAuditEvent({
      action: "DEMO_DATASET_RESET",
      userId: "sys-admin",
      userName: "System Administrator",
      field: "database",
      details: "Synthetic and court-grounded demo datasets reset to baseline pristine state.",
    });

    return NextResponse.json({
      success: true,
      message: "CIPHER demo data environment successfully reset to pristine baseline state.",
      resetTimestamp: new Date().toISOString(),
      activeDossiers: [
        "CASE-2025-004 (Sahil Khan v. State Govt. of NCT of Delhi)",
        "INV-2026-0142 (Operation Nexus)",
        "CYB-2026-0481 (Operation Shadow Breach)",
        "FIN-2026-0819 (Syndicate CashWash Ledger)",
      ],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to reset demo data" },
      { status: 500 }
    );
  }
}
