"use client";

import { memo, useMemo } from "react";
import type { ConnectionLinesProps } from "./types";
import {
  CONNECTION_STROKE_WIDTH,
  CONNECTION_DASH_ARRAY,
  CONNECTION_COLOR,
} from "./utils/constants";

interface ConnectionLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Renders dashed connection lines between hexes that are linked via edges.
 * Lines are drawn from source hex center to target hex center.
 */
export const ConnectionLines = memo(function ConnectionLines({
  hexes,
  allHexIds,
}: ConnectionLinesProps) {
  const lines = useMemo(() => {
    const result: ConnectionLine[] = [];
    const positionMap = new Map(hexes.map((h) => [h.hex.id, h.position]));

    for (const hexData of hexes) {
      const fromPos = hexData.position;

      for (const edge of hexData.hex.edges) {
        // Only draw line if target hex exists in current view
        if (!allHexIds.has(edge.to)) continue;

        const toPos = positionMap.get(edge.to);
        if (!toPos) continue;

        // Create unique ID for this connection
        // Sort IDs to avoid duplicate lines (A->B and B->A)
        const [id1, id2] = [hexData.hex.id, edge.to].sort();
        const lineId = `${id1}-${id2}`;

        // Check if we already have this line
        if (result.some((l) => l.id === lineId)) continue;

        result.push({
          id: lineId,
          x1: fromPos.x,
          y1: fromPos.y,
          x2: toPos.x,
          y2: toPos.y,
        });
      }
    }

    return result;
  }, [hexes, allHexIds]);

  if (lines.length === 0) return null;

  return (
    <g className="connection-lines" style={{ pointerEvents: "none" }}>
      {lines.map((line) => (
        <line
          key={line.id}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={CONNECTION_COLOR}
          strokeWidth={CONNECTION_STROKE_WIDTH}
          strokeDasharray={CONNECTION_DASH_ARRAY}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
});
