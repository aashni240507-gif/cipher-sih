import { NextRequest, NextResponse } from "next/server";
import {
  getAllInvestigations,
  createInvestigation,
  CreateInvestigationInput,
} from "@/lib/investigation-service";

export async function GET() {
  try {
    const investigations = await getAllInvestigations();
    return NextResponse.json({
      success: true,
      count: investigations.length,
      investigations,
    });
  } catch (error: any) {
    console.error("[API] GET /api/investigations error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to retrieve investigations from CIPHER intelligence services.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateInvestigationInput;

    // Delegate to investigation service for validation, uniqueness check, and Neo4j sync
    const result = await createInvestigation(body);

    if (!result.success) {
      const isConflict = result.error?.includes("already exists");
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: isConflict ? 409 : 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Investigation created successfully.",
        investigation: result.investigation,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API] POST /api/investigations error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create investigation.",
      },
      { status: 500 }
    );
  }
}
