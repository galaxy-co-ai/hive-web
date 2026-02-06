"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface HexDetailProps {
  hex: Hex;
}

export function HexDetail({ hex }: HexDetailProps) {
  const contentsData = hex.contents.data;
  const hasRules = contentsData && typeof contentsData === "object" && "rules" in contentsData;
  const rulesContent = hasRules ? (contentsData as { rules: string }).rules : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{hex.name}</h1>
            <Badge variant="secondary" className={typeColors[hex.type]}>
              {typeLabels[hex.type]}
            </Badge>
          </div>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{hex.id}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/builder/${hex.id}`}>Edit hex</Link>
        </Button>
      </div>

      {/* Description */}
      {hex.description && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Description</h2>
          <p>{hex.description}</p>
        </div>
      )}

      {/* Entry hints */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Entry hints</h2>
        <div className="flex flex-wrap gap-2">
          {hex.entryHints.map((hint) => (
            <Badge key={hint} variant="outline">
              {hint}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tags */}
      {hex.tags.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {hex.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Contents */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Contents</h2>
        {rulesContent ? (
          <div className="prose prose-sm dark:prose-invert max-w-none rounded-xl border border-border/50 bg-muted/30 p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm">{rulesContent}</pre>
          </div>
        ) : (
          <pre className="overflow-x-auto rounded-xl border border-border/50 bg-muted/30 p-6 font-mono text-sm">
            {JSON.stringify(hex.contents, null, 2)}
          </pre>
        )}
      </div>

      {/* Edges */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Edges ({hex.edges.length})
        </h2>
        {hex.edges.length === 0 ? (
          <p className="text-muted-foreground">No outbound edges</p>
        ) : (
          <div className="space-y-3">
            {hex.edges
              .sort((a, b) => b.priority - a.priority)
              .map((edge) => (
                <div
                  key={edge.id}
                  className="rounded-xl border border-border/50 bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/viewer/${edge.to}`}
                          className="font-mono text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          → {edge.to}
                        </Link>
                        <Badge variant="outline" className="text-xs">
                          P{edge.priority}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {edge.description}
                      </p>
                    </div>
                  </div>

                  {/* Condition */}
                  <div className="mt-3 rounded-lg bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground">When:</p>
                    <pre className="mt-1 font-mono text-xs">
                      {JSON.stringify(edge.when, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="border-t border-border pt-6 text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <span>Created: {new Date(hex.created).toLocaleString()}</span>
          <span>Updated: {new Date(hex.updated).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
