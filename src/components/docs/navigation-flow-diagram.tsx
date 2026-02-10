import { FlowNode } from "./flow-node";
import { FlowArrow } from "./flow-arrow";

/**
 * Centerpiece diagram: 5-stage vertical flow showing how agents navigate.
 * Query → Enter → Next Steps → Traverse → Deposit
 * With a loop-back arrow from Traverse to Enter.
 */
export function NavigationFlowDiagram() {
  const w = 680;
  const h = 820;

  // Stage layout
  const nodeW = 200;
  const nodeH = 52;
  const startX = (w - nodeW) / 2;
  const gapY = 100;
  const startY = 40;

  // Annotation box dimensions
  const annotW = 160;
  const annotH = 40;

  const stages = [
    {
      label: "hive_query",
      subtitle: "Find relevant hexes",
      stroke: "#3b82f6",
      textColor: "#93c5fd",
      annotLeft: "intent: string",
      annotRight: "hex[] + scores",
    },
    {
      label: "hive_enter",
      subtitle: "Load hex contents",
      stroke: "#22c55e",
      textColor: "#86efac",
      annotLeft: "hexId: string",
      annotRight: "hex.contents",
    },
    {
      label: "hive_next_steps",
      subtitle: "Get matching edges",
      stroke: "#3b82f6",
      textColor: "#93c5fd",
      annotLeft: "hexId + payload",
      annotRight: "edge[] (filtered)",
    },
    {
      label: "hive_traverse",
      subtitle: "Follow an edge",
      stroke: "#22c55e",
      textColor: "#86efac",
      annotLeft: "hexId + edgeId",
      annotRight: "destination hex",
    },
    {
      label: "hive_deposit",
      subtitle: "Write data to hex",
      stroke: "#a855f7",
      textColor: "#d8b4fe",
      annotLeft: "hexId + data",
      annotRight: "updated contents",
    },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-2xl mx-auto"
        role="img"
        aria-label="Navigation flow diagram showing the 5 MCP tools agents use to traverse the graph"
      >
        {stages.map((stage, i) => {
          const y = startY + i * (nodeH + gapY);
          const centerX = startX + nodeW / 2;

          return (
            <g key={stage.label}>
              {/* Main node */}
              <FlowNode
                x={startX}
                y={y}
                width={nodeW}
                height={nodeH}
                label={stage.label}
                subtitle={stage.subtitle}
                stroke={stage.stroke}
                textColor={stage.textColor}
              />

              {/* Left annotation (input) */}
              <rect
                x={startX - annotW - 32}
                y={y + (nodeH - annotH) / 2}
                width={annotW}
                height={annotH}
                rx={6}
                fill="#0f1015"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
              />
              <text
                x={startX - annotW / 2 - 32}
                y={y + nodeH / 2 + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#6b7280"
                fontSize={10}
                fontFamily="ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace"
              >
                {stage.annotLeft}
              </text>
              {/* Arrow from annotation to node */}
              <FlowArrow
                x1={startX - 32 + 2}
                y1={y + nodeH / 2}
                x2={startX - 4}
                y2={y + nodeH / 2}
                color="rgba(255,255,255,0.15)"
                strokeWidth={1}
              />

              {/* Right annotation (output) */}
              <rect
                x={startX + nodeW + 32}
                y={y + (nodeH - annotH) / 2}
                width={annotW}
                height={annotH}
                rx={6}
                fill="#0f1015"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
              />
              <text
                x={startX + nodeW + 32 + annotW / 2}
                y={y + nodeH / 2 + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#6b7280"
                fontSize={10}
                fontFamily="ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace"
              >
                {stage.annotRight}
              </text>
              {/* Arrow from node to annotation */}
              <FlowArrow
                x1={startX + nodeW + 4}
                y1={y + nodeH / 2}
                x2={startX + nodeW + 30}
                y2={y + nodeH / 2}
                color="rgba(255,255,255,0.15)"
                strokeWidth={1}
              />

              {/* Vertical arrow to next stage */}
              {i < stages.length - 1 && (
                <FlowArrow
                  x1={centerX}
                  y1={y + nodeH}
                  x2={centerX}
                  y2={y + nodeH + gapY - 2}
                  color="rgba(255,255,255,0.2)"
                />
              )}
            </g>
          );
        })}

        {/* Loop-back arrow: Traverse → Enter (repeat as needed) */}
        {(() => {
          const traverseY = startY + 3 * (nodeH + gapY) + nodeH / 2;
          const enterY = startY + 1 * (nodeH + gapY) + nodeH / 2;
          const loopX = startX - annotW - 70;

          return (
            <g>
              {/* Vertical line down from traverse side */}
              <path
                d={`
                  M ${startX - 4} ${traverseY}
                  L ${loopX} ${traverseY}
                  L ${loopX} ${enterY}
                  L ${startX - 4} ${enterY}
                `}
                fill="none"
                stroke="rgba(245,158,11,0.35)"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                markerEnd="url(#loop-arrow)"
              />
              <defs>
                <marker
                  id="loop-arrow"
                  viewBox="0 0 10 7"
                  refX="10"
                  refY="3.5"
                  markerWidth="8"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="rgba(245,158,11,0.35)"
                  />
                </marker>
              </defs>
              <text
                x={loopX - 4}
                y={(traverseY + enterY) / 2}
                textAnchor="middle"
                fill="#f59e0b"
                fontSize={10}
                fontFamily="system-ui, -apple-system, sans-serif"
                transform={`rotate(-90, ${loopX - 4}, ${(traverseY + enterY) / 2})`}
              >
                repeat as needed
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
