import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { nanoid } from "nanoid";
import { CreateHexInput, createHexSchema } from "./schemas";

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
}

export interface ProcessDocumentResult {
  hexes: CreateHexInput[];
  message: string;
}

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
 * Process a document and generate hex structures using Claude
 */
export async function processDocument(
  input: ProcessDocumentInput
): Promise<ProcessDocumentResult> {
  const { text, sourceName, sourceType } = input;

  // Truncate very long documents (Claude can handle ~100k tokens but we'll be conservative)
  const maxChars = 50000;
  const truncatedText =
    text.length > maxChars
      ? text.slice(0, maxChars) + "\n\n[Document truncated...]"
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
1. Create 1-5 hexes depending on document complexity
2. For simple documents, one comprehensive hex is fine
3. For complex documents with distinct sections, create multiple focused hexes
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
    // Handle potential markdown code blocks
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

    // Also sanitize edge references
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
