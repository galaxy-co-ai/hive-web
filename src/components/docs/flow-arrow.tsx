/**
 * Reusable SVG arrow primitive for flow diagrams.
 * Renders a line (straight or curved) with an arrowhead.
 */

interface FlowArrowProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  strokeWidth?: number;
  dashed?: boolean;
  /** Label text positioned at midpoint */
  label?: string;
  labelColor?: string;
  /** Curve offset — positive = right, negative = left, 0 = straight */
  curve?: number;
}

export function FlowArrow({
  x1,
  y1,
  x2,
  y2,
  color = "rgba(255,255,255,0.2)",
  strokeWidth = 1.5,
  dashed = false,
  label,
  labelColor = "#6b7280",
  curve = 0,
}: FlowArrowProps) {
  const markerId = `arrow-${Math.round(x1)}-${Math.round(y1)}-${Math.round(x2)}-${Math.round(y2)}`;

  // Build path
  let d: string;
  let midX: number;
  let midY: number;

  if (curve !== 0) {
    const cpx = (x1 + x2) / 2 + curve;
    const cpy = (y1 + y2) / 2;
    d = `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`;
    // Approximate midpoint on quadratic bezier
    midX = (x1 + 2 * cpx + x2) / 4;
    midY = (y1 + 2 * cpy + y2) / 4;
  } else {
    d = `M ${x1} ${y1} L ${x2} ${y2}`;
    midX = (x1 + x2) / 2;
    midY = (y1 + y2) / 2;
  }

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 7"
          refX="10"
          refY="3.5"
          markerWidth="8"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? "6 4" : undefined}
        markerEnd={`url(#${markerId})`}
      />
      {label && (
        <text
          x={midX}
          y={midY - 8}
          textAnchor="middle"
          fill={labelColor}
          fontSize={10}
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {label}
        </text>
      )}
    </g>
  );
}
