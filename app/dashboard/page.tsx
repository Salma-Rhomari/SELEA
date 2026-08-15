"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/card";
import Button from "@/components/ui/Button";

type Item = {
  id: string;
  category: string;
  subcategory: string | null;
  color: string | null;
  style: string | null;
  wear_count: number;
};

function computeStats(items: Item[]) {
  const totalPieces = items.length;

  const colorCounts: Record<string, number> = {};
  items.forEach((i) => {
    if (i.color) colorCounts[i.color] = (colorCounts[i.color] ?? 0) + 1;
  });
  const dominantColor =
    Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const sortedByWear = [...items].sort((a, b) => b.wear_count - a.wear_count);
  const mostWorn = sortedByWear[0]?.subcategory ?? sortedByWear[0]?.category ?? null;
  const leastWorn =
    sortedByWear[sortedByWear.length - 1]?.subcategory ??
    sortedByWear[sortedByWear.length - 1]?.category ??
    null;

  const styleProfile = Array.from(
    new Set(items.map((i) => i.style).filter((s): s is string => !!s))
  );

  // Rough placeholder combinatorics until the real outfit engine (Phase 8) exists.
  const tops = items.filter((i) => i.category?.toLowerCase() === "top").length;
  const bottoms = items.filter((i) => i.category?.toLowerCase() === "bottom").length;
  const outfitPotential = tops && bottoms ? tops * bottoms : 0;

  return { totalPieces, dominantColor, mostWorn, leastWorn, styleProfile, outfitPotential };
}

export default function Dashboard() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("selea_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/wardrobe/items`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <main className="flex-1 px-6 py-16 bg-ivory">
        <div className="max-w-4xl mx-auto">
          <p className="text-taupe">Loading your wardrobe…</p>
        </div>
      </main>
    );
  }

  const stats = computeStats(items);
  const isEmpty = stats.totalPieces === 0;

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
              <p className="text-3xl">{stats.totalPieces}</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs uppercase tracking-wide text-taupe mb-1">Dominant color</p>
              <p className="text-3xl">{stats.dominantColor ?? "—"}</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs uppercase tracking-wide text-taupe mb-1">Outfit potential</p>
              <p className="text-3xl">{stats.outfitPotential} combos</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs uppercase tracking-wide text-taupe mb-1">Most worn</p>
              <p className="text-lg">{stats.mostWorn ?? "—"}</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs uppercase tracking-wide text-taupe mb-1">Least worn</p>
              <p className="text-lg">{stats.leastWorn ?? "—"}</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs uppercase tracking-wide text-taupe mb-1">Style profile</p>
              <p className="text-lg">{stats.styleProfile.join(" / ") || "—"}</p>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}