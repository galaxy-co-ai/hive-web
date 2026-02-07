import type { Hex } from "@/lib/schemas";

// ============================================
// VIEW STATE
// ============================================

export interface ViewState {
  /** Current pan offset in canvas coordinates */
  x: number;
  y: number;
  /** Current zoom scale (1 = 100%) */
  scale: number;
}

// ============================================
// EXTRACTION STATE (floating overlay drill-down)
// ============================================

export interface ExtractionState {
  /** Whether the extraction overlay is open */
  isOpen: boolean;
  /** Stack of extracted hexes [parent, child, grandchild...] */
  stack: import("@/lib/schemas").Hex[];
  /** Active hex ID for base map highlighting */
  activeHexId: string | null;
}

// ============================================
// HEX RENDER DATA
// ============================================

export interface HexPosition {
  /** Pixel X coordinate (center) */
  x: number;
  /** Pixel Y coordinate (center) */
  y: number;
  /** Axial Q coordinate */
  q: number;
  /** Axial R coordinate */
  r: number;
}

export interface HexRenderData {
  /** Original hex data */
  hex: Hex;
  /** Computed position */
  position: HexPosition;
  /** Index in layout (for staggered animations) */
  index: number;
  /** Whether this hex has children (edges leading to other hexes) */
  hasChildren: boolean;
  /** Number of outgoing edges */
  childCount: number;
}

// ============================================
// INTERACTION STATE
// ============================================

export interface HoverState {
  hexId: string | null;
  mouseX: number;
  mouseY: number;
}

export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  startPanX: number;
  startPanY: number;
}

// ============================================
// ANIMATION STATE
// ============================================

export interface EntranceAnimationState {
  /** Whether entrance animation is active */
  isAnimating: boolean;
  /** Animation start timestamp */
  startTime: number;
  /** Duration of entrance animation in ms */
  duration: number;
}

// ============================================
// COMPONENT PROPS
// ============================================

export interface HexNodeProps {
  data: HexRenderData;
  isHovered: boolean;
  /** Whether this hex is the active parent in extraction overlay */
  isActive?: boolean;
  pulseOpacity: number;
  entranceProgress: number;
  onClick: (hex: Hex) => void;
  onMouseEnter: (hex: Hex, e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
}

export interface HexTooltipProps {
  hex: Hex | null;
  x: number;
  y: number;
  visible: boolean;
}

export interface ConnectionLinesProps {
  hexes: HexRenderData[];
  allHexIds: Set<string>;
}

export interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitAll: () => void;
}

export interface ExtractionOverlayProps {
  /** Stack of extracted hexes [parent, child, grandchild...] */
  stack: Hex[];
  /** All hexes in the hive */
  allHexes: Hex[];
  /** Close the overlay (or pop stack if nested) */
  onClose: () => void;
  /** Drill deeper into a child hex */
  onDrillDeeper: (hex: Hex) => void;
}

export interface GhostParentProps {
  /** The parent hex to render as ghost */
  parentHex: Hex;
  /** Positions of child hexes (for connection lines) */
  childPositions: { x: number; y: number }[];
  /** Size of the ghost hex (relative to children) */
  size: number;
}

export interface HoneycombCanvasProps {
  hexes: Hex[];
}
