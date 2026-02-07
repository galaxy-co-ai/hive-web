import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { processDocument, ProcessDocumentInput } from "@/lib/ai-processor";
import { saveHex, bulkSaveHexes } from "@/lib/kv";
import { Hex } from "@/lib/schemas";

interface SuccessResponse {
  success: true;
  data: {
    hexes: Hex[];
    message: string;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Extract text content from a URL by fetching and stripping HTML
 */
async function extractTextFromUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "HiveBot/1.0 (Knowledge Extraction)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  // If HTML, strip tags (simple approach - Phase 2 will use cheerio)
  if (contentType.includes("text/html")) {
    return text
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return text;
}

/**
 * POST /api/ingest
 *
 * Accepts either:
 * - multipart/form-data with a file (PDF, TXT, MD)
 * - JSON body with { text, sourceName } or { url }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const contentType = request.headers.get("content-type") || "";

    let text: string;
    let sourceName: string;
    let sourceType: ProcessDocumentInput["sourceType"];

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file provided" },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: "File exceeds 10MB limit" },
          { status: 400 }
        );
      }

      sourceName = file.name;
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (extension === "pdf") {
        // Parse PDF using pdf-parse v2 class-based API
        const buffer = Buffer.from(await file.arrayBuffer());
        const parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        await parser.destroy();
        text = textResult.text;
        sourceType = "pdf";
      } else if (extension === "txt") {
        text = await file.text();
        sourceType = "text";
      } else if (extension === "md") {
        text = await file.text();
        sourceType = "markdown";
      } else {
        return NextResponse.json(
          { success: false, error: `Unsupported file type: ${extension}. Supported: PDF, TXT, MD` },
          { status: 400 }
        );
      }
    } else if (contentType.includes("application/json")) {
      // Handle JSON body (text paste or URL)
      const body = await request.json();

      if (body.url) {
        // URL fetch
        const url = body.url as string;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          return NextResponse.json(
            { success: false, error: "Invalid URL format" },
            { status: 400 }
          );
        }

        text = await extractTextFromUrl(url);
        sourceName = new URL(url).hostname;
        sourceType = "url";
      } else if (body.text) {
        // Text paste
        text = body.text as string;
        sourceName = body.sourceName || "Pasted Text";
        sourceType = "text";
      } else {
        return NextResponse.json(
          { success: false, error: "Request must include either 'file', 'text', or 'url'" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported content type" },
        { status: 400 }
      );
    }

    // Validate we have content
    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Document has insufficient content to process" },
        { status: 400 }
      );
    }

    // Process with AI
    const result = await processDocument({ text, sourceName, sourceType });

    // Add timestamps and save
    const now = new Date().toISOString();
    const hexesWithTimestamps: Hex[] = result.hexes.map((hex) => ({
      ...hex,
      created: now,
      updated: now,
    }));

    // Save to KV
    if (hexesWithTimestamps.length === 1) {
      await saveHex(hexesWithTimestamps[0]);
    } else if (hexesWithTimestamps.length > 1) {
      await bulkSaveHexes(hexesWithTimestamps);
    }

    return NextResponse.json({
      success: true,
      data: {
        hexes: hexesWithTimestamps,
        message: result.message,
      },
    });
  } catch (error) {
    console.error("Ingest error:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
