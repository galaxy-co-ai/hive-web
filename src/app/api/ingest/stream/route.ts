import { NextRequest } from "next/server";
import { PDFParse } from "pdf-parse";
import * as cheerio from "cheerio";
import { processDocument, ProcessDocumentInput } from "@/lib/ai-processor";
import { saveHex, bulkSaveHexes, getAllHexes } from "@/lib/kv";
import { Hex } from "@/lib/schemas";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Extract clean text content from HTML using cheerio
 */
function extractTextFromHtml(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript, iframe, svg, nav, footer, header, aside").remove();

  const mainContent =
    $("article").text() ||
    $("main").text() ||
    $('[role="main"]').text() ||
    $(".content, .post, .article, .entry").text();

  if (mainContent && mainContent.trim().length > 200) {
    return mainContent.replace(/\s+/g, " ").trim();
  }

  return $("body").text().replace(/\s+/g, " ").trim();
}

async function extractTextFromUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": "HiveBot/1.0 (Knowledge Extraction)" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (contentType.includes("text/html")) {
    return extractTextFromHtml(text);
  }

  return text;
}

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
    throw new Error(`Unsupported file type: ${extension}`);
  }

  return { text, sourceName, sourceType };
}

interface ProgressEvent {
  type: "progress" | "complete" | "error";
  current?: number;
  total?: number;
  message?: string;
  hexes?: Hex[];
  error?: string;
}

function sendEvent(controller: ReadableStreamDefaultController, event: ProgressEvent) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  controller.enqueue(new TextEncoder().encode(data));
}

/**
 * POST /api/ingest/stream
 *
 * SSE streaming endpoint for batch processing with progress updates.
 * Returns Server-Sent Events with progress and final results.
 */
export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    return new Response(
      JSON.stringify({ error: "Streaming only supported for file uploads" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const formData = await request.formData();
  const files = formData.getAll("file") as File[];

  if (!files.length) {
    return new Response(
      JSON.stringify({ error: "No files provided" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const existingHexes = await getAllHexes();
        let currentHexes = [...existingHexes];
        const allHexes: Hex[] = [];
        const now = new Date().toISOString();

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!(file instanceof File)) continue;

          // Send progress update
          sendEvent(controller, {
            type: "progress",
            current: i + 1,
            total: files.length,
            message: `Processing ${file.name}...`,
          });

          try {
            // Extract text
            const doc = await processFile(file);

            if (!doc.text || doc.text.trim().length < 10) {
              sendEvent(controller, {
                type: "progress",
                current: i + 1,
                total: files.length,
                message: `Skipped ${file.name} (insufficient content)`,
              });
              continue;
            }

            // Process with AI
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
            currentHexes.push(...hexesWithTimestamps);

            sendEvent(controller, {
              type: "progress",
              current: i + 1,
              total: files.length,
              message: `Completed ${file.name}: ${result.message}`,
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            sendEvent(controller, {
              type: "progress",
              current: i + 1,
              total: files.length,
              message: `Error processing ${file.name}: ${message}`,
            });
          }
        }

        // Save all hexes
        if (allHexes.length === 1) {
          await saveHex(allHexes[0]);
        } else if (allHexes.length > 1) {
          await bulkSaveHexes(allHexes);
        }

        // Send completion event
        sendEvent(controller, {
          type: "complete",
          message: `Processed ${files.length} files, created ${allHexes.length} hexes`,
          hexes: allHexes,
        });

        controller.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        sendEvent(controller, {
          type: "error",
          error: message,
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
