"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Hex } from "@/lib/schemas";
import { HexNode, HexNodeData } from "./hex-node";
import { createGraphLayout } from "./layout";

const nodeTypes = {
  hexNode: HexNode,
};

interface HiveGraphProps {
  hexes: Hex[];
}

export function HiveGraph({ hexes }: HiveGraphProps) {
  const router = useRouter();

  // Create layout from hexes
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => createGraphLayout(hexes),
    [hexes]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Navigate to hex detail on click
  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      router.push(`/viewer/${node.id}`);
    },
    [router]
  );

  // Custom minimap node color
  const nodeColor = useCallback((node: { data?: unknown }) => {
    const nodeData = node.data as { data?: HexNodeData } | undefined;
    const type = nodeData?.data?.type;
    switch (type) {
      case "data":
        return "#3b82f6";
      case "tool":
        return "#22c55e";
      case "gateway":
        return "#a855f7";
      case "junction":
        return "#f59e0b";
      default:
        return "#94a3b8";
    }
  }, []);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-left"
      >
        <Background color="#e2e8f0" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={nodeColor}
          nodeStrokeWidth={3}
          zoomable
          pannable
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
          }}
        />
      </ReactFlow>
    </div>
  );
}
