"use client";

import { Hex } from "@/lib/schemas";
import { HoneycombCanvas } from "@/components/honeycomb";

interface HiveGraphProps {
  hexes: Hex[];
}

export function HiveGraph({ hexes }: HiveGraphProps) {
  return (
    <div className="h-full w-full">
      <HoneycombCanvas hexes={hexes} />
    </div>
  );
}
