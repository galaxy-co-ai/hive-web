"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { Hex } from "@/lib/schemas";
import type { HoneycombCanvasProps, HoverState, BreadcrumbItem } from "./types";
import { CANVAS_BG } from "./utils/constants";
import { usePanZoom } from "./hooks/usePanZoom";
import { useHexLayout, getChildHexes, getRootHexes } from "./hooks/useHexLayout";
import { usePulseAnimation } from "./hooks/usePulseAnimation";
import { useEntranceAnimation } from "./hooks/useEntranceAnimation";
import { HexNode } from "./HexNode";
import { HexTooltip } from "./HexTooltip";
import { ConnectionLines } from "./ConnectionLines";
import { ZoomControls } from "./ZoomControls";
import { Breadcrumb } from "./Breadcrumb";

/**
 * Main honeycomb visualization canvas.
 * Orchestrates all sub-components, state, and interactions.
 */
export function HoneycombCanvas({ hexes }: HoneycombCanvasProps) {
  // Navigation state for drill-down
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const currentParentId = navigationPath[navigationPath.length - 1] ?? null;

  // Compute which hexes to display based on navigation
  const displayHexes = useMemo(() => {
    if (currentParentId === null) {
      return getRootHexes(hexes);
    }
    const parent = hexes.find((h) => h.id === currentParentId);
    if (!parent) return [];
    return getChildHexes(parent, hexes);
  }, [hexes, currentParentId]);

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
    setView,
    isDragging,
  } = usePanZoom();

  // Fit content on initial load and navigation changes
  useEffect(() => {
    if (layoutData.length > 0 && containerRef.current) {
      // Small delay to ensure container is measured
      const timer = setTimeout(() => {
        fitAll(boundingBox);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentParentId, layoutData.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pulse animation
  const { getPulseOpacity } = usePulseAnimation({
    hexCount: layoutData.length,
    enabled: true,
  });

  // Entrance animation (restarts on navigation)
  const { getEntranceProgress } = useEntranceAnimation({
    hexCount: layoutData.length,
    triggerKey: currentParentId ?? "root",
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

  // Click handler for hex navigation/drill-down
  const handleHexClick = useCallback(
    (hex: Hex) => {
      // If hex has children (edges), drill down
      const hasChildren = hex.edges.some((e) => hexes.some((h) => h.id === e.to));

      if (hasChildren) {
        setNavigationPath((prev) => [...prev, hex.id]);
      } else {
        // Could open a detail panel or do something else
        console.log("Selected hex:", hex.id, hex.name);
      }
    },
    [hexes]
  );

  // Breadcrumb navigation
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [{ id: null, label: "All Hexes" }];

    for (const id of navigationPath) {
      const hex = hexes.find((h) => h.id === id);
      if (hex) {
        items.push({ id: hex.id, label: hex.name });
      }
    }

    return items;
  }, [navigationPath, hexes]);

  const handleBreadcrumbNavigate = useCallback((id: string | null) => {
    if (id === null) {
      setNavigationPath([]);
    } else {
      const index = navigationPath.indexOf(id);
      if (index >= 0) {
        setNavigationPath(navigationPath.slice(0, index + 1));
      }
    }
  }, [navigationPath]);

  // Get hovered hex data for tooltip
  const hoveredHex = hoverState.hexId
    ? hexMap.get(hoverState.hexId)?.hex ?? null
    : null;

  // SVG transform string
  const svgTransform = `translate(${view.x}, ${view.y}) scale(${view.scale})`;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        backgroundColor: CANVAS_BG,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      {...handlers}
    >
      {/* SVG Canvas */}
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

      {/* Tooltip (portal) */}
      <HexTooltip
        hex={hoveredHex}
        x={hoverState.mouseX}
        y={hoverState.mouseY}
        visible={!!hoveredHex && !isDragging}
      />

      {/* Breadcrumb navigation */}
      <Breadcrumb
        items={breadcrumbItems}
        onNavigate={handleBreadcrumbNavigate}
      />

      {/* Zoom controls */}
      <ZoomControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitAll={() => fitAll(boundingBox)}
      />

      {/* Empty state */}
      {displayHexes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">No hexes to display</p>
            <p className="text-sm mt-1">
              {currentParentId
                ? "This hex has no connected children."
                : "Create some hexes to see them here."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
