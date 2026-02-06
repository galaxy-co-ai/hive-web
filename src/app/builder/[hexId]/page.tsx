import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wizard } from "@/components/builder/wizard";
import { getHex } from "@/lib/kv";

interface PageProps {
  params: Promise<{ hexId: string }>;
}

export default async function EditHexPage({ params }: PageProps) {
  const { hexId } = await params;
  const hex = await getHex(hexId);

  if (!hex) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/viewer/${hexId}`}>← Back to hex</Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Edit hex</h1>
        <p className="mt-1 font-mono text-muted-foreground">{hexId}</p>
      </div>

      <Wizard mode="edit" initialData={hex} />
    </div>
  );
}
