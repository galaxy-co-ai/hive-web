import { HEX_COLORS } from "@/components/honeycomb/utils/constants";
import { hexPoints } from "@/components/honeycomb/utils/hexMath";
import type { HexType } from "@/lib/schemas";

interface TypeInfo {
  type: HexType;
  description: string;
  example: string;
}

const types: TypeInfo[] = [
  {
    type: "data",
    description:
      "Stores knowledge — design rules, API docs, configuration. The read-only backbone of the graph.",
    example: "engineering-constitution",
  },
  {
    type: "tool",
    description:
      "Wraps an executable action — code generation, validation, transformation. Has handler definitions.",
    example: "tailwind-generator",
  },
  {
    type: "gateway",
    description:
      "Entry point that routes agents to the right subgraph based on intent. High fan-out edges.",
    example: "design-system-gateway",
  },
  {
    type: "junction",
    description:
      "Decision node that branches based on payload data. Evaluates conditions to pick the next path.",
    example: "component-type-router",
  },
];

const typeLabels: Record<HexType, string> = {
  data: "Data",
  tool: "Tool",
  gateway: "Gateway",
  junction: "Junction",
};

export function HexTypeLegend() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {types.map(({ type, description, example }) => {
        const colors = HEX_COLORS[type];

        return (
          <div
            key={type}
            className="rounded-xl p-5 border"
            style={{
              backgroundColor: "#0f1015",
              borderColor: `${colors.primary}33`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              {/* Mini hexagon */}
              <svg width={36} height={36} viewBox="-20 -20 40 40">
                <defs>
                  <linearGradient
                    id={`hex-fill-${type}`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={colors.innerStart} />
                    <stop offset="100%" stopColor={colors.innerEnd} />
                  </linearGradient>
                  <filter id={`hex-glow-${type}`}>
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <polygon
                  points={hexPoints(0, 0, 16)}
                  fill={`url(#hex-fill-${type})`}
                  stroke={colors.border}
                  strokeWidth={1.5}
                  filter={`url(#hex-glow-${type})`}
                />
              </svg>

              <div>
                <span
                  className="text-sm font-bold"
                  style={{ color: colors.text }}
                >
                  {typeLabels[type]}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">
              {description}
            </p>

            <p className="mt-3 font-mono text-xs text-gray-600">
              e.g.{" "}
              <code
                className="px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${colors.primary}12`,
                  color: colors.text,
                }}
              >
                {example}
              </code>
            </p>
          </div>
        );
      })}
    </div>
  );
}
