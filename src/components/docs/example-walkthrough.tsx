import { HEX_COLORS } from "@/components/honeycomb/utils/constants";
import { hexPoints } from "@/components/honeycomb/utils/hexMath";
import type { HexType } from "@/lib/schemas";

/**
 * Traced walkthrough: "Agent needs button styling rules"
 * Shows a mini honeycomb graph and step-by-step narrative with JSON payloads.
 */

interface WalkthroughStep {
  step: number;
  tool: string;
  toolColor: string;
  description: string;
  activeHex: string;
  payload: string;
}

const steps: WalkthroughStep[] = [
  {
    step: 1,
    tool: "hive_query",
    toolColor: "#3b82f6",
    activeHex: "constitution",
    description:
      'Agent searches for "button styling rules". The query matches the engineering-constitution hex via its entry hint "interactive element design rules".',
    payload: `{
  "intent": "button styling rules",
  "results": [{
    "hex": "engineering-constitution",
    "score": 0.92,
    "matchedHints": ["interactive element design rules"]
  }]
}`,
  },
  {
    step: 2,
    tool: "hive_enter",
    toolColor: "#22c55e",
    activeHex: "constitution",
    description:
      "Agent enters the constitution hex. It receives the full contents — design principles, spacing rules, and typography guidelines.",
    payload: `{
  "hexId": "engineering-constitution",
  "contents": {
    "data": { "principles": [...], "spacing": {...} },
    "refs": ["interactive-states", "motion-system"]
  }
}`,
  },
  {
    step: 3,
    tool: "hive_next_steps",
    toolColor: "#3b82f6",
    activeHex: "constitution",
    description:
      'Agent asks for next steps. Two edges match — one for "interactive" (intent match), one for "motion" (always). The interactive edge has higher priority.',
    payload: `{
  "edges": [
    { "id": "to-interactive", "to": "interactive-states",
      "priority": 80, "when": { "intent": "button" } },
    { "id": "to-motion", "to": "motion-system",
      "priority": 40, "when": { "always": true } }
  ]
}`,
  },
  {
    step: 4,
    tool: "hive_traverse",
    toolColor: "#22c55e",
    activeHex: "interactive",
    description:
      "Agent follows the interactive-states edge. The edge transform injects the source hex ID into the payload for context tracking.",
    payload: `{
  "hexId": "engineering-constitution",
  "edgeId": "to-interactive",
  "destination": {
    "id": "interactive-states",
    "contents": {
      "data": {
        "hover": "150ms ease-out, scale 1.02",
        "active": "scale 0.98, brightness 0.95",
        "focus": "2px ring, offset 2px",
        "disabled": "opacity 0.5, no pointer"
      }
    }
  }
}`,
  },
  {
    step: 5,
    tool: "done",
    toolColor: "#6b7280",
    activeHex: "interactive",
    description:
      "Agent has the button styling rules: all four interactive states with timing, transforms, and accessibility requirements. Task complete.",
    payload: `// Agent now has:
// - 4 interactive states (hover, active, focus, disabled)
// - Timing values (150ms hover, 300ms transitions)
// - Transform values (scale, brightness, opacity)
// - Accessibility (focus ring, pointer behavior)`,
  },
];

// Mini graph hex positions
const hexes: { id: string; label: string; type: HexType; cx: number; cy: number }[] = [
  { id: "constitution", label: "constitution", type: "data", cx: 160, cy: 60 },
  { id: "interactive", label: "interactive", type: "data", cx: 80, cy: 150 },
  { id: "motion", label: "motion", type: "data", cx: 240, cy: 150 },
];

export function ExampleWalkthrough() {
  return (
    <div className="space-y-8">
      {/* Mini graph */}
      <div className="rounded-xl border border-white/10 bg-[#0f1015] p-6">
        <p className="text-xs text-gray-500 mb-4 font-mono">
          Subgraph: engineering-constitution neighborhood
        </p>
        <svg
          viewBox="0 0 320 200"
          className="w-full max-w-sm mx-auto"
          role="img"
          aria-label="Mini honeycomb graph showing 3 connected hexes"
        >
          {/* Connection lines */}
          <line
            x1={hexes[0].cx}
            y1={hexes[0].cy}
            x2={hexes[1].cx}
            y2={hexes[1].cy}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <line
            x1={hexes[0].cx}
            y1={hexes[0].cy}
            x2={hexes[2].cx}
            y2={hexes[2].cy}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />

          {/* Hexes */}
          {hexes.map((hex) => {
            const colors = HEX_COLORS[hex.type];
            return (
              <g key={hex.id}>
                <defs>
                  <linearGradient
                    id={`walk-fill-${hex.id}`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={colors.innerStart} />
                    <stop offset="100%" stopColor={colors.innerEnd} />
                  </linearGradient>
                  <filter id={`walk-glow-${hex.id}`}>
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <polygon
                  points={hexPoints(hex.cx, hex.cy, 32)}
                  fill={`url(#walk-fill-${hex.id})`}
                  stroke={colors.border}
                  strokeWidth={1.5}
                  filter={`url(#walk-glow-${hex.id})`}
                />
                <text
                  x={hex.cx}
                  y={hex.cy + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={colors.text}
                  fontSize={9}
                  fontFamily="ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace"
                >
                  {hex.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Step cards */}
      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.step}
            className="rounded-xl border border-white/10 bg-[#0f1015] overflow-hidden"
          >
            {/* Step header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5">
              <span
                className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${step.toolColor}20`,
                  color: step.toolColor,
                }}
              >
                {step.step}
              </span>
              <code
                className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${step.toolColor}15`,
                  color: step.toolColor,
                }}
              >
                {step.tool}
              </code>
              {step.activeHex && (
                <span className="text-xs text-gray-600">
                  @ {step.activeHex}
                </span>
              )}
            </div>

            {/* Step body */}
            <div className="px-5 py-4">
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                {step.description}
              </p>
              <pre className="text-xs font-mono text-gray-500 bg-black/30 rounded-lg p-4 overflow-x-auto leading-relaxed">
                {step.payload}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
