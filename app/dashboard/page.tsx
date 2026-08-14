import Link from "next/link";
import Card from "@/components/ui/card";
import Button from "@/components/ui/Button";

// Placeholder data — will be replaced by a real API call to GET /dashboard once the backend exists.
const MOCK_STATS = {
  totalPieces: 0,
  mostWorn: null as string | null,
  leastWorn: null as string | null,
  dominantColor: null as string | null,
  styleProfile: [] as string[],
  outfitPotential: 0,
};

export default function Dashboard() {
  const isEmpty = MOCK_STATS.totalPieces === 0;

  return (
    <main className="flex-1 px-6 py-16 bg-ivory">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-2">Your wardrobe</h1>
        <p className="text-taupe mb-12">
          An overview of what you own and how you wear it.
        </p>

        {isEmpty ? (
          <Card className="p-12 text-center">
            <h2 className="text-xl mb-2">Your wardrobe is empty</h2>
            <p className="text-taupe mb-8 max-w-sm mx-auto">
              Add your first piece to start seeing insights, outfit ideas,
              and gap analysis here.
            </p>
            <Link href="/upload">
              <Button variant="primary">Add your first item</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <p className="text-xs uppercase tracking-wide text-taupe mb-1">Pieces</p>
              <p className="text-3xl">{MOCK_STATS.totalPieces}</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs uppercase tracking-wide text-taupe mb-1">Dominant color</p>
              <p className="text-3xl">{MOCK_STATS.dominantColor ?? "—"}</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs uppercase tracking-wide text-taupe mb-1">Outfit potential</p>
              <p className="text-3xl">{MOCK_STATS.outfitPotential} combos</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs uppercase tracking-wide text-taupe mb-1">Most worn</p>
              <p className="text-lg">{MOCK_STATS.mostWorn ?? "—"}</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs uppercase tracking-wide text-taupe mb-1">Least worn</p>
              <p className="text-lg">{MOCK_STATS.leastWorn ?? "—"}</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs uppercase tracking-wide text-taupe mb-1">Style profile</p>
              <p className="text-lg">{MOCK_STATS.styleProfile.join(" / ") || "—"}</p>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}