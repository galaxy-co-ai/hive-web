import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HexDetail } from "@/components/viewer/hex-detail";
import { getHex } from "@/lib/kv";

interface PageProps {
  params: Promise<{ hexId: string }>;
}

export default async function HexDetailPage({ params }: PageProps) {
  const { hexId } = await params;
  const hex = await getHex(hexId);

  if (!hex) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/viewer">← Back to viewer</Link>
        </Button>
      </div>

      <HexDetail hex={hex} />
    </div>
  );
}
