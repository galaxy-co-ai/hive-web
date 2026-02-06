import { NextRequest, NextResponse } from "next/server";
import { getAllHexes } from "@/lib/kv";
import { queryHexes } from "@/lib/hive-query";
import { z } from "zod";

const querySchema = z.object({
  intent: z.string().min(1),
  limit: z.number().int().min(1).max(50).default(5),
});

/**
 * POST /api/query - Semantic search using Hive query logic
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = querySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { intent, limit } = result.data;
    const hexes = await getAllHexes();
    const results = queryHexes(hexes, intent, limit);

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Failed to query hexes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to query hexes" },
      { status: 500 }
    );
  }
}
