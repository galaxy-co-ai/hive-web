"use client";

import { Badge } from "@/components/ui/badge";
import { CreateHexInput, HexType } from "@/lib/schemas";

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

interface PreviewProps {
  data: CreateHexInput;
}

export function Preview({ data }: PreviewProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/50 bg-primary/5 p-4">
        <p className="text-sm font-medium">Review before saving</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Check that all information is correct before creating this hex.
        </p>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">{data.name || "Untitled"}</h2>
          <Badge variant="secondary" className={typeColors[data.type]}>
            {typeLabels[data.type]}
          </Badge>
        </div>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          {data.id || "no-id"}
        </p>
      </div>

      {/* Description */}
      {data.description && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
          <p className="mt-1">{data.description}</p>
        </div>
      )}

      {/* Entry hints */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Entry hints</h3>
        {data.entryHints.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {data.entryHints.map((hint) => (
              <Badge key={hint} variant="outline">
                {hint}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-sm text-destructive">No entry hints defined</p>
        )}
      </div>

      {/* Tags */}
      {data.tags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Contents */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Contents</h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted/50 p-4 font-mono text-xs">
          {JSON.stringify(data.contents, null, 2)}
        </pre>
      </div>

      {/* Edges */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">
          Edges ({data.edges.length})
        </h3>
        {data.edges.length > 0 ? (
          <div className="mt-2 space-y-2">
            {data.edges.map((edge) => (
              <div
                key={edge.id}
                className="rounded-lg bg-muted/50 p-3 font-mono text-xs"
              >
                <span className="font-medium">→ {edge.to}</span>
                <span className="ml-2 text-muted-foreground">
                  (P{edge.priority})
                </span>
                <p className="mt-1 text-muted-foreground">{edge.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">No edges defined</p>
        )}
      </div>
    </div>
  );
}
