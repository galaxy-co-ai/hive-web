"use client";

import { useState, useCallback, useRef, type MouseEvent, type WheelEvent } from "react";

export interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface UsePanZoomOptions {
  minScale?: number;
  maxScale?: number;
  initialTransform?: Transform;
}

export function usePanZoom(options: UsePanZoomOptions = {}) {
  const { minScale = 0.1, maxScale = 3, initialTransform } = options;

  const [transform, setTransform] = useState<Transform>(
    initialTransform ?? { x: 0, y: 0, scale: 1 }
  );

  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Handle wheel zoom (toward cursor position)
  const onWheel = useCallback(
    (e: WheelEvent<SVGSVGElement>) => {
      e.preventDefault();

      const rect = e.currentTarget.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

      setTransform((prev) => {
        const newScale = Math.min(maxScale, Math.max(minScale, prev.scale * zoomFactor));

        // Zoom toward cursor position
        const scaleChange = newScale / prev.scale;
        const newX = cursorX - (cursorX - prev.x) * scaleChange;
        const newY = cursorY - (cursorY - prev.y) * scaleChange;

        return { x: newX, y: newY, scale: newScale };
      });
    },
    [minScale, maxScale]
  );

  // Start panning
  const onMouseDown = useCallback((e: MouseEvent<SVGSVGElement>) => {
    // Only pan with left mouse button
    if (e.button !== 0) return;

    isPanning.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.style.cursor = "grabbing";
  }, []);

  // Continue panning
  const onMouseMove = useCallback((e: MouseEvent<SVGSVGElement>) => {
    if (!isPanning.current) return;

    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };

    setTransform((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  }, []);

  // End panning
  const onMouseUp = useCallback((e: MouseEvent<SVGSVGElement>) => {
    isPanning.current = false;
    e.currentTarget.style.cursor = "grab";
  }, []);

  const onMouseLeave = useCallback((e: MouseEvent<SVGSVGElement>) => {
    isPanning.current = false;
    e.currentTarget.style.cursor = "grab";
  }, []);

  // Reset transform
  const resetTransform = useCallback(() => {
    setTransform(initialTransform ?? { x: 0, y: 0, scale: 1 });
  }, [initialTransform]);

  // Fit to bounds
  const fitToBounds = useCallback(
    (
      bounds: { width: number; height: number; minX: number; minY: number },
      containerWidth: number,
      containerHeight: number
    ) => {
      const padding = 50;
      const scaleX = (containerWidth - padding * 2) / bounds.width;
      const scaleY = (containerHeight - padding * 2) / bounds.height;
      const scale = Math.min(scaleX, scaleY, 1);

      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;
      const graphCenterX = bounds.minX + bounds.width / 2;
      const graphCenterY = bounds.minY + bounds.height / 2;

      setTransform({
        x: centerX - graphCenterX * scale,
        y: centerY - graphCenterY * scale,
        scale,
      });
    },
    []
  );

  return {
    transform,
    setTransform,
    handlers: {
      onWheel,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
    },
    resetTransform,
    fitToBounds,
  };
}
