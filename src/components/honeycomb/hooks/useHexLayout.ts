"use client";

import { useMemo } from "react";
import type { Hex } from "@/lib/schemas";
import type { HexRenderData, HexPosition } from "../types";
import { generateHexPositions, calculateBoundingBox, type BoundingBox } from "../utils/hexMath";

interface UseHexLayoutOptions {
  /** Hexes to lay out */
  hexes: Hex[];
  /** All hex IDs in the hive (for determining if edges lead to valid children) */
  allHexIds?: Set<string>;
}

interface UseHexLayoutReturn {
  /** Positioned hex data ready for rendering */
  layoutData: HexRenderData[];
  /** Bounding box of all hexes */
  boundingBox: BoundingBox;
  /** Map from hex ID to render data for quick lookup */
  hexMap: Map<string, HexRenderData>;
}

export function useHexLayout({
  hexes,
  allHexIds,
}: UseHexLayoutOptions): UseHexLayoutReturn {
  return useMemo(() => {
    if (hexes.length === 0) {
      return {
        layoutData: [],
        boundingBox: {
          minX: 0,
          minY: 0,
          maxX: 0,
          maxY: 0,
          width: 0,
          height: 0,
          centerX: 0,
          centerY: 0,
        },
        hexMap: new Map(),
      };
    }

    // Generate positions in spiral layout
    const positions = generateHexPositions(hexes.length);

    // Create set of all hex IDs if not provided
    const idSet = allHexIds ?? new Set(hexes.map((h) => h.id));

    // Map hexes to render data
    const layoutData: HexRenderData[] = hexes.map((hex, index) => {
      const position = positions[index];

      // Count how many edges lead to other hexes in the current set
      const childCount = hex.edges.filter((edge) => idSet.has(edge.to)).length;
      const hasChildren = childCount > 0;

      return {
        hex,
        position,
        index,
        hasChildren,
        childCount,
      };
    });

    // Calculate bounding box
    const boundingBox = calculateBoundingBox(positions);

    // Build lookup map
    const hexMap = new Map<string, HexRenderData>();
    for (const data of layoutData) {
      hexMap.set(data.hex.id, data);
    }

    return { layoutData, boundingBox, hexMap };
  }, [hexes, allHexIds]);
}

/**
 * Get children hexes for a parent hex (those connected via edges)
 */
export function getChildHexes(
  parentHex: Hex,
  allHexes: Hex[]
): Hex[] {
  const childIds = new Set(parentHex.edges.map((e) => e.to));
  return allHexes.filter((h) => childIds.has(h.id));
}

/**
 * Filter hexes to show at root level (could be all, or could be filtered)
 * For now, we show all hexes at root level
 */
export function getRootHexes(allHexes: Hex[]): Hex[] {
  // Could implement logic to only show certain types at root
  // For now, show everything
  return allHexes;
}
