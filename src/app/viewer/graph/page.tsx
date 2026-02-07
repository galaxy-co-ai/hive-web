import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HiveGraph } from "@/components/graph/hive-graph";
import { getAllHexes } from "@/lib/kv";

export default async function GraphViewPage() {
  const hexes = await getAllHexes();

  return (
    <div className="flex h-screen flex-col bg-[#0a0b0f]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-[#0f1015] px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Home
          </Link>
          <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
            <Link href="/viewer">Grid view</Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-white">Honeycomb Graph</h1>
            <p className="text-sm text-gray-500">
              {hexes.length} hexes · Click to explore
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-4 text-xs text-gray-300">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> Data
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> Tool
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" /> Gateway
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> Junction
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
