"use client";

import { memo } from "react";
import { ChevronRight, Home } from "lucide-react";
import type { BreadcrumbProps } from "./types";

/**
 * Breadcrumb navigation for drill-down hierarchy.
 * Shows path from root to current view.
 */
export const Breadcrumb = memo(function Breadcrumb({
  items,
  onNavigate,
}: BreadcrumbProps) {
  // Don't show breadcrumb if only root
  if (items.length <= 1) return null;

  return (
    <div className="absolute top-4 left-4 z-10">
      <nav
        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-900/90 border border-gray-700 backdrop-blur-sm"
        aria-label="Breadcrumb navigation"
      >
        {items.map((item, index) => (
          <div key={item.id ?? "root"} className="flex items-center">
            {/* Separator */}
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-1 text-gray-600" />
            )}

            {/* Breadcrumb item */}
            <button
              onClick={() => onNavigate(item.id)}
              className={`
                flex items-center gap-1.5 px-2 py-1 rounded
                text-sm font-medium
                transition-colors duration-150
                ${
                  index === items.length - 1
                    ? "text-white cursor-default"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }
              `}
              disabled={index === items.length - 1}
            >
              {/* Root icon */}
              {index === 0 && <Home className="w-3.5 h-3.5" />}
              <span className="truncate max-w-[120px]">{item.label}</span>
            </button>
          </div>
        ))}
      </nav>
    </div>
  );
});
