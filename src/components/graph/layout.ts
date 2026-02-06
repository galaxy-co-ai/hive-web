import dagre from "dagre";
import { type Node, type Edge } from "@xyflow/react";
import { Hex } from "@/lib/schemas";
import { HexNodeData } from "./hex-node";

const NODE_WIDTH = 140;
const NODE_HEIGHT = 160;

/**
 * Convert Hex data to React Flow nodes and edges with auto-layout
 */
export function createGraphLayout(hexes: Hex[]): {
  nodes: Node<{ data: HexNodeData }>[];
  edges: Edge[];
} {
  // Create dagre graph
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "TB", // Top to bottom
    nodesep: 80, // Horizontal spacing
    ranksep: 100, // Vertical spacing
    marginx: 50,
    marginy: 50,
  });
  g.setDefaultEdgeLabel(() => ({}));

  // Build a set of valid hex IDs for edge validation
  const validHexIds = new Set(hexes.map((h) => h.id));

  // Add nodes
  for (const hex of hexes) {
    g.setNode(hex.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  // Add edges (only if target exists)
  const flowEdges: Edge[] = [];
  for (const hex of hexes) {
    for (const edge of hex.edges) {
      // Skip external edges and edges to non-existent hexes
      if (edge.to.startsWith("external:") || !validHexIds.has(edge.to)) {
        continue;
      }

      g.setEdge(hex.id, edge.to);

      flowEdges.push({
        id: `${hex.id}-${edge.id}`,
        source: hex.id,
        target: edge.to,
        type: "smoothstep",
        animated: edge.when.always === true,
        style: {
          stroke: edge.when.always ? "#94a3b8" : "#cbd5e1",
          strokeWidth: 2,
        },
        label: edge.when.always ? "" : edge.when.intent?.slice(0, 20),
        labelStyle: { fontSize: 10, fill: "#64748b" },
      });
    }
  }

  // Run dagre layout
  dagre.layout(g);

  // Convert to React Flow nodes
  const flowNodes: Node<{ data: HexNodeData }>[] = hexes.map((hex) => {
    const nodeWithPosition = g.node(hex.id);

    return {
      id: hex.id,
      type: "hexNode",
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
      data: {
        data: {
          label: hex.name,
          hexId: hex.id,
          type: hex.type,
          edgeCount: hex.edges.length,
          description: hex.description,
        },
      },
    };
  });

  return { nodes: flowNodes, edges: flowEdges };
}
