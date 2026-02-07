"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ViewState, DragState } from "../types";
import {
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_STEP,
  ZOOM_SENSITIVITY,
} from "../utils/constants";
import { calculateFitTransform, type BoundingBox } from "../utils/hexMath";

interface UsePanZoomOptions {
  initialView?: Partial<ViewState>;
}

interface UsePanZoomReturn {
  view: ViewState;
  containerRef: React.RefObject<HTMLDivElement | null>;
  handlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
    onWheel: (e: React.WheelEvent) => void;
  };
  zoomIn: () => void;
  zoomOut: () => void;
  fitAll: (boundingBox: BoundingBox) => void;
  setView: (view: ViewState) => void;
  isDragging: boolean;
}

export function usePanZoom(options: UsePanZoomOptions = {}): UsePanZoomReturn {
  const [view, setView] = useState<ViewState>({
    x: options.initialView?.x ?? 0,
    y: options.initialView?.y ?? 0,
    scale: options.initialView?.scale ?? 1,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  const dragRef = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  });

  const [isDragging, setIsDragging] = useState(false);

  // Clamp zoom to min/max
  const clampZoom = useCallback((scale: number): number => {
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));
  }, []);

  // Handle mouse wheel zoom (cursor-centered)
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate zoom delta
      const delta = -e.deltaY * ZOOM_SENSITIVITY;
      const newScale = clampZoom(view.scale * (1 + delta));

      // If scale didn't change (at limits), don't update
      if (newScale === view.scale) return;

      // Calculate the point under the cursor in world coordinates (before zoom)
      const worldX = (mouseX - view.x) / view.scale;
      const worldY = (mouseY - view.y) / view.scale;

      // Calculate new pan to keep the same world point under cursor
      const newX = mouseX - worldX * newScale;
      const newY = mouseY - worldY * newScale;

      setView({ x: newX, y: newY, scale: newScale });
    },
    [view, clampZoom]
  );

  // Handle drag start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only start drag on left button
      if (e.button !== 0) return;

      dragRef.current = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        startPanX: view.x,
        startPanY: view.y,
      };
      setIsDragging(true);
    },
    [view.x, view.y]
  );

  // Handle drag
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current.isDragging) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    setView((prev) => ({
      ...prev,
      x: dragRef.current.startPanX + dx,
      y: dragRef.current.startPanY + dy,
    }));
  }, []);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    dragRef.current.isDragging = false;
    setIsDragging(false);
  }, []);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (dragRef.current.isDragging) {
      dragRef.current.isDragging = false;
      setIsDragging(false);
    }
  }, []);

  // Button zoom controls
  const zoomIn = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newScale = clampZoom(view.scale + ZOOM_STEP);
    if (newScale === view.scale) return;

    // Zoom centered on viewport center
    const worldX = (centerX - view.x) / view.scale;
    const worldY = (centerY - view.y) / view.scale;
    const newX = centerX - worldX * newScale;
    const newY = centerY - worldY * newScale;

    setView({ x: newX, y: newY, scale: newScale });
  }, [view, clampZoom]);

  const zoomOut = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newScale = clampZoom(view.scale - ZOOM_STEP);
    if (newScale === view.scale) return;

    const worldX = (centerX - view.x) / view.scale;
    const worldY = (centerY - view.y) / view.scale;
    const newX = centerX - worldX * newScale;
    const newY = centerY - worldY * newScale;

    setView({ x: newX, y: newY, scale: newScale });
  }, [view, clampZoom]);

  // Fit all content in view
  const fitAll = useCallback((boundingBox: BoundingBox) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const transform = calculateFitTransform(
      boundingBox,
      rect.width,
      rect.height
    );

    setView(transform);
  }, []);

  return {
    view,
    containerRef,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onWheel: handleWheel,
    },
    zoomIn,
    zoomOut,
    fitAll,
    setView,
    isDragging,
  };
}
