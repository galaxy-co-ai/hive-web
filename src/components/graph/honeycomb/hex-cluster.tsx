"use client";

import { memo, useMemo } from "react";
import type { HexCluster } from "./types";
import { HEX_SIZE } from "./types";

interface HexClusterBackgroundProps {
  cluster: HexCluster;
}

function HexClusterBackgroundComponent({ cluster }: HexClusterBackgroundProps) {
  const { bounds, color, label } = cluster;

  // Add padding around the cluster bounds
  const padding = HEX_SIZE * 0.5;
  const x = bounds.minX - padding;
  const y = bounds.minY - padding;
  const width = bounds.maxX - bounds.minX + padding * 2;
  const height = bounds.maxY - bounds.minY + padding * 2;
  const borderRadius = HEX_SIZE * 0.4;

  // Position label at top of cluster
  const labelX = x + width / 2;
  const labelY = bounds.minY - padding * 0.3;

  return (
    <g className="hex-cluster">
      {/* Background rectangle */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={borderRadius}
        ry={borderRadius}
        fill={color}
        stroke={color.replace("0.1)", "0.3)")}
        strokeWidth={1}
        className="transition-colors duration-150"
      />

      {/* Cluster label */}
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill="#64748b"
        className="select-none pointer-events-none"
      >
        {label}
      </text>
    </g>
  );
}

export const HexClusterBackground = memo(HexClusterBackgroundComponent);
