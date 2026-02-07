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
// NAVIGATION STATE
// ============================================

export interface NavigationState {
  /** Stack of parent hex IDs for drill-down breadcrumb */
  path: string[];
  /** Currently focused hex ID (or null for root view) */
  currentParentId: string | null;
}

export interface BreadcrumbItem {
  id: string | null;
  label: string;
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

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (id: string | null) => void;
}

export interface HoneycombCanvasProps {
  hexes: Hex[];
}
