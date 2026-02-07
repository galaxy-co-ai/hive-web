"use client";

import { memo, useMemo } from "react";
import type { LayoutHex } from "./types";
import { TYPE_COLORS, HEX_SIZE } from "./types";

interface HexCellProps {
  layoutHex: LayoutHex;
  onClick?: (hexId: string) => void;
  isSelected?: boolean;
}

// Generate pointy-top hexagon points
function getHexPoints(size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i - 30; // Start at -30 degrees for pointy-top
    const angleRad = (Math.PI / 180) * angleDeg;
    const x = size * Math.cos(angleRad);
    const y = size * Math.sin(angleRad);
    points.push(`${x},${y}`);
  }
  return points.join(" ");
}

function HexCellComponent({ layoutHex, onClick, isSelected }: HexCellProps) {
  const { hex, x, y } = layoutHex;
  const colors = TYPE_COLORS[hex.type];

  const hexPoints = useMemo(() => getHexPoints(HEX_SIZE - 2), []);

  const handleClick = () => {
    onClick?.(hex.id);
  };

  // Truncate name for display
  const displayName = hex.name.length > 16 ? hex.name.slice(0, 14) + "…" : hex.name;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
      className="hex-cell"
    >
      {/* Hex background */}
      <polygon
        points={hexPoints}
        fill={colors.fill}
        stroke={isSelected ? colors.text : colors.stroke}
        strokeWidth={isSelected ? 3 : 2}
        className="transition-all duration-150"
      />

      {/* Selection glow */}
      {isSelected && (
        <polygon
          points={getHexPoints(HEX_SIZE + 4)}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={2}
          opacity={0.5}
        />
      )}

      {/* Type label */}
      <text
        y={-HEX_SIZE * 0.35}
        textAnchor="middle"
        fontSize={9}
        fontWeight={600}
        fill={colors.text}
        className="uppercase tracking-wider select-none pointer-events-none"
      >
        {hex.type}
      </text>

      {/* Hex name */}
      <text
        y={5}
        textAnchor="middle"
        fontSize={11}
        fontWeight={500}
        fill={colors.text}
        className="select-none pointer-events-none"
      >
        {displayName}
      </text>

      {/* Edge count */}
      <text
        y={HEX_SIZE * 0.4}
        textAnchor="middle"
        fontSize={9}
        fill={colors.text}
        opacity={0.7}
        className="select-none pointer-events-none"
      >
        {hex.edges.length} edge{hex.edges.length !== 1 ? "s" : ""}
      </text>

      {/* Hover effect overlay */}
      <polygon
        points={hexPoints}
        fill="white"
        opacity={0}
        className="hover:opacity-10 transition-opacity duration-150"
      />
    </g>
  );
}

export const HexCell = memo(HexCellComponent);
