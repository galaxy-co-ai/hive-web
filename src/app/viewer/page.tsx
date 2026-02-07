import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HexGrid } from "@/components/viewer/hex-grid";
import { SearchBar } from "@/components/viewer/search-bar";
import { getAllHexes } from "@/lib/kv";
import { queryHexes } from "@/lib/hive-query";
import { Hex } from "@/lib/schemas";

async function getHexes(query?: string): Promise<Hex[]> {
  try {
    const hexes = await getAllHexes();

    if (query) {
      // Semantic search
      const results = queryHexes(hexes, query, 50);
      return results.map((r) => r.hex);
    }

    return hexes;
  } catch (error) {
    console.error("Failed to fetch hexes:", error);
    return [];
  }
}

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ViewerPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const hexes = await getHexes(q);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Home
          </Link>
          <h1 className="text-2xl font-semibold">Hive viewer</h1>
          <p className="mt-1 text-muted-foreground">
            Browse and search the honeycomb graph
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/viewer/graph">Graph view</Link>
          </Button>
          <Button asChild>
            <Link href="/builder">Create hex</Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <Suspense fallback={<div className="h-12 animate-pulse rounded-md bg-muted" />}>
          <SearchBar initialValue={q ?? ""} />
        </Suspense>
      </div>

      {/* Results info */}
      {q && (
        <p className="mb-4 text-sm text-muted-foreground">
          {hexes.length} result{hexes.length !== 1 ? "s" : ""} for &quot;{q}&quot;
        </p>
      )}

      {/* Grid */}
      <HexGrid hexes={hexes} />
    </div>
  );
}
