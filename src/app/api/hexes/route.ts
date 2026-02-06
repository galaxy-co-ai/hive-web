import { NextRequest, NextResponse } from "next/server";
import { getAllHexes, saveHex, hexExists } from "@/lib/kv";
import { createHexSchema, Hex } from "@/lib/schemas";

/**
 * GET /api/hexes - List all hexes
 * Optional: ?q=search query for filtering
 */
export async function GET(request: NextRequest) {
  try {
    const hexes = await getAllHexes();
    const searchQuery = request.nextUrl.searchParams.get("q");

    if (searchQuery) {
      // Simple text filter (for quick filtering, not semantic search)
      const query = searchQuery.toLowerCase();
      const filtered = hexes.filter(
        (hex) =>
          hex.id.toLowerCase().includes(query) ||
          hex.name.toLowerCase().includes(query) ||
          hex.tags.some((t) => t.toLowerCase().includes(query)) ||
          hex.entryHints.some((h) => h.toLowerCase().includes(query))
      );
      return NextResponse.json({ success: true, data: filtered });
    }

    return NextResponse.json({ success: true, data: hexes });
  } catch (error) {
    console.error("Failed to fetch hexes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hexes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hexes - Create a new hex
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createHexSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    // Check if hex already exists
    if (await hexExists(result.data.id)) {
      return NextResponse.json(
        { success: false, error: `Hex with id '${result.data.id}' already exists` },
        { status: 409 }
      );
    }

    // Add timestamps
    const now = new Date().toISOString();
    const hex: Hex = {
      ...result.data,
      created: now,
      updated: now,
    };

    await saveHex(hex);

    return NextResponse.json({ success: true, data: hex }, { status: 201 });
  } catch (error) {
    console.error("Failed to create hex:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create hex" },
      { status: 500 }
    );
  }
}
