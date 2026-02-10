import Link from "next/link";
import { DocNav } from "@/components/docs/doc-nav";
import { DocSection } from "@/components/docs/doc-section";
import { HeroSection } from "@/components/docs/hero-section";
import { ArchitectureDiagram } from "@/components/docs/architecture-diagram";
import { NavigationFlowDiagram } from "@/components/docs/navigation-flow-diagram";
import { HexTypeLegend } from "@/components/docs/hex-type-legend";
import { EdgeConditionsSection } from "@/components/docs/edge-conditions-section";
import { DataModelSection } from "@/components/docs/data-model-section";
import { ExampleWalkthrough } from "@/components/docs/example-walkthrough";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-gray-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#0f1015]/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-semibold text-lg text-white hover:text-gray-300 transition-colors"
            >
              Hive
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/viewer"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Viewer
              </Link>
              <Link
                href="/viewer/graph"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Graph
              </Link>
              <Link
                href="/docs"
                className="text-sm text-white transition-colors"
              >
                Docs
              </Link>
            </nav>
          </div>
          <Link
            href="/builder"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Builder
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-16 flex gap-16">
        <DocNav />

        <main className="min-w-0 flex-1 max-w-[65ch] space-y-24">
          {/* 1. Hero / Overview */}
          <HeroSection />

          {/* 2. Architecture */}
          <DocSection
            id="architecture"
            title="Two Interfaces, One Graph"
            subtitle="Agents use MCP tools. Humans use the web UI. Both read and write the same graph."
          >
            <ArchitectureDiagram />
          </DocSection>

          {/* 3. Navigation Flow */}
          <DocSection
            id="navigation-flow"
            title="Navigation Flow"
            subtitle="Five MCP tools that agents chain together to pathfind through the graph."
          >
            <NavigationFlowDiagram />
          </DocSection>

          {/* 4. Hex Types */}
          <DocSection
            id="hex-types"
            title="Hex Types"
            subtitle="Every hex has a type that determines its role in the graph."
          >
            <HexTypeLegend />
          </DocSection>

          {/* 5. Edge Conditions + Transforms */}
          <DocSection
            id="edge-conditions"
            title="Edges: Conditions & Transforms"
            subtitle="Edges are conditional pathways. They filter on context and reshape the payload in transit."
          >
            <EdgeConditionsSection />
          </DocSection>

          {/* 6. Data Model */}
          <DocSection
            id="data-model"
            title="Data Model"
            subtitle="The two core schemas that define the graph."
          >
            <DataModelSection />
          </DocSection>

          {/* 7. Example Walkthrough */}
          <DocSection
            id="example"
            title="Example: Button Styling Rules"
            subtitle="Trace an agent's journey through 3 hexes to find interactive design rules."
          >
            <ExampleWalkthrough />
          </DocSection>

          {/* Footer spacer */}
          <div className="h-24" />
        </main>
      </div>
    </div>
  );
}
