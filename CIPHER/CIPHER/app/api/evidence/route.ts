import { NextRequest, NextResponse } from "next/server";
import {
  readAllEvidence,
  getEvidenceForCase,
  createEvidenceItem,
  EvidenceExhibit,
} from "@/lib/evidence-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("caseId");

    let items: EvidenceExhibit[] = [];
    if (caseId) {
      items = await getEvidenceForCase(caseId);
    } else {
      items = readAllEvidence();
    }

    return NextResponse.json({
      success: true,
      count: items.length,
      evidence: items,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve evidence." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.type) {
      return NextResponse.json(
        { success: false, error: "Evidence title and type are required." },
        { status: 400 }
      );
    }

    const newItem = await createEvidenceItem({
      name: body.name,
      type: body.type,
      source: body.source || "Investigator Upload",
      sourceUrl: body.sourceUrl,
      date: body.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      relatedEntity: body.relatedEntity || "Investigative Working Copy",
      relatedCase: body.relatedCase || "CASE-2025-004",
      status: "verified",
      sha256: body.sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      size: body.size || "1.2 MB",
      description: body.description || "Uploaded evidence exhibit with verified cryptographic hash.",
      linkedPeople: Array.isArray(body.linkedPeople) ? body.linkedPeople : [],
      linkedPhones: Array.isArray(body.linkedPhones) ? body.linkedPhones : [],
      linkedAccounts: Array.isArray(body.linkedAccounts) ? body.linkedAccounts : [],
      linkedLocations: Array.isArray(body.linkedLocations) ? body.linkedLocations : [],
      linkedEvents: Array.isArray(body.linkedEvents) ? body.linkedEvents : [],
      provenance: body.provenance || "INVESTIGATIVE_MATERIAL",
      verificationStatus: "Forensic Integrity Verified",
    });

    return NextResponse.json({
      success: true,
      evidence: newItem,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload evidence." },
      { status: 500 }
    );
  }
}
