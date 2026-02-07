"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { Hex } from "@/lib/schemas";
import type { HoneycombCanvasProps, HoverState, ExtractionState } from "./types";
import { CANVAS_BG } from "./utils/constants";
import { usePanZoom } from "./hooks/usePanZoom";
import { useHexLayout, getRootHexes } from "./hooks/useHexLayout";
import { usePulseAnimation } from "./hooks/usePulseAnimation";
import { useEntranceAnimation } from "./hooks/useEntranceAnimation";
import { HexNode } from "./HexNode";
import { HexTooltip } from "./HexTooltip";
import { ConnectionLines } from "./ConnectionLines";
import { ZoomControls } from "./ZoomControls";
import { ExtractionOverlay } from "./ExtractionOverlay";

/**
 * Main honeycomb visualization canvas.
 * Orchestrates all sub-components, state, and interactions.
 */
export function HoneycombCanvas({ hexes }: HoneycombCanvasProps) {
  // Extraction state for floating overlay drill-down
  const [extraction, setExtraction] = useState<ExtractionState>({
    isOpen: false,
    stack: [],
    activeHexId: null,
  });

  // Always display root hexes on base map
  const displayHexes = useMemo(() => getRootHexes(hexes), [hexes]);

  // All hex IDs for connection line filtering
  const allHexIds = useMemo(
    () => new Set(displayHexes.map((h) => h.id)),
    [displayHexes]
  );

  // Layout computation
  const { layoutData, boundingBox, hexMap } = useHexLayout({
    hexes: displayHexes,
    allHexIds,
  });

  // Pan/zoom state
  const {
    view,
    containerRef,
    handlers,
    zoomIn,
    zoomOut,
    fitAll,
    isDragging,
  } = usePanZoom();

  // Fit content on initial load
  useEffect(() => {
    if (layoutData.length > 0 && containerRef.current) {
      // Small delay to ensure container is measured
      const timer = setTimeout(() => {
        fitAll(boundingBox);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [layoutData.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pulse animation
  const { getPulseOpacity } = usePulseAnimation({
    hexCount: layoutData.length,
    enabled: true,
  });

  // Entrance animation
  const { getEntranceProgress } = useEntranceAnimation({
    hexCount: layoutData.length,
    triggerKey: "root",
    enabled: true,
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

  // Click handler for hex extraction (floating overlay)
  const handleHexClick = useCallback(
    (hex: Hex) => {
      // If hex has children (edges), open extraction overlay
      const hasChildren = hex.edges.some((e) => hexes.some((h) => h.id === e.to));

      if (hasChildren) {
        setExtraction({
          isOpen: true,
          stack: [hex],
          activeHexId: hex.id,
        });
      } else {
        // Could open a detail panel or do something else
        console.log("Selected hex:", hex.id, hex.name);
      }
    },
    [hexes]
  );

  // Handle drilling deeper in extraction overlay
  const handleDrillDeeper = useCallback((hex: Hex) => {
    setExtraction((prev) => ({
      ...prev,
      stack: [...prev.stack, hex],
      activeHexId: hex.id,
    }));
  }, []);

  // Handle closing extraction overlay
  const handleCloseExtraction = useCallback(() => {
    setExtraction((prev) => {
      // If nested, pop the stack
      if (prev.stack.length > 1) {
        const newStack = prev.stack.slice(0, -1);
        return {
          ...prev,
          stack: newStack,
          activeHexId: newStack[newStack.length - 1]?.id ?? null,
        };
      }
      // Otherwise, close completely
      return {
        isOpen: false,
        stack: [],
        activeHexId: null,
      };
    });
  }, []);

  // Keyboard listener for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && extraction.isOpen) {
        handleCloseExtraction();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [extraction.isOpen, handleCloseExtraction]);

  // Get hovered hex data for tooltip
  const hoveredHex = hoverState.hexId
    ? hexMap.get(hoverState.hexId)?.hex ?? null
    : null;

  // SVG transform string
  const svgTransform = `translate(${view.x}, ${view.y}) scale(${view.scale})`;

  // Base layer styles when extraction is open
  const baseLayerStyle = extraction.isOpen
    ? {
        filter: "blur(6px) brightness(0.35)",
        pointerEvents: "none" as const,
        transition: "filter 0.4s ease",
      }
    : {
        transition: "filter 0.4s ease",
      };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        backgroundColor: CANVAS_BG,
        cursor: extraction.isOpen ? "default" : isDragging ? "grabbing" : "grab",
      }}
      {...(extraction.isOpen ? {} : handlers)}
    >
      {/* Base layer (SVG Canvas) */}
      <div style={baseLayerStyle}>
        <svg
          className="w-full h-full"
          style={{ display: "block" }}
        >
          {/* Transform group for pan/zoom */}
          <g transform={svgTransform}>
            {/* Connection lines (below hexes) */}
            <ConnectionLines hexes={layoutData} allHexIds={allHexIds} />

            {/* Hex nodes */}
            {layoutData.map((data) => (
              <HexNode
                key={data.hex.id}
                data={data}
                isHovered={hoverState.hexId === data.hex.id}
                isActive={data.hex.id === extraction.activeHexId}
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

      {/* Tooltip (portal) - only show when extraction is closed */}
      {!extraction.isOpen && (
        <HexTooltip
          hex={hoveredHex}
          x={hoverState.mouseX}
          y={hoverState.mouseY}
          visible={!!hoveredHex && !isDragging}
        />
      )}

      {/* Zoom controls */}
      <ZoomControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitAll={() => fitAll(boundingBox)}
      />

      {/* Extraction overlay */}
      {extraction.isOpen && extraction.stack.length > 0 && (
        <ExtractionOverlay
          stack={extraction.stack}
          allHexes={hexes}
          onClose={handleCloseExtraction}
          onDrillDeeper={handleDrillDeeper}
        />
      )}

      {/* Empty state */}
      {displayHexes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">No hexes to display</p>
            <p className="text-sm mt-1">
              Create some hexes to see them here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
