import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { nanoid } from "nanoid";
import { CreateHexInput, createHexSchema, Hex } from "./schemas";
import { queryHexes } from "./hive-query";

const anthropic = new Anthropic();

// Schema for AI response validation
const aiHexOutputSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  type: z.enum(["data", "tool", "gateway", "junction"]),
  description: z.string(),
  entryHints: z.array(z.string()).min(1),
  tags: z.array(z.string()),
  contents: z.object({
    data: z.unknown().optional(),
  }),
  edges: z.array(
    z.object({
      id: z.string(),
      to: z.string(),
      when: z.object({
        intent: z.string().optional(),
        always: z.boolean().optional(),
      }),
      priority: z.number(),
      description: z.string(),
    })
  ),
});

const aiResponseSchema = z.object({
  hexes: z.array(aiHexOutputSchema),
  summary: z.string(),
});

type AIResponse = z.infer<typeof aiResponseSchema>;

export interface ProcessDocumentInput {
  text: string;
  sourceName: string;
  sourceType: "pdf" | "text" | "url" | "markdown";
  existingHexes?: Hex[]; // For relationship discovery
}

export interface ProcessDocumentResult {
  hexes: CreateHexInput[];
  message: string;
}

export interface DocumentChunk {
  title: string;
  content: string;
  index: number;
}

// ============================================
// DOCUMENT CHUNKING
// ============================================

/**
 * Split a document into chunks by headings or logical sections
 */
export function chunkDocument(text: string, maxChunkSize = 15000): DocumentChunk[] {
  // Try to split by markdown headings first
  const headingPattern = /^(#{1,3})\s+(.+)$/gm;
  const matches = [...text.matchAll(headingPattern)];

  if (matches.length >= 2) {
    // Document has multiple sections, split by headings
    const chunks: DocumentChunk[] = [];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const startIndex = match.index!;
      const endIndex = i + 1 < matches.length ? matches[i + 1].index! : text.length;
      const content = text.slice(startIndex, endIndex).trim();

      if (content.length > 100) { // Skip very short sections
        chunks.push({
          title: match[2].trim(),
          content,
          index: i,
        });
      }
    }

    // If we got reasonable chunks, return them
    if (chunks.length >= 2) {
      return chunks;
    }
  }

  // Fallback: split by paragraph breaks for very long documents
  if (text.length > maxChunkSize) {
    const paragraphs = text.split(/\n\n+/);
    const chunks: DocumentChunk[] = [];
    let currentChunk = "";
    let chunkIndex = 0;

    for (const para of paragraphs) {
      if (currentChunk.length + para.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push({
          title: `Section ${chunkIndex + 1}`,
          content: currentChunk.trim(),
          index: chunkIndex,
        });
        chunkIndex++;
        currentChunk = para;
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + para;
      }
    }

    if (currentChunk.trim().length > 100) {
      chunks.push({
        title: `Section ${chunkIndex + 1}`,
        content: currentChunk.trim(),
        index: chunkIndex,
      });
    }

    if (chunks.length >= 2) {
      return chunks;
    }
  }

  // Single chunk for short documents
  return [{
    title: "Main Content",
    content: text,
    index: 0,
  }];
}

// ============================================
// RELATIONSHIP DISCOVERY
// ============================================

/**
 * Find related hexes and add edges to new hexes
 */
export function discoverRelationships(
  newHexes: CreateHexInput[],
  existingHexes: Hex[],
  minScore = 2
): CreateHexInput[] {
  if (!existingHexes.length) return newHexes;

  return newHexes.map((hex) => {
    // Create a search intent from the hex's name, description, and hints
    const searchIntent = [
      hex.name,
      hex.description || "",
      ...hex.entryHints.slice(0, 3),
    ].join(" ");

    // Query existing hexes for related content
    const related = queryHexes(existingHexes, searchIntent, 3);

    // Filter to good matches and exclude self
    const validRelated = related.filter(
      (r) => r.score >= minScore && r.hex.id !== hex.id
    );

    if (!validRelated.length) return hex;

    // Create edges to related hexes
    const newEdges = validRelated.map((r, i) => ({
      id: `related-${r.hex.id}`,
      to: r.hex.id,
      when: { intent: `explore ${r.hex.name.toLowerCase()}` },
      priority: 50 - i * 10,
      description: `Related: ${r.hex.name}`,
    }));

    // Merge with existing edges, avoiding duplicates
    const existingToIds = new Set(hex.edges.map((e) => e.to));
    const uniqueNewEdges = newEdges.filter((e) => !existingToIds.has(e.to));

    return {
      ...hex,
      edges: [...hex.edges, ...uniqueNewEdges],
    };
  });
}

// ============================================
// ID UTILITIES
// ============================================

/**
 * Sanitize an ID to match the hex schema requirements:
 * lowercase alphanumeric with hyphens only
 */
function sanitizeId(id: string): string {
  return id
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || `hex-${nanoid(8)}`;
}

/**
 * Ensure ID uniqueness by appending suffix if needed
 */
function ensureUniqueId(id: string, existingIds: Set<string>): string {
  let uniqueId = id;
  let suffix = 1;
  while (existingIds.has(uniqueId)) {
    uniqueId = `${id}-${suffix}`;
    suffix++;
  }
  existingIds.add(uniqueId);
  return uniqueId;
}

// ============================================
// MAIN PROCESSING
// ============================================

/**
 * Process a document and generate hex structures using Claude
 */
export async function processDocument(
  input: ProcessDocumentInput
): Promise<ProcessDocumentResult> {
  const { text, sourceName, sourceType, existingHexes = [] } = input;

  // Check if document should be chunked
  const chunks = chunkDocument(text);
  const isChunked = chunks.length > 1;

  // Track IDs to ensure uniqueness
  const usedIds = new Set(existingHexes.map((h) => h.id));

  let allHexes: CreateHexInput[] = [];
  let summaries: string[] = [];

  for (const chunk of chunks) {
    const chunkName = isChunked ? `${sourceName} - ${chunk.title}` : sourceName;
    const result = await processChunk(chunk.content, chunkName, sourceType);

    // Ensure unique IDs
    const hexesWithUniqueIds = result.hexes.map((hex) => ({
      ...hex,
      id: ensureUniqueId(hex.id, usedIds),
    }));

    allHexes.push(...hexesWithUniqueIds);
    summaries.push(result.message);
  }

  // Link chunks together if document was split
  if (isChunked && allHexes.length > 1) {
    allHexes = linkChunkedHexes(allHexes, sourceName);
  }

  // Discover relationships with existing hexes
  if (existingHexes.length > 0) {
    allHexes = discoverRelationships(allHexes, existingHexes);
  }

  return {
    hexes: allHexes,
    message: isChunked
      ? `Processed ${chunks.length} sections: ${summaries.join(" | ")}`
      : summaries[0] || "Document processed",
  };
}

/**
 * Link hexes from chunked documents with next/prev edges
 */
function linkChunkedHexes(hexes: CreateHexInput[], sourceName: string): CreateHexInput[] {
  return hexes.map((hex, i) => {
    const edges = [...hex.edges];

    if (i > 0) {
      edges.push({
        id: `prev-${hexes[i - 1].id}`,
        to: hexes[i - 1].id,
        when: { intent: "previous section" },
        priority: 80,
        description: `Previous: ${hexes[i - 1].name}`,
      });
    }

    if (i < hexes.length - 1) {
      edges.push({
        id: `next-${hexes[i + 1].id}`,
        to: hexes[i + 1].id,
        when: { intent: "next section" },
        priority: 80,
        description: `Next: ${hexes[i + 1].name}`,
      });
    }

    // Add source tag for grouping
    const tags = [...hex.tags];
    const sourceTag = sanitizeId(sourceName).slice(0, 20);
    if (!tags.includes(sourceTag)) {
      tags.push(sourceTag);
    }

    return { ...hex, edges, tags };
  });
}

/**
 * Process a single chunk of text
 */
async function processChunk(
  text: string,
  sourceName: string,
  sourceType: ProcessDocumentInput["sourceType"]
): Promise<ProcessDocumentResult> {
  // Truncate if still too long
  const maxChars = 50000;
  const truncatedText =
    text.length > maxChars
      ? text.slice(0, maxChars) + "\n\n[Content truncated...]"
      : text;

  const systemPrompt = `You are a knowledge extraction assistant. Your job is to analyze documents and create structured "hex" nodes for a knowledge graph.

Each hex represents a distinct concept, topic, or piece of information. A hex has:
- id: lowercase alphanumeric with hyphens (e.g., "react-hooks-guide")
- name: short human-readable title (max 100 chars)
- type: "data" for information, "tool" for actionable items, "gateway" for entry points, "junction" for decision points
- description: 1-2 sentence summary
- entryHints: CRITICAL - array of phrases someone might search to find this (semantic search queries). Include synonyms, related terms, question phrasings. More is better.
- tags: categorization labels
- contents.data: the actual extracted information (can be structured JSON or plain text)
- edges: connections to other hexes (optional, for related concepts within the same document)

Guidelines:
1. Create 1-3 hexes depending on content complexity
2. For focused content, one comprehensive hex is ideal
3. For multi-topic content, create separate focused hexes
4. entryHints are the most important field - they drive search. Include:
   - The main topic phrase
   - Related synonyms
   - Questions someone might ask
   - Key terms from the content
5. Keep contents.data focused but complete

Respond with valid JSON only, no markdown code blocks.`;

  const userPrompt = `Analyze this ${sourceType} document named "${sourceName}" and create hex node(s):

---
${truncatedText}
---

Respond with JSON in this exact format:
{
  "hexes": [
    {
      "id": "example-topic",
      "name": "Example Topic",
      "type": "data",
      "description": "Brief description",
      "entryHints": ["example topic", "what is example", "example guide"],
      "tags": ["example", "guide"],
      "contents": { "data": "The extracted information..." },
      "edges": []
    }
  ],
  "summary": "Brief summary of what was extracted"
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  });

  // Extract text from response
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  // Parse JSON response
  let parsed: unknown;
  try {
    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${textBlock.text.slice(0, 200)}`);
  }

  // Validate with Zod
  const validation = aiResponseSchema.safeParse(parsed);
  if (!validation.success) {
    throw new Error(
      `AI response validation failed: ${validation.error.message}`
    );
  }

  const aiResponse: AIResponse = validation.data;

  // Transform to CreateHexInput format with sanitized IDs
  const hexes: CreateHexInput[] = aiResponse.hexes.map((hex) => {
    const sanitizedId = sanitizeId(hex.id);

    const sanitizedEdges = hex.edges.map((edge) => ({
      id: sanitizeId(edge.id),
      to: sanitizeId(edge.to),
      when: edge.when,
      priority: edge.priority,
      description: edge.description,
    }));

    return {
      id: sanitizedId,
      name: hex.name,
      type: hex.type,
      description: hex.description,
      entryHints: hex.entryHints,
      tags: hex.tags,
      contents: hex.contents,
      edges: sanitizedEdges,
    };
  });

  // Final validation against createHexSchema
  for (const hex of hexes) {
    const result = createHexSchema.safeParse(hex);
    if (!result.success) {
      throw new Error(
        `Generated hex "${hex.id}" failed validation: ${result.error.message}`
      );
    }
  }

  return {
    hexes,
    message: aiResponse.summary,
  };
}
