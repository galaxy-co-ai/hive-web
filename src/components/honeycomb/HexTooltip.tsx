"use client";

import { memo } from "react";
import { createPortal } from "react-dom";
import type { HexTooltipProps } from "./types";
import { TOOLTIP_OFFSET_X, TOOLTIP_OFFSET_Y, TOOLTIP_MAX_WIDTH } from "./utils/constants";
import { HEX_COLORS } from "./utils/constants";

/**
 * Tooltip that follows the cursor and displays hex information.
 * Rendered as a portal to avoid SVG clipping issues.
 */
export const HexTooltip = memo(function HexTooltip({
  hex,
  x,
  y,
  visible,
}: HexTooltipProps) {
  if (!visible || !hex) return null;

  // Only render on client
  if (typeof window === "undefined") return null;

  const colors = HEX_COLORS[hex.type];

  // Calculate position with offset
  let left = x + TOOLTIP_OFFSET_X;
  let top = y + TOOLTIP_OFFSET_Y;

  // Adjust if tooltip would go off screen
  const tooltipWidth = TOOLTIP_MAX_WIDTH;
  const tooltipHeight = 120; // Approximate height

  if (left + tooltipWidth > window.innerWidth - 20) {
    left = x - tooltipWidth - TOOLTIP_OFFSET_X;
  }

  if (top + tooltipHeight > window.innerHeight - 20) {
    top = y - tooltipHeight - TOOLTIP_OFFSET_Y;
  }

  const content = (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left,
        top,
        maxWidth: TOOLTIP_MAX_WIDTH,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(4px)",
        transition: "opacity 150ms ease-out, transform 150ms ease-out",
      }}
    >
      <div
        className="rounded-lg border shadow-2xl backdrop-blur-sm"
        style={{
          backgroundColor: "rgba(15, 16, 21, 0.95)",
          borderColor: colors.border,
        }}
      >
        {/* Header */}
        <div
          className="px-3 py-2 border-b"
          style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
        >
          <div className="flex items-center gap-2">
            {/* Type badge */}
            <span
              className="px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase"
              style={{
                backgroundColor: colors.primary,
                color: "#fff",
              }}
            >
              {hex.type}
            </span>
            {/* Name */}
            <span className="font-medium text-white text-sm truncate">
              {hex.name}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-3 py-2 space-y-2">
          {/* Description */}
          {hex.description && (
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
              {hex.description}
            </p>
          )}

          {/* Entry hints */}
          {hex.entryHints.length > 0 && (
            <div>
              <span className="text-xs text-gray-500 font-medium">Triggers: </span>
              <span className="text-xs text-gray-400">
                {hex.entryHints.slice(0, 3).join(", ")}
                {hex.entryHints.length > 3 && ` +${hex.entryHints.length - 3} more`}
              </span>
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>
              <span className="font-mono">{hex.edges.length}</span> edges
            </span>
            <span>
              <span className="font-mono">{hex.tags.length}</span> tags
            </span>
          </div>
        </div>

        {/* Footer hint */}
        <div
          className="px-3 py-1.5 border-t text-xs text-gray-500"
          style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
        >
          Click to {hex.edges.length > 0 ? "explore" : "view details"}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
});
