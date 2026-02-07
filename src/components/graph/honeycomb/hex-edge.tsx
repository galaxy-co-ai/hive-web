"use client";

import { memo, useMemo } from "react";
import type { LayoutEdge } from "./types";

interface HexEdgeProps {
  edge: LayoutEdge;
}

function HexEdgeComponent({ edge }: HexEdgeProps) {
  const { fromX, fromY, toX, toY, priority } = edge;

  // Calculate stroke properties based on priority
  const strokeWidth = useMemo(() => {
    if (priority >= 80) return 3;
    if (priority >= 40) return 2;
    return 1.5;
  }, [priority]);

  const strokeColor = useMemo(() => {
    if (priority >= 80) return "#64748b"; // doc structure - darker
    if (priority >= 40) return "#94a3b8"; // medium
    return "#cbd5e1"; // semantic - lighter
  }, [priority]);

  const showArrow = priority >= 80;

  // Calculate quadratic bezier control point
  const controlPoint = useMemo(() => {
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;

    // Calculate perpendicular offset for curve
    const dx = toX - fromX;
    const dy = toY - fromY;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len < 1) return { x: midX, y: midY };

    // Offset perpendicular to the line
    const perpX = -dy / len;
    const perpY = dx / len;
    const offset = Math.min(len * 0.2, 30); // Curve amount

    return {
      x: midX + perpX * offset,
      y: midY + perpY * offset,
    };
  }, [fromX, fromY, toX, toY]);

  const pathD = `M ${fromX} ${fromY} Q ${controlPoint.x} ${controlPoint.y} ${toX} ${toY}`;

  // Arrow marker ID (unique per edge to avoid conflicts)
  const arrowId = `arrow-${edge.id}`;

  return (
    <g className="hex-edge">
      {/* Arrow marker definition */}
      {showArrow && (
        <defs>
          <marker
            id={arrowId}
            markerWidth={8}
            markerHeight={6}
            refX={6}
            refY={3}
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L8,3 z" fill={strokeColor} />
          </marker>
        </defs>
      )}

      {/* Edge path */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        markerEnd={showArrow ? `url(#${arrowId})` : undefined}
        className="transition-colors duration-150"
      />
    </g>
  );
}

export const HexEdge = memo(HexEdgeComponent);
