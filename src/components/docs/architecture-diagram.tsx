import { FlowNode } from "./flow-node";
import { FlowArrow } from "./flow-arrow";

/**
 * Two-lane SVG showing Agent Interface vs Human Interface,
 * both connecting to the shared HIVE GRAPH layer.
 */
export function ArchitectureDiagram() {
  const w = 720;
  const h = 420;
  const laneW = 310;
  const gap = 24;
  const laneX1 = (w - laneW * 2 - gap) / 2;
  const laneX2 = laneX1 + laneW + gap;
  const laneY = 32;
  const laneH = 240;

  // Shared graph box
  const graphY = laneY + laneH + 40;
  const graphH = 72;
  const graphX = laneX1;
  const graphW = laneW * 2 + gap;

  // Tool items
  const agentTools = [
    "hive_query",
    "hive_enter",
    "hive_next_steps",
    "hive_traverse",
    "hive_deposit",
    "hive_create_hex",
  ];

  const humanFeatures = [
    "Honeycomb graph view",
    "Hex detail viewer",
    "Search + filter",
    "4-step builder wizard",
    "Document ingestion",
    "Edge visualization",
  ];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-3xl mx-auto"
        role="img"
        aria-label="Architecture diagram showing Agent and Human interfaces connecting to the Hive Graph"
      >
        {/* Agent Lane */}
        <rect
          x={laneX1}
          y={laneY}
          width={laneW}
          height={laneH}
          rx={12}
          fill="none"
          stroke="#a855f7"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          opacity={0.4}
        />
        <text
          x={laneX1 + laneW / 2}
          y={laneY + 24}
          textAnchor="middle"
          fill="#d8b4fe"
          fontSize={13}
          fontWeight={700}
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          Agent Interface (MCP)
        </text>
        {agentTools.map((tool, i) => (
          <text
            key={tool}
            x={laneX1 + 24}
            y={laneY + 52 + i * 28}
            fill="#c4b5fd"
            fontSize={12}
            fontFamily="ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace"
          >
            {tool}()
          </text>
        ))}

        {/* Human Lane */}
        <rect
          x={laneX2}
          y={laneY}
          width={laneW}
          height={laneH}
          rx={12}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          opacity={0.4}
        />
        <text
          x={laneX2 + laneW / 2}
          y={laneY + 24}
          textAnchor="middle"
          fill="#93c5fd"
          fontSize={13}
          fontWeight={700}
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          Human Interface (Web)
        </text>
        {humanFeatures.map((feat, i) => (
          <text
            key={feat}
            x={laneX2 + 24}
            y={laneY + 52 + i * 28}
            fill="#7dd3fc"
            fontSize={12}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {feat}
          </text>
        ))}

        {/* Arrows down to graph */}
        <FlowArrow
          x1={laneX1 + laneW / 2}
          y1={laneY + laneH}
          x2={laneX1 + laneW / 2}
          y2={graphY}
          color="rgba(168,85,247,0.4)"
          dashed
        />
        <FlowArrow
          x1={laneX2 + laneW / 2}
          y1={laneY + laneH}
          x2={laneX2 + laneW / 2}
          y2={graphY}
          color="rgba(59,130,246,0.4)"
          dashed
        />

        {/* Shared graph box */}
        <FlowNode
          x={graphX}
          y={graphY}
          width={graphW}
          height={graphH}
          label="HIVE GRAPH"
          subtitle="Typed hexes + conditional edges stored in Redis"
          fill="#0f1015"
          stroke="#f59e0b"
          textColor="#fcd34d"
          subtitleColor="#6b7280"
          fontSize={16}
          rx={12}
        />
      </svg>
    </div>
  );
}
