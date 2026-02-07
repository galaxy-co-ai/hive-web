import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import * as cheerio from "cheerio";
import { processDocument, ProcessDocumentInput } from "@/lib/ai-processor";
import { saveHex, bulkSaveHexes, getAllHexes } from "@/lib/kv";
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
 * Extract clean text content from HTML using cheerio
 */
function extractTextFromHtml(html: string): string {
  const $ = cheerio.load(html);

  // Remove script, style, and other non-content elements
  $("script, style, noscript, iframe, svg, nav, footer, header, aside").remove();

  // Try to find main content area
  const mainContent =
    $("article").text() ||
    $("main").text() ||
    $('[role="main"]').text() ||
    $(".content, .post, .article, .entry").text();

  if (mainContent && mainContent.trim().length > 200) {
    return mainContent.replace(/\s+/g, " ").trim();
  }

  // Fallback to body text
  return $("body").text().replace(/\s+/g, " ").trim();
}

/**
 * Extract text content from a URL
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

  // Use cheerio for HTML parsing
  if (contentType.includes("text/html")) {
    return extractTextFromHtml(text);
  }

  return text;
}

/**
 * Process a single file and return extracted text with metadata
 */
async function processFile(
  file: File
): Promise<{ text: string; sourceName: string; sourceType: ProcessDocumentInput["sourceType"] }> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File "${file.name}" exceeds 10MB limit`);
  }

  const sourceName = file.name;
  const extension = file.name.split(".").pop()?.toLowerCase();

  let text: string;
  let sourceType: ProcessDocumentInput["sourceType"];

  if (extension === "pdf") {
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
    throw new Error(`Unsupported file type: ${extension}. Supported: PDF, TXT, MD`);
  }

  return { text, sourceName, sourceType };
}

/**
 * POST /api/ingest
 *
 * Accepts:
 * - multipart/form-data with file(s) (PDF, TXT, MD) - supports batch upload
 * - JSON body with { text, sourceName } or { url }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Get existing hexes for relationship discovery
    const existingHexes = await getAllHexes();

    const documents: Array<{
      text: string;
      sourceName: string;
      sourceType: ProcessDocumentInput["sourceType"];
    }> = [];

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload (single or batch)
      const formData = await request.formData();
      const files = formData.getAll("file") as File[];

      if (!files.length) {
        return NextResponse.json(
          { success: false, error: "No files provided" },
          { status: 400 }
        );
      }

      // Process each file
      for (const file of files) {
        if (!(file instanceof File)) continue;
        try {
          const doc = await processFile(file);
          documents.push(doc);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          return NextResponse.json(
            { success: false, error: `Error processing "${file.name}": ${message}` },
            { status: 400 }
          );
        }
      }
    } else if (contentType.includes("application/json")) {
      // Handle JSON body (text paste or URL)
      const body = await request.json();

      if (body.url) {
        const url = body.url as string;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          return NextResponse.json(
            { success: false, error: "Invalid URL format" },
            { status: 400 }
          );
        }

        const text = await extractTextFromUrl(url);
        documents.push({
          text,
          sourceName: new URL(url).hostname,
          sourceType: "url",
        });
      } else if (body.text) {
        documents.push({
          text: body.text as string,
          sourceName: body.sourceName || "Pasted Text",
          sourceType: "text",
        });
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
    for (const doc of documents) {
      if (!doc.text || doc.text.trim().length < 10) {
        return NextResponse.json(
          { success: false, error: `Document "${doc.sourceName}" has insufficient content` },
          { status: 400 }
        );
      }
    }

    // Process all documents
    const allHexes: Hex[] = [];
    const allMessages: string[] = [];
    const now = new Date().toISOString();

    // Keep track of all hexes (existing + newly created) for relationship discovery
    let currentHexes = [...existingHexes];

    for (const doc of documents) {
      const result = await processDocument({
        text: doc.text,
        sourceName: doc.sourceName,
        sourceType: doc.sourceType,
        existingHexes: currentHexes,
      });

      // Add timestamps
      const hexesWithTimestamps: Hex[] = result.hexes.map((hex) => ({
        ...hex,
        created: now,
        updated: now,
      }));

      allHexes.push(...hexesWithTimestamps);
      allMessages.push(result.message);

      // Add to currentHexes so subsequent documents can link to these
      currentHexes.push(...hexesWithTimestamps);
    }

    // Save to KV
    if (allHexes.length === 1) {
      await saveHex(allHexes[0]);
    } else if (allHexes.length > 1) {
      await bulkSaveHexes(allHexes);
    }

    return NextResponse.json({
      success: true,
      data: {
        hexes: allHexes,
        message:
          documents.length > 1
            ? `Processed ${documents.length} documents: ${allMessages.join(" | ")}`
            : allMessages[0] || "Document processed",
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
