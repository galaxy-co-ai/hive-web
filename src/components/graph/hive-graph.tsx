"use client";

import { Hex } from "@/lib/schemas";
import { HexGridCanvas } from "./honeycomb/hex-grid-canvas";

interface HiveGraphProps {
  hexes: Hex[];
}

export function HiveGraph({ hexes }: HiveGraphProps) {
  return (
    <div className="h-full w-full">
      <HexGridCanvas hexes={hexes} />
    </div>
  );
}
