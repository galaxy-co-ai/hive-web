"use client";

import { memo, useMemo } from "react";
import type { GhostParentProps } from "./types";
import { hexPoints } from "./utils/hexMath";
import { HEX_COLORS } from "./utils/constants";

/**
 * Ghost parent hex rendered at center of extraction overlay.
 * Displays a faded version of the parent with connection lines to children.
 */
export const GhostParent = memo(function GhostParent({
  parentHex,
  childPositions,
  size,
}: GhostParentProps) {
  const colors = HEX_COLORS[parentHex.type];

  // Ghost hex points (at origin)
  const ghostPoints = useMemo(() => hexPoints(0, 0, size), [size]);

  // Unique filter ID
  const glowFilterId = `ghost-glow-${parentHex.id}`;

  return (
    <g className="ghost-parent">
      {/* Filter definition for ghost glow */}
      <defs>
        <filter
          id={glowFilterId}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur stdDeviation={4} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Connection lines from center to each child */}
      {childPositions.map((pos, i) => (
        <line
          key={i}
          x1={0}
          y1={0}
          x2={pos.x}
          y2={pos.y}
          stroke={colors.primary}
          strokeOpacity={0.06}
          strokeWidth={0.5}
        />
      ))}

      {/* Ghost hex background */}
      <polygon
        points={ghostPoints}
        fill={colors.primary}
        fillOpacity={0.04}
        stroke={colors.primary}
        strokeOpacity={0.15}
        strokeWidth={0.6}
        filter={`url(#${glowFilterId})`}
      />

      {/* Center icon */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.primary}
        fillOpacity={0.3}
        fontSize={size * 0.5}
        fontFamily="var(--font-sans, system-ui)"
        style={{ pointerEvents: "none" }}
      >
        ⬡
      </text>
    </g>
  );
});
