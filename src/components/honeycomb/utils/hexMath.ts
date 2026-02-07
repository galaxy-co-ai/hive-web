import { HEX_SIZE, HEX_GAP } from "./constants";
import type { HexPosition } from "../types";

// ============================================
// FLAT-TOP HEXAGON GEOMETRY
// ============================================

/**
 * Calculate a corner point of a flat-top hexagon
 * @param cx - Center X coordinate
 * @param cy - Center Y coordinate
 * @param size - Hexagon size (center to corner)
 * @param i - Corner index (0-5, starting from right, going clockwise)
 * @returns { x, y } coordinates of the corner
 */
export function hexCorner(
  cx: number,
  cy: number,
  size: number,
  i: number
): { x: number; y: number } {
  // Flat-top: angle = 60 * i - 30 degrees
  const angleDeg = 60 * i - 30;
  const angleRad = (Math.PI / 180) * angleDeg;
  return {
    x: cx + size * Math.cos(angleRad),
    y: cy + size * Math.sin(angleRad),
  };
}

/**
 * Generate SVG points string for a flat-top hexagon
 * @param cx - Center X coordinate
 * @param cy - Center Y coordinate
 * @param size - Hexagon size (center to corner)
 * @returns SVG-compatible points string "x1,y1 x2,y2 ..."
 */
export function hexPoints(cx: number, cy: number, size: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const { x, y } = hexCorner(cx, cy, size, i);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

/**
 * Get array of corner coordinates for a flat-top hexagon
 */
export function hexCornersArray(
  cx: number,
  cy: number,
  size: number
): { x: number; y: number }[] {
  return Array.from({ length: 6 }, (_, i) => hexCorner(cx, cy, size, i));
}

// ============================================
// AXIAL COORDINATE SYSTEM
// ============================================

/**
 * Convert axial coordinates to pixel coordinates (flat-top orientation)
 * @param q - Axial Q coordinate
 * @param r - Axial R coordinate
 * @param size - Hexagon size (center to corner)
 * @param gap - Gap between hexagons
 * @returns { x, y } pixel coordinates
 */
export function axialToPixel(
  q: number,
  r: number,
  size: number = HEX_SIZE,
  gap: number = HEX_GAP
): { x: number; y: number } {
  const effectiveSize = size + gap / 2;
  const x = effectiveSize * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = effectiveSize * ((3 / 2) * r);
  return { x, y };
}

/**
 * Convert pixel coordinates to axial coordinates (flat-top orientation)
 * Used for hit testing and layout calculations
 */
export function pixelToAxial(
  px: number,
  py: number,
  size: number = HEX_SIZE,
  gap: number = HEX_GAP
): { q: number; r: number } {
  const effectiveSize = size + gap / 2;
  const q = ((Math.sqrt(3) / 3) * px - (1 / 3) * py) / effectiveSize;
  const r = ((2 / 3) * py) / effectiveSize;
  return { q, r };
}

// ============================================
// SPIRAL LAYOUT
// ============================================

/** Axial direction vectors for the 6 neighbors (flat-top) */
const AXIAL_DIRECTIONS: [number, number][] = [
  [1, 0],   // E
  [1, -1],  // NE
  [0, -1],  // NW
  [-1, 0],  // W
  [-1, 1],  // SW
  [0, 1],   // SE
];

/**
 * Generate spiral positions for N hexes in axial coordinates
 * Starts at center (0,0) and spirals outward
 * @param count - Number of positions to generate
 * @returns Array of axial coordinate pairs [q, r]
 */
export function spiralPositions(count: number): [number, number][] {
  if (count <= 0) return [];

  const positions: [number, number][] = [[0, 0]]; // Center

  if (count === 1) return positions;

  let ring = 1;

  while (positions.length < count) {
    // Start at the "east" edge of this ring
    let q = ring;
    let r = 0;

    // Walk around the ring in 6 segments
    for (let side = 0; side < 6 && positions.length < count; side++) {
      // Each side has 'ring' hexes
      for (let step = 0; step < ring && positions.length < count; step++) {
        positions.push([q, r]);

        // Move in the direction for this side
        const [dq, dr] = AXIAL_DIRECTIONS[(side + 2) % 6];
        q += dq;
        r += dr;
      }
    }

    ring++;
  }

  return positions;
}

/**
 * Generate positioned hex data with pixel coordinates
 * @param count - Number of hexes to position
 * @returns Array of HexPosition objects
 */
export function generateHexPositions(count: number): HexPosition[] {
  return spiralPositions(count).map(([q, r], index) => {
    const { x, y } = axialToPixel(q, r);
    return { x, y, q, r };
  });
}

// ============================================
// BOUNDING BOX & FIT CALCULATIONS
// ============================================

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * Calculate bounding box for a set of hex positions
 */
export function calculateBoundingBox(positions: HexPosition[]): BoundingBox {
  if (positions.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0,
    };
  }

  const margin = HEX_SIZE + HEX_GAP;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const pos of positions) {
    minX = Math.min(minX, pos.x - margin);
    minY = Math.min(minY, pos.y - margin);
    maxX = Math.max(maxX, pos.x + margin);
    maxY = Math.max(maxY, pos.y + margin);
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return { minX, minY, maxX, maxY, width, height, centerX, centerY };
}

/**
 * Calculate the transform to fit content within a viewport
 */
export function calculateFitTransform(
  boundingBox: BoundingBox,
  viewportWidth: number,
  viewportHeight: number,
  padding: number = 50
): { x: number; y: number; scale: number } {
  const availableWidth = viewportWidth - padding * 2;
  const availableHeight = viewportHeight - padding * 2;

  if (boundingBox.width === 0 || boundingBox.height === 0) {
    return { x: viewportWidth / 2, y: viewportHeight / 2, scale: 1 };
  }

  const scaleX = availableWidth / boundingBox.width;
  const scaleY = availableHeight / boundingBox.height;
  const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in past 1x

  const x = viewportWidth / 2 - boundingBox.centerX * scale;
  const y = viewportHeight / 2 - boundingBox.centerY * scale;

  return { x, y, scale };
}

// ============================================
// DISTANCE & NEIGHBOR CALCULATIONS
// ============================================

/**
 * Calculate distance between two axial coordinates
 */
export function axialDistance(
  q1: number,
  r1: number,
  q2: number,
  r2: number
): number {
  return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
}

/**
 * Get neighbor positions for a hex at given axial coordinates
 */
export function getNeighbors(q: number, r: number): [number, number][] {
  return AXIAL_DIRECTIONS.map(([dq, dr]) => [q + dq, r + dr]);
}
