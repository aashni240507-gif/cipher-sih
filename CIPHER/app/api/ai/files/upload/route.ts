import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file was uploaded." },
        { status: 400 }
      );
    }

    const filename = file.name;
    const size = file.size;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    const ext = filename.split(".").pop()?.toLowerCase() || "";

    if (["txt", "csv", "json", "md", "log"].includes(ext)) {
      extractedText = buffer.toString("utf-8");
    } else if (ext === "pdf") {
      // Basic text extraction from PDF buffer
      const raw = buffer.toString("latin1");
      const textMatches = raw.match(/\(([^)]+)\)\s*Tj/g) || [];
      if (textMatches.length > 0) {
        extractedText = textMatches
          .map((m) => m.replace(/^\(/, "").replace(/\)\s*Tj$/, ""))
          .join(" ")
          .trim();
      } else {
        // Fallback: strip binary headers and find printable strings
        extractedText = raw
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/g, " ")
          .replace(/\s+/g, " ")
          .slice(0, 10000);
      }
    } else {
      // Generic fallback for other documents
      extractedText = buffer.toString("utf-8").slice(0, 8000);
    }

    // Limit extracted text to reasonable size for prompt injection (up to 12,000 characters)
    const truncatedText = extractedText.slice(0, 12000);
    const excerpt =
      truncatedText.slice(0, 300) + (truncatedText.length > 300 ? "..." : "");

    return NextResponse.json({
      success: true,
      filename,
      size,
      excerpt,
      fullText: truncatedText,
    });
  } catch (err: any) {
    console.error("[FileUpload] Error processing document:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to process document" },
      { status: 500 }
    );
  }
}
