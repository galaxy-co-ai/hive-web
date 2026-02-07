import { defineHex, Grid, spiral, Orientation } from "honeycomb-grid";
import type { Hex } from "@/lib/schemas";
import {
  type LayoutHex,
  type LayoutEdge,
  type HexCluster,
  type LayoutResult,
  HEX_SIZE,
  CLUSTER_COLORS,
} from "./types";

// Define our hex type using honeycomb-grid
const HexTile = defineHex({
  dimensions: HEX_SIZE,
  orientation: Orientation.POINTY,
  origin: "topLeft",
});

// Extract source document from tags
function getSourceFromTags(tags: string[]): string {
  // Look for source: prefix or just use first tag
  const sourceTag = tags.find((t) => t.startsWith("source:"));
  if (sourceTag) return sourceTag.replace("source:", "");
  // If no source tag, use first tag or "uncategorized"
  return tags[0] || "uncategorized";
}

// Group hexes by their source document
function groupBySource(hexes: Hex[]): Map<string, Hex[]> {
  const groups = new Map<string, Hex[]>();
  for (const hex of hexes) {
    const source = getSourceFromTags(hex.tags);
    if (!groups.has(source)) {
      groups.set(source, []);
    }
    groups.get(source)!.push(hex);
  }
  return groups;
}

// Generate spiral coordinates for a cluster of hexes
function* spiralCoords(count: number): Generator<{ q: number; r: number }> {
  if (count === 0) return;

  // Center hex
  yield { q: 0, r: 0 };
  if (count === 1) return;

  // Spiral outward
  let ring = 1;
  let generated = 1;

  while (generated < count) {
    // Each ring has 6 * ring hexes
    // Start at "east" position and go counter-clockwise
    const directions = [
      { dq: 0, dr: -1 },  // NW
      { dq: -1, dr: 0 },  // W
      { dq: -1, dr: 1 },  // SW
      { dq: 0, dr: 1 },   // SE
      { dq: 1, dr: 0 },   // E
      { dq: 1, dr: -1 },  // NE
    ];

    // Start position: ring hexes east
    let q = ring;
    let r = 0;

    for (const dir of directions) {
      for (let i = 0; i < ring; i++) {
        yield { q, r };
        generated++;
        if (generated >= count) return;

        q += dir.dq;
        r += dir.dr;
      }
    }

    ring++;
  }
}

// Convert axial to pixel coordinates (pointy-top)
function axialToPixel(q: number, r: number): { x: number; y: number } {
  const x = HEX_SIZE * Math.sqrt(3) * (q + r / 2);
  const y = HEX_SIZE * (3 / 2) * r;
  return { x, y };
}

// Compute the layout for all hexes
export function computeLayout(hexes: Hex[]): LayoutResult {
  if (hexes.length === 0) {
    return {
      hexes: [],
      edges: [],
      clusters: [],
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
    };
  }

  const groups = groupBySource(hexes);
  const layoutHexes: LayoutHex[] = [];
  const clusters: HexCluster[] = [];
  const hexPositions = new Map<string, { x: number; y: number }>();

  // Calculate cluster offset based on cluster size
  let clusterOffsetX = 0;
  let colorIndex = 0;

  for (const [source, sourceHexes] of groups) {
    const clusterId = `cluster-${source}`;
    const hexIds: string[] = [];

    // Generate spiral positions for this cluster
    const coords = [...spiralCoords(sourceHexes.length)];

    // Place hexes
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (let i = 0; i < sourceHexes.length; i++) {
      const hex = sourceHexes[i];
      const { q, r } = coords[i];
      const local = axialToPixel(q, r);

      const x = local.x + clusterOffsetX;
      const y = local.y;

      layoutHexes.push({
        hex,
        q,
        r,
        x,
        y,
        clusterId,
      });

      hexPositions.set(hex.id, { x, y });
      hexIds.push(hex.id);

      // Track bounds
      minX = Math.min(minX, x - HEX_SIZE);
      minY = Math.min(minY, y - HEX_SIZE);
      maxX = Math.max(maxX, x + HEX_SIZE);
      maxY = Math.max(maxY, y + HEX_SIZE);
    }

    clusters.push({
      id: clusterId,
      label: source,
      hexIds,
      bounds: { minX, minY, maxX, maxY },
      color: CLUSTER_COLORS[colorIndex % CLUSTER_COLORS.length],
    });

    // Move offset for next cluster
    clusterOffsetX = maxX + HEX_SIZE * 3;
    colorIndex++;
  }

  // Build valid hex IDs set for edge validation
  const validHexIds = new Set(hexes.map((h) => h.id));

  // Create edges
  const layoutEdges: LayoutEdge[] = [];
  for (const hex of hexes) {
    const fromPos = hexPositions.get(hex.id);
    if (!fromPos) continue;

    for (const edge of hex.edges) {
      // Skip external edges and edges to non-existent hexes
      if (edge.to.startsWith("external:") || !validHexIds.has(edge.to)) {
        continue;
      }

      const toPos = hexPositions.get(edge.to);
      if (!toPos) continue;

      layoutEdges.push({
        id: `${hex.id}-${edge.id}`,
        fromHexId: hex.id,
        toHexId: edge.to,
        fromX: fromPos.x,
        fromY: fromPos.y,
        toX: toPos.x,
        toY: toPos.y,
        priority: edge.priority,
        description: edge.description,
      });
    }
  }

  // Calculate overall bounds
  let globalMinX = Infinity,
    globalMinY = Infinity,
    globalMaxX = -Infinity,
    globalMaxY = -Infinity;

  for (const cluster of clusters) {
    globalMinX = Math.min(globalMinX, cluster.bounds.minX);
    globalMinY = Math.min(globalMinY, cluster.bounds.minY);
    globalMaxX = Math.max(globalMaxX, cluster.bounds.maxX);
    globalMaxY = Math.max(globalMaxY, cluster.bounds.maxY);
  }

  // Add padding
  const padding = HEX_SIZE * 2;
  globalMinX -= padding;
  globalMinY -= padding;
  globalMaxX += padding;
  globalMaxY += padding;

  return {
    hexes: layoutHexes,
    edges: layoutEdges,
    clusters,
    bounds: {
      minX: globalMinX,
      minY: globalMinY,
      maxX: globalMaxX,
      maxY: globalMaxY,
      width: globalMaxX - globalMinX,
      height: globalMaxY - globalMinY,
    },
  };
}
