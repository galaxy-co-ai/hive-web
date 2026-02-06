"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { HexType } from "@/lib/schemas";

const typeColors: Record<HexType, { bg: string; border: string; text: string }> = {
  data: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  tool: { bg: "#dcfce7", border: "#22c55e", text: "#166534" },
  gateway: { bg: "#f3e8ff", border: "#a855f7", text: "#7c3aed" },
  junction: { bg: "#fef3c7", border: "#f59e0b", text: "#b45309" },
};

export type HexNodeData = {
  label: string;
  hexId: string;
  type: HexType;
  edgeCount: number;
  description?: string;
};

interface HexNodeProps {
  data: { data: HexNodeData };
  selected?: boolean;
}

function HexNodeComponent({ data, selected }: HexNodeProps) {
  const nodeData = data.data;
  const colors = typeColors[nodeData.type];

  return (
    <div className="relative">
      {/* Hexagon shape using clip-path */}
      <div
        className="relative flex items-center justify-center transition-transform"
        style={{
          width: 140,
          height: 160,
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          backgroundColor: colors.bg,
          border: `3px solid ${colors.border}`,
          transform: selected ? "scale(1.05)" : "scale(1)",
          boxShadow: selected ? `0 0 20px ${colors.border}` : "none",
        }}
      >
        {/* Inner content */}
        <div
          className="absolute inset-2 flex flex-col items-center justify-center p-2 text-center"
          style={{
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: colors.text }}
          >
            {nodeData.type}
          </span>
          <span
            className="mt-1 line-clamp-2 text-sm font-medium leading-tight"
            style={{ color: colors.text }}
          >
            {nodeData.label}
          </span>
          <span className="mt-1 text-xs opacity-70" style={{ color: colors.text }}>
            {nodeData.edgeCount} edge{nodeData.edgeCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-0"
        style={{ top: 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-transparent !border-0"
        style={{ bottom: 0 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!bg-transparent !border-0"
        style={{ left: 0, top: "50%" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-transparent !border-0"
        style={{ right: 0, top: "50%" }}
      />
    </div>
  );
}

export const HexNode = memo(HexNodeComponent);
