"use client";

import { memo, useCallback, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import type { Hex } from "@/lib/schemas";
import type { ExtractionOverlayProps, HoverState } from "./types";
import { useState } from "react";
import { usePanZoom } from "./hooks/usePanZoom";
import { useHexLayout, getChildHexes } from "./hooks/useHexLayout";
import { usePulseAnimation } from "./hooks/usePulseAnimation";
import { useEntranceAnimation } from "./hooks/useEntranceAnimation";
import { HexNode } from "./HexNode";
import { HexTooltip } from "./HexTooltip";
import { ConnectionLines } from "./ConnectionLines";
import { GhostParent } from "./GhostParent";
import { HEX_COLORS, HEX_SIZE } from "./utils/constants";

/**
 * Floating extraction overlay for drill-down navigation.
 * Renders children of the selected hex in a floating layer above the base map.
 */
export const ExtractionOverlay = memo(function ExtractionOverlay({
  stack,
  allHexes,
  onClose,
  onDrillDeeper,
}: ExtractionOverlayProps) {
  // Current parent is the last item in the stack
  const parentHex = stack[stack.length - 1];

  // Get children of the current parent
  const childHexes = useMemo(
    () => getChildHexes(parentHex, allHexes),
    [parentHex, allHexes]
  );

  // All hex IDs for connection line filtering
  const allHexIds = useMemo(
    () => new Set(childHexes.map((h) => h.id)),
    [childHexes]
  );

  // Layout computation for children
  const { layoutData, boundingBox, hexMap } = useHexLayout({
    hexes: childHexes,
    allHexIds,
  });

  // Pan/zoom state (independent from base map)
  const {
    view,
    containerRef,
    handlers,
    fitAll,
    isDragging,
  } = usePanZoom();

  // Fit content on initial load and when parent changes
  useEffect(() => {
    if (layoutData.length > 0 && containerRef.current) {
      const timer = setTimeout(() => {
        fitAll(boundingBox, 0.6); // 60% padding for extraction
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [parentHex.id, layoutData.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pulse animation
  const { getPulseOpacity } = usePulseAnimation({
    hexCount: layoutData.length,
    enabled: true,
  });

  // Entrance animation
  const { getEntranceProgress } = useEntranceAnimation({
    hexCount: layoutData.length,
    triggerKey: parentHex.id,
    enabled: true,
    staggerDelay: 40,
    duration: 350,
  });

  // Hover state
  const [hoverState, setHoverState] = useState<HoverState>({
    hexId: null,
    mouseX: 0,
    mouseY: 0,
  });

  // Hover handlers
  const handleHexMouseEnter = useCallback((hex: Hex, e: React.MouseEvent) => {
    setHoverState({
      hexId: hex.id,
      mouseX: e.clientX,
      mouseY: e.clientY,
    });
  }, []);

  const handleHexMouseMove = useCallback((e: React.MouseEvent) => {
    setHoverState((prev) => ({
      ...prev,
      mouseX: e.clientX,
      mouseY: e.clientY,
    }));
  }, []);

  const handleHexMouseLeave = useCallback(() => {
    setHoverState((prev) => ({ ...prev, hexId: null }));
  }, []);

  // Click handler for drilling deeper
  const handleHexClick = useCallback(
    (hex: Hex) => {
      const hasChildren = hex.edges.some((e) => allHexes.some((h) => h.id === e.to));
      if (hasChildren) {
        onDrillDeeper(hex);
      } else {
        console.log("Selected hex:", hex.id, hex.name);
      }
    },
    [allHexes, onDrillDeeper]
  );

  // Backdrop click closes
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Get hovered hex data for tooltip
  const hoveredHex = hoverState.hexId
    ? hexMap.get(hoverState.hexId)?.hex ?? null
    : null;

  // SVG transform string
  const svgTransform = `translate(${view.x}, ${view.y}) scale(${view.scale})`;

  // Parent colors for header
  const parentColors = HEX_COLORS[parentHex.type];

  // Child positions for ghost parent connection lines
  const childPositions = useMemo(
    () => layoutData.map((d) => ({ x: d.position.x, y: d.position.y })),
    [layoutData]
  );

  // Ghost parent size (45% of child hex size)
  const ghostSize = HEX_SIZE * 0.45;

  return (
    <div
      className="fixed inset-0 z-40"
      onClick={handleBackdropClick}
      style={{
        animation: "fadeIn 300ms ease-out forwards",
      }}
    >
      {/* Overlay header */}
      <div
        className="fixed top-[60px] left-0 right-0 z-50 flex items-center justify-center gap-3 pointer-events-none"
        style={{
          animation: "slideDown 300ms ease-out 100ms both",
        }}
      >
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-900/95 border border-gray-700 backdrop-blur-sm pointer-events-auto">
          {/* Colored dot */}
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: parentColors.primary }}
          />

          {/* Parent name */}
          <span className="text-white font-medium">{parentHex.name}</span>

          {/* Meta text */}
          <span className="text-gray-400 text-sm">
            {childHexes.length} sub-hexes · {parentHex.type}
          </span>

          {/* Stack depth indicator (if nested) */}
          {stack.length > 1 && (
            <span className="text-gray-500 text-xs">
              (depth {stack.length})
            </span>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2 py-1 ml-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Close</span>
          </button>
        </div>
      </div>

      {/* Overlay SVG container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
        }}
        {...handlers}
      >
        <svg className="w-full h-full" style={{ display: "block" }}>
          {/* Transform group for pan/zoom */}
          <g transform={svgTransform}>
            {/* Ghost parent at center */}
            <GhostParent
              parentHex={parentHex}
              childPositions={childPositions}
              size={ghostSize}
            />

            {/* Connection lines between children */}
            <ConnectionLines hexes={layoutData} allHexIds={allHexIds} />

            {/* Child hex nodes */}
            {layoutData.map((data) => (
              <HexNode
                key={data.hex.id}
                data={data}
                isHovered={hoverState.hexId === data.hex.id}
                pulseOpacity={getPulseOpacity(data.index)}
                entranceProgress={getEntranceProgress(data.index)}
                onClick={handleHexClick}
                onMouseEnter={handleHexMouseEnter}
                onMouseLeave={handleHexMouseLeave}
                onMouseMove={handleHexMouseMove}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Tooltip (portal) */}
      <HexTooltip
        hex={hoveredHex}
        x={hoverState.mouseX}
        y={hoverState.mouseY}
        visible={!!hoveredHex && !isDragging}
      />

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
});
