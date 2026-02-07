import type { HexType } from "@/lib/schemas";

// ============================================
// CANVAS & LAYOUT
// ============================================

/** Size of hexagon (center to corner) */
export const HEX_SIZE = 52;

/** Gap between hexagons */
export const HEX_GAP = 8;

/** Effective radius including gap */
export const HEX_RADIUS = HEX_SIZE + HEX_GAP / 2;

/** Canvas background color */
export const CANVAS_BG = "#0a0b0f";

/** Default canvas padding */
export const CANVAS_PADDING = 100;

// ============================================
// COLORS BY HEX TYPE
// ============================================

export interface HexColors {
  /** Primary color for fills and glows */
  primary: string;
  /** Glow color (often same as primary with transparency) */
  glow: string;
  /** Inner fill gradient start */
  innerStart: string;
  /** Inner fill gradient end */
  innerEnd: string;
  /** Border color */
  border: string;
  /** Text color for labels */
  text: string;
}

export const HEX_COLORS: Record<HexType, HexColors> = {
  data: {
    primary: "#3b82f6",      // Blue-500
    glow: "#3b82f680",       // Blue with 50% opacity
    innerStart: "#1e3a5f",
    innerEnd: "#0f1729",
    border: "#3b82f6",
    text: "#93c5fd",         // Blue-300
  },
  tool: {
    primary: "#22c55e",      // Green-500
    glow: "#22c55e80",
    innerStart: "#14532d",
    innerEnd: "#0f1f12",
    border: "#22c55e",
    text: "#86efac",         // Green-300
  },
  gateway: {
    primary: "#a855f7",      // Purple-500
    glow: "#a855f780",
    innerStart: "#3b0764",
    innerEnd: "#1a0a2e",
    border: "#a855f7",
    text: "#d8b4fe",         // Purple-300
  },
  junction: {
    primary: "#f59e0b",      // Amber-500
    glow: "#f59e0b80",
    innerStart: "#451a03",
    innerEnd: "#1f0f02",
    border: "#f59e0b",
    text: "#fcd34d",         // Amber-300
  },
};

// ============================================
// ANIMATION TIMING
// ============================================

/** Entrance animation stagger delay per hex (ms) */
export const ENTRANCE_STAGGER = 30;

/** Entrance animation duration per hex (ms) */
export const ENTRANCE_DURATION = 400;

/** Total entrance animation duration (ms) */
export const ENTRANCE_TOTAL_DURATION = 800;

/** Pulse animation speed (radians per frame) */
export const PULSE_SPEED = 0.008;

/** Pulse animation offset between hexes */
export const PULSE_OFFSET = 0.5;

/** Pulse animation max opacity */
export const PULSE_MAX_OPACITY = 0.12;

// ============================================
// ZOOM SETTINGS
// ============================================

/** Minimum zoom scale */
export const MIN_ZOOM = 0.1;

/** Maximum zoom scale */
export const MAX_ZOOM = 4;

/** Zoom step for button controls */
export const ZOOM_STEP = 0.2;

/** Zoom sensitivity for wheel */
export const ZOOM_SENSITIVITY = 0.001;

// ============================================
// GLOW EFFECT SETTINGS
// ============================================

/** Blur radius for outer glow (idle) */
export const GLOW_BLUR_IDLE = 8;

/** Blur radius for outer glow (hover) */
export const GLOW_BLUR_HOVER = 20;

/** Glow spread radius */
export const GLOW_SPREAD = 4;

// ============================================
// TOOLTIP SETTINGS
// ============================================

/** Tooltip offset from cursor (X) */
export const TOOLTIP_OFFSET_X = 16;

/** Tooltip offset from cursor (Y) */
export const TOOLTIP_OFFSET_Y = 16;

/** Maximum tooltip width */
export const TOOLTIP_MAX_WIDTH = 280;

// ============================================
// CONNECTION LINE SETTINGS
// ============================================

/** Stroke width for connection lines */
export const CONNECTION_STROKE_WIDTH = 1.5;

/** Dash array for connection lines */
export const CONNECTION_DASH_ARRAY = "4 4";

/** Connection line color */
export const CONNECTION_COLOR = "rgba(255, 255, 255, 0.15)";

/** Connection line hover color */
export const CONNECTION_HOVER_COLOR = "rgba(255, 255, 255, 0.4)";
