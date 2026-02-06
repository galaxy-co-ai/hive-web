import { NextRequest, NextResponse } from "next/server";
import { getHex, saveHex, deleteHex } from "@/lib/kv";
import { updateHexSchema, Hex } from "@/lib/schemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/hexes/[id] - Get a single hex
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const hex = await getHex(id);

    if (!hex) {
      return NextResponse.json(
        { success: false, error: "Hex not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: hex });
  } catch (error) {
    console.error("Failed to fetch hex:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hex" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/hexes/[id] - Update a hex
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existingHex = await getHex(id);

    if (!existingHex) {
      return NextResponse.json(
        { success: false, error: "Hex not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = updateHexSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    // Merge updates with existing hex
    const updatedHex: Hex = {
      ...existingHex,
      ...result.data,
      id: existingHex.id, // ID cannot change
      created: existingHex.created, // Created cannot change
      updated: new Date().toISOString(),
    };

    await saveHex(updatedHex);

    return NextResponse.json({ success: true, data: updatedHex });
  } catch (error) {
    console.error("Failed to update hex:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update hex" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hexes/[id] - Delete a hex
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteHex(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Hex not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Failed to delete hex:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete hex" },
      { status: 500 }
    );
  }
}
