"use client";

import { memo, useMemo } from "react";
import type { HexNodeProps } from "./types";
import { hexPoints } from "./utils/hexMath";
import {
  HEX_SIZE,
  HEX_COLORS,
  GLOW_BLUR_IDLE,
  GLOW_BLUR_HOVER,
} from "./utils/constants";
import { easeOutCubic } from "./hooks/useEntranceAnimation";

/**
 * Individual hexagon node with 7-layer rendering:
 * 1. Outer glow (filter blur, visible on hover)
 * 2. Background polygon (dark fill)
 * 3. Inner polygon (gradient fill)
 * 4. Type badge (small hex or icon)
 * 5. Label text (hex name)
 * 6. Child count (if has children)
 * 7. Pulse overlay (breathing animation)
 */
export const HexNode = memo(function HexNode({
  data,
  isHovered,
  pulseOpacity,
  entranceProgress,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
}: HexNodeProps) {
  const { hex, position, index, hasChildren, childCount } = data;
  const colors = HEX_COLORS[hex.type];

  // Apply entrance animation easing
  const easedProgress = easeOutCubic(entranceProgress);

  // Entrance animation: scale up and fade in
  const scale = easedProgress;
  const opacity = easedProgress;

  // Calculate transform for entrance animation
  const transform = `translate(${position.x}, ${position.y}) scale(${scale})`;

  // Generate hex points centered at origin (transform moves it)
  const points = useMemo(() => hexPoints(0, 0, HEX_SIZE), []);
  const innerPoints = useMemo(() => hexPoints(0, 0, HEX_SIZE * 0.85), []);

  // Glow blur based on hover state
  const glowBlur = isHovered ? GLOW_BLUR_HOVER : GLOW_BLUR_IDLE;

  // Unique IDs for gradients and filters
  const gradientId = `hex-gradient-${hex.id}`;
  const glowFilterId = `hex-glow-${hex.id}`;

  // Truncate name if too long
  const displayName =
    hex.name.length > 14 ? hex.name.slice(0, 12) + "..." : hex.name;

  // Type badge text
  const typeLabel = hex.type.charAt(0).toUpperCase();

  return (
    <g
      className="hex-node cursor-pointer"
      style={{
        opacity,
        transition: isHovered
          ? "filter 150ms ease-out"
          : "filter 300ms ease-out, opacity 300ms ease-out",
      }}
      transform={transform}
      onClick={() => onClick(hex)}
      onMouseEnter={(e) => onMouseEnter(hex, e)}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    >
      {/* Defs for this hex */}
      <defs>
        {/* Radial gradient for inner fill */}
        <radialGradient id={gradientId} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={colors.innerStart} />
          <stop offset="100%" stopColor={colors.innerEnd} />
        </radialGradient>

        {/* Glow filter */}
        <filter
          id={glowFilterId}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur stdDeviation={glowBlur} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Layer 1: Outer glow */}
      <polygon
        points={points}
        fill={colors.glow}
        filter={`url(#${glowFilterId})`}
        style={{
          opacity: isHovered ? 0.8 : 0.3,
          transition: "opacity 150ms ease-out",
        }}
      />

      {/* Layer 2: Background polygon (dark base) */}
      <polygon
        points={points}
        fill="#0f1015"
        stroke={colors.border}
        strokeWidth={isHovered ? 2 : 1.5}
        style={{
          transition: "stroke-width 150ms ease-out",
        }}
      />

      {/* Layer 3: Inner polygon (gradient fill) */}
      <polygon
        points={innerPoints}
        fill={`url(#${gradientId})`}
        opacity={0.6}
      />

      {/* Layer 4: Type badge (top-left) */}
      <g transform="translate(-28, -22)">
        <circle r={10} fill={colors.primary} opacity={0.9} />
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontSize={10}
          fontWeight={600}
          fontFamily="var(--font-mono, monospace)"
        >
          {typeLabel}
        </text>
      </g>

      {/* Layer 5: Label text (hex name) */}
      <text
        y={4}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.text}
        fontSize={12}
        fontWeight={500}
        fontFamily="var(--font-sans, system-ui)"
        style={{ pointerEvents: "none" }}
      >
        {displayName}
      </text>

      {/* Layer 6: Child count badge (if has children) */}
      {hasChildren && (
        <g transform="translate(28, 22)">
          <circle r={10} fill="#1f2937" stroke={colors.border} strokeWidth={1} />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill={colors.text}
            fontSize={9}
            fontWeight={600}
            fontFamily="var(--font-mono, monospace)"
          >
            {childCount}
          </text>
        </g>
      )}

      {/* Layer 7: Pulse overlay (breathing animation) */}
      {pulseOpacity > 0 && (
        <polygon
          points={points}
          fill={colors.primary}
          opacity={pulseOpacity}
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Hover indicator */}
      {isHovered && (
        <polygon
          points={points}
          fill="transparent"
          stroke={colors.primary}
          strokeWidth={3}
          opacity={0.5}
          style={{ pointerEvents: "none" }}
        />
      )}
    </g>
  );
});
