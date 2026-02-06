import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wizard } from "@/components/builder/wizard";

export default function BuilderPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/viewer">← Back to viewer</Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Create hex</h1>
        <p className="mt-1 text-muted-foreground">
          Add a new hex to the honeycomb navigation graph
        </p>
      </div>

      <Wizard mode="create" />
    </div>
  );
}
