"use client";

import { memo } from "react";
import { Plus, Minus, Maximize2 } from "lucide-react";
import type { ZoomControlsProps } from "./types";

/**
 * Floating zoom control buttons positioned in bottom-right corner.
 */
export const ZoomControls = memo(function ZoomControls({
  onZoomIn,
  onZoomOut,
  onFitAll,
}: ZoomControlsProps) {
  const buttonClass = `
    flex items-center justify-center
    w-10 h-10
    rounded-lg
    bg-gray-900/90 hover:bg-gray-800
    border border-gray-700 hover:border-gray-600
    text-gray-400 hover:text-white
    transition-colors duration-150
    backdrop-blur-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500/50
  `.trim();

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
      {/* Zoom In */}
      <button
        className={buttonClass}
        onClick={onZoomIn}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* Zoom Out */}
      <button
        className={buttonClass}
        onClick={onZoomOut}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <Minus className="w-5 h-5" />
      </button>

      {/* Fit All */}
      <button
        className={buttonClass}
        onClick={onFitAll}
        title="Fit all hexes in view"
        aria-label="Fit all hexes in view"
      >
        <Maximize2 className="w-5 h-5" />
      </button>
    </div>
  );
});
