"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Hex } from "@/lib/schemas";
import { computeLayout } from "./layout-engine";
import { usePanZoom } from "./use-pan-zoom";
import { HexCell } from "./hex-cell";
import { HexEdge } from "./hex-edge";
import { HexClusterBackground } from "./hex-cluster";

interface HexGridCanvasProps {
  hexes: Hex[];
}

export function HexGridCanvas({ hexes }: HexGridCanvasProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedHexId, setSelectedHexId] = useState<string | null>(null);

  // Compute layout
  const layout = useMemo(() => computeLayout(hexes), [hexes]);

  // Pan/zoom
  const { transform, handlers, fitToBounds } = usePanZoom({
    minScale: 0.1,
    maxScale: 3,
  });

  // Track container dimensions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    updateDimensions();

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Fit view on initial load
  useEffect(() => {
    if (layout.bounds.width > 0 && dimensions.width > 0) {
      fitToBounds(layout.bounds, dimensions.width, dimensions.height);
    }
  }, [layout.bounds, dimensions, fitToBounds]);

  // Handle hex click
  const handleHexClick = useCallback(
    (hexId: string) => {
      setSelectedHexId(hexId);
      router.push(`/viewer/${hexId}`);
    },
    [router]
  );

  // Transform string for SVG group
  const transformStr = `translate(${transform.x}, ${transform.y}) scale(${transform.scale})`;

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden bg-slate-50">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        style={{ cursor: "grab" }}
        {...handlers}
      >
        <g transform={transformStr}>
          {/* Layer 1: Cluster backgrounds */}
          {layout.clusters.map((cluster) => (
            <HexClusterBackground key={cluster.id} cluster={cluster} />
          ))}

          {/* Layer 2: Edges */}
          {layout.edges.map((edge) => (
            <HexEdge key={edge.id} edge={edge} />
          ))}

          {/* Layer 3: Hex cells */}
          {layout.hexes.map((layoutHex) => (
            <HexCell
              key={layoutHex.hex.id}
              layoutHex={layoutHex}
              onClick={handleHexClick}
              isSelected={selectedHexId === layoutHex.hex.id}
            />
          ))}
        </g>
      </svg>

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg px-3 py-2 shadow-sm border border-slate-200 text-xs text-slate-500">
        Scroll to zoom • Drag to pan
      </div>
    </div>
  );
}

