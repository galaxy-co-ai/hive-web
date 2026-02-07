import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HiveGraph } from "@/components/graph/hive-graph";
import { getAllHexes } from "@/lib/kv";

export default async function GraphViewPage() {
  const hexes = await getAllHexes();

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Home
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/viewer">Grid view</Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Honeycomb graph</h1>
            <p className="text-sm text-muted-foreground">
              {hexes.length} hexes · Click to view details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-blue-500" /> Data
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-green-500" /> Tool
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-purple-500" /> Gateway
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-amber-500" /> Junction
            </span>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1">
        <HiveGraph hexes={hexes} />
      </div>
    </div>
  );
}
