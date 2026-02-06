"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreateHexInput, Edge } from "@/lib/schemas";

export function StepEdges() {
  const { watch, setValue } = useFormContext<CreateHexInput>();
  const edges = watch("edges") || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [edgeForm, setEdgeForm] = useState<Partial<Edge>>({
    id: "",
    to: "",
    priority: 5,
    description: "",
    when: { intent: "" },
  });

  const resetForm = () => {
    setEdgeForm({
      id: "",
      to: "",
      priority: 5,
      description: "",
      when: { intent: "" },
    });
    setIsAdding(false);
    setEditingIndex(null);
  };

  const saveEdge = () => {
    if (!edgeForm.id || !edgeForm.to || !edgeForm.description) return;

    const newEdge: Edge = {
      id: edgeForm.id,
      to: edgeForm.to,
      priority: edgeForm.priority || 5,
      description: edgeForm.description,
      when: edgeForm.when || { intent: "" },
    };

    if (editingIndex !== null) {
      const updated = [...edges];
      updated[editingIndex] = newEdge;
      setValue("edges", updated);
    } else {
      setValue("edges", [...edges, newEdge]);
    }

    resetForm();
  };

  const editEdge = (index: number) => {
    const edge = edges[index];
    setEdgeForm({
      id: edge.id,
      to: edge.to,
      priority: edge.priority,
      description: edge.description,
      when: edge.when,
    });
    setEditingIndex(index);
    setIsAdding(true);
  };

  const removeEdge = (index: number) => {
    setValue(
      "edges",
      edges.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Outbound edges</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Define connections to other hexes with conditions
            </p>
          </div>
          {!isAdding && (
            <Button type="button" variant="outline" onClick={() => setIsAdding(true)}>
              Add edge
            </Button>
          )}
        </div>
      </div>

      {/* Edge form */}
      {isAdding && (
        <div className="space-y-4 rounded-xl border border-border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="edge-id">Edge ID</Label>
              <Input
                id="edge-id"
                placeholder="to-some-hex"
                value={edgeForm.id || ""}
                onChange={(e) => setEdgeForm({ ...edgeForm, id: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edge-to">Destination hex ID</Label>
              <Input
                id="edge-to"
                placeholder="target-hex-id"
                value={edgeForm.to || ""}
                onChange={(e) => setEdgeForm({ ...edgeForm, to: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edge-description">Description</Label>
            <Input
              id="edge-description"
              placeholder="What this edge does..."
              value={edgeForm.description || ""}
              onChange={(e) => setEdgeForm({ ...edgeForm, description: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="edge-priority">Priority (0-100)</Label>
              <Input
                id="edge-priority"
                type="number"
                min={0}
                max={100}
                value={edgeForm.priority || 5}
                onChange={(e) =>
                  setEdgeForm({ ...edgeForm, priority: parseInt(e.target.value) || 5 })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edge-intent">When intent matches</Label>
              <Input
                id="edge-intent"
                placeholder="keyword another keyword"
                value={(edgeForm.when as { intent?: string })?.intent || ""}
                onChange={(e) =>
                  setEdgeForm({
                    ...edgeForm,
                    when: { ...edgeForm.when, intent: e.target.value },
                  })
                }
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Leave empty and check &quot;Always&quot; for unconditional edges
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="edge-always"
              checked={(edgeForm.when as { always?: boolean })?.always || false}
              onChange={(e) =>
                setEdgeForm({
                  ...edgeForm,
                  when: { ...edgeForm.when, always: e.target.checked },
                })
              }
            />
            <Label htmlFor="edge-always" className="text-sm font-normal">
              Always (unconditional edge)
            </Label>
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={saveEdge}>
              {editingIndex !== null ? "Update" : "Add"} edge
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Edge list */}
      {edges.length > 0 ? (
        <div className="space-y-3">
          {edges.map((edge, index) => (
            <div
              key={edge.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-border/50 bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">→ {edge.to}</span>
                  <span className="text-xs text-muted-foreground">P{edge.priority}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{edge.description}</p>
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  when: {JSON.stringify(edge.when)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editEdge(index)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEdge(index)}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isAdding && (
          <div className="rounded-xl border border-dashed border-border py-8 text-center">
            <p className="text-muted-foreground">No edges defined</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Edges define outbound connections to other hexes
            </p>
          </div>
        )
      )}
    </div>
  );
}
