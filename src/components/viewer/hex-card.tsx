"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Hex, HexType } from "@/lib/schemas";

const typeColors: Record<HexType, string> = {
  data: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  tool: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  gateway: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  junction: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

const typeLabels: Record<HexType, string> = {
  data: "Data",
  tool: "Tool",
  gateway: "Gateway",
  junction: "Junction",
};

interface HexCardProps {
  hex: Hex;
}

export function HexCard({ hex }: HexCardProps) {
  return (
    <Link
      href={`/viewer/${hex.id}`}
      className="block rounded-xl border border-border/50 bg-card p-6 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{hex.name}</h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">{hex.id}</p>
        </div>
        <Badge variant="secondary" className={typeColors[hex.type]}>
          {typeLabels[hex.type]}
        </Badge>
      </div>

      {hex.description && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {hex.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {hex.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
        {hex.tags.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{hex.tags.length - 3}
          </Badge>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{hex.edges.length} edge{hex.edges.length !== 1 ? "s" : ""}</span>
        <span>{hex.entryHints.length} hint{hex.entryHints.length !== 1 ? "s" : ""}</span>
      </div>
    </Link>
  );
}
