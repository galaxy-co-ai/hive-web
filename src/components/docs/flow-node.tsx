/**
 * Reusable SVG node primitive for flow diagrams.
 * Renders a rounded pill with label text and optional subtitle.
 */

interface FlowNodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  subtitle?: string;
  fill?: string;
  stroke?: string;
  textColor?: string;
  subtitleColor?: string;
  fontSize?: number;
  rx?: number;
}

export function FlowNode({
  x,
  y,
  width,
  height,
  label,
  subtitle,
  fill = "#0f1015",
  stroke = "#3b82f6",
  textColor = "#93c5fd",
  subtitleColor = "#6b7280",
  fontSize = 13,
  rx = 8,
}: FlowNodeProps) {
  const cx = x + width / 2;
  const cy = subtitle ? y + height / 2 - 6 : y + height / 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={rx}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
        opacity={0.95}
      />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textColor}
        fontSize={fontSize}
        fontWeight={600}
        fontFamily="ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace"
      >
        {label}
      </text>
      {subtitle && (
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fill={subtitleColor}
          fontSize={10}
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {subtitle}
        </text>
      )}
    </g>
  );
}
