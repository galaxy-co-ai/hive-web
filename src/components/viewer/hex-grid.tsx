"use client";

import { useState } from "react";
import { HexCard } from "./hex-card";
import { Button } from "@/components/ui/button";
import { Hex, HexType } from "@/lib/schemas";

const typeFilters: Array<{ value: HexType | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "data", label: "Data" },
  { value: "tool", label: "Tool" },
  { value: "gateway", label: "Gateway" },
  { value: "junction", label: "Junction" },
];

interface HexGridProps {
  hexes: Hex[];
}

export function HexGrid({ hexes }: HexGridProps) {
  const [filter, setFilter] = useState<HexType | "all">("all");

  const filteredHexes = hexes.filter(
    (hex) => filter === "all" || hex.type === filter
  );

  return (
    <div>
      {/* Filter buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {typeFilters.map(({ value, label }) => (
          <Button
            key={value}
            variant={filter === value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(value)}
          >
            {label}
            {value !== "all" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({hexes.filter((h) => h.type === value).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Grid */}
      {filteredHexes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No hexes found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter !== "all"
              ? `No ${filter} hexes available. Try a different filter.`
              : "Seed the database to get started."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHexes.map((hex) => (
            <HexCard key={hex.id} hex={hex} />
          ))}
        </div>
      )}
    </div>
  );
}
