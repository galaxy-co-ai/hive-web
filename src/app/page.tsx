import Link from "next/link";
import { DropZone } from "@/components/ingest/drop-zone";
import { Badge } from "@/components/ui/badge";

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
        <div className="text-center space-y-4 mb-12">
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

        {/* Drop Zone */}
        <DropZone />

        {/* Supported Formats */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          <Badge variant="outline">PDF</Badge>
          <Badge variant="outline">TXT</Badge>
          <Badge variant="outline">Markdown</Badge>
          <Badge variant="outline">URL</Badge>
        </div>
      </div>
    </main>
  );
}
