import { NextRequest, NextResponse } from "next/server";
import { getDataSourcesForCase, addDataSource } from "@/lib/data-source-service";
import { getAuthenticatedUser } from "@/lib/auth-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("caseId") || undefined;
    const sources = getDataSourcesForCase(caseId);

    return NextResponse.json({
      success: true,
      count: sources.length,
      sources,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch data sources" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();

    const caseId = body.caseId || "CASE-2025-004";
    const name = body.name;
    const category = body.category || "FIR / Police Report";
    const type = body.type || "PDF";
    const fileSize = body.fileSize || "4.2 MB";

    const result = await addDataSource({
      caseId,
      name,
      category,
      type,
      fileSize,
      user: user ? { id: user.id, name: user.name } : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Data source successfully ingested into CIPHER Neural Processing Pipeline",
      source: result.source,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to ingest data source" },
      { status: 500 }
    );
  }
}
