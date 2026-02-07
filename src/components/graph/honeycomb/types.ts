import type { Hex, HexType } from "@/lib/schemas";

// Axial coordinates (q, r) for hex grid positioning
export interface AxialCoord {
  q: number;
  r: number;
}

// Hex with layout position computed
export interface LayoutHex {
  hex: Hex;
  q: number;
  r: number;
  x: number;
  y: number;
  clusterId: string;
}

// Cluster of hexes from the same source document
export interface HexCluster {
  id: string;
  label: string;
  hexIds: string[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  color: string;
}

// Edge between two hex positions
export interface LayoutEdge {
  id: string;
  fromHexId: string;
  toHexId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  priority: number;
  description: string;
}

// Complete layout result
export interface LayoutResult {
  hexes: LayoutHex[];
  edges: LayoutEdge[];
  clusters: HexCluster[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
}

// Type colors - matching existing scheme
export const TYPE_COLORS: Record<HexType, { fill: string; stroke: string; text: string }> = {
  data: { fill: "#dbeafe", stroke: "#3b82f6", text: "#1e40af" },
  tool: { fill: "#dcfce7", stroke: "#22c55e", text: "#166534" },
  gateway: { fill: "#f3e8ff", stroke: "#a855f7", text: "#7c3aed" },
  junction: { fill: "#fef3c7", stroke: "#f59e0b", text: "#b45309" },
};

// Cluster background colors (muted pastels)
export const CLUSTER_COLORS = [
  "rgba(59, 130, 246, 0.1)", // blue
  "rgba(34, 197, 94, 0.1)",  // green
  "rgba(168, 85, 247, 0.1)", // purple
  "rgba(245, 158, 11, 0.1)", // amber
  "rgba(236, 72, 153, 0.1)", // pink
  "rgba(20, 184, 166, 0.1)", // teal
];

// Hex geometry constants (pointy-top orientation)
export const HEX_SIZE = 50; // Distance from center to corner
export const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE; // ~86.6
export const HEX_HEIGHT = 2 * HEX_SIZE; // 100
export const HEX_HORIZ_SPACING = HEX_WIDTH;
export const HEX_VERT_SPACING = HEX_HEIGHT * 0.75; // 75 (overlapping rows)
