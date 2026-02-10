export function HeroSection() {
  return (
    <section id="overview" className="scroll-mt-24 relative">
      {/* Amber radial glow */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[480px] h-[320px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Agents don&apos;t search&nbsp;&mdash;
          <br />
          <span className="text-gray-500">they pathfind.</span>
        </h1>

        <p className="mt-6 text-lg text-gray-400 max-w-xl">
          Hive is a knowledge graph navigated by AI agents through MCP tools.
          Instead of keyword matching, agents traverse typed hexes along
          conditional edges&nbsp;&mdash; carrying context as payload.
        </p>

        <div className="mt-8 flex items-center gap-2 flex-wrap font-mono text-sm">
          <Step label="intent" color="#f59e0b" />
          <Arrow />
          <Step label="query" color="#3b82f6" />
          <Arrow />
          <Step label="enter" color="#22c55e" />
          <Arrow />
          <Step label="traverse" color="#a855f7" />
          <Arrow />
          <Step label="done" color="#6b7280" />
        </div>
      </div>
    </section>
  );
}

function Step({ label, color }: { label: string; color: string }) {
  return (
    <code
      className="px-3 py-1 rounded-md text-xs font-medium"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </code>
  );
}

function Arrow() {
  return <span className="text-gray-600 text-xs select-none">&rarr;</span>;
}
