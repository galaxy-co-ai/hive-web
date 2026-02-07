import Link from "next/link";
import { FloatingIngest } from "@/components/ingest/floating-ingest";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-lg">Hive</span>
          <div className="flex gap-4">
            <Link
              href="/viewer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Viewer
            </Link>
            <Link
              href="/builder"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Builder
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Drop anything.
            <br />
            <span className="text-muted-foreground">Discover everything.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Transform documents into searchable knowledge. AI extracts the
            structure, you explore the connections.
          </p>
        </div>

        {/* Content below hero - placeholder for user to specify */}
      </div>

      {/* Floating Ingest Button */}
      <FloatingIngest />
    </main>
  );
}
