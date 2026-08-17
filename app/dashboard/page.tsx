"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/card";
import Button from "@/components/ui/Button";

type WardrobeStats = {
  total_items: number;
  by_category: Record<string, number>;
  by_color: Record<string, number>;
  by_style: Record<string, number>;
  by_occasion: Record<string, number>;
  never_worn_count: number;
  never_worn_items: { id: string; category: string | null; image_url: string | null }[];
  most_worn_items: { id: string; category: string | null; image_url: string | null; wear_count: number }[];
};

type Gap = {
  ecosystem: string;
  suggestion: string;
};

type ColorGaps = {
  wardrobe_clusters: { centroid: { r: number; g: number; b: number }; item_count: number }[];
  covered_ecosystems: string[];
  gaps: Gap[];
};

function topEntry(record: Record<string, number>): string | null {
  const entries = Object.entries(record);
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<WardrobeStats | null>(null);
  const [colorGaps, setColorGaps] = useState<ColorGaps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("selea_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/stats`, { headers }).then((res) => {
        if (!res.ok) throw new Error("Failed to load stats");
        return res.json();
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/color-gaps`, { headers }).then((res) => {
        if (!res.ok) throw new Error("Failed to load color analysis");
        return res.json();
      }),
    ])
      .then(([statsData, gapsData]) => {
        setStats(statsData);
        setColorGaps(gapsData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong"))
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

  const isEmpty = !stats || stats.total_items === 0;

  return (
    <main className="flex-1 px-6 py-16 bg-ivory">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-2">Your wardrobe</h1>
        <p className="text-taupe mb-12">
          An overview of what you own and how you wear it.
        </p>

        {error && <p className="text-sm text-red-700 mb-6">{error}</p>}

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
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16">
              <Card className="p-6">
                <p className="text-xs uppercase tracking-wide text-taupe mb-1">Pieces</p>
                <p className="text-3xl">{stats.total_items}</p>
              </Card>
              <Card className="p-6">
                <p className="text-xs uppercase tracking-wide text-taupe mb-1">Dominant color</p>
                <p className="text-3xl">{topEntry(stats.by_color) ?? "—"}</p>
              </Card>
              <Card className="p-6">
                <p className="text-xs uppercase tracking-wide text-taupe mb-1">Never worn</p>
                <p className="text-3xl">{stats.never_worn_count}</p>
              </Card>
              <Card className="p-6">
                <p className="text-xs uppercase tracking-wide text-taupe mb-1">Top category</p>
                <p className="text-lg">{topEntry(stats.by_category) ?? "—"}</p>
              </Card>
              <Card className="p-6">
                <p className="text-xs uppercase tracking-wide text-taupe mb-1">Dominant style</p>
                <p className="text-lg">{topEntry(stats.by_style) ?? "—"}</p>
              </Card>
              <Card className="p-6">
                <p className="text-xs uppercase tracking-wide text-taupe mb-1">Top occasion</p>
                <p className="text-lg">{topEntry(stats.by_occasion) ?? "—"}</p>
              </Card>
            </div>

            {colorGaps && (
              <div>
                <h2 className="text-xl mb-2">Color palette analysis</h2>
                <p className="text-taupe mb-6">
                  Based on the color families in your current pieces.
                </p>

                {colorGaps.covered_ecosystems.length > 0 && (
                  <div className="mb-8">
                    <p className="text-xs uppercase tracking-wide text-taupe mb-3">
                      Well covered
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {colorGaps.covered_ecosystems.map((eco) => (
                        <span
                          key={eco}
                          className="px-4 py-2 text-xs uppercase tracking-wide border border-taupe/30 text-ink"
                        >
                          {eco}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {colorGaps.gaps.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-wide text-taupe mb-1">
                      Missing from your wardrobe
                    </p>
                    {colorGaps.gaps.map((gap) => (
                      <Card key={gap.ecosystem} className="p-6">
                        <p className="text-sm mb-1">{gap.ecosystem}</p>
                        <p className="text-taupe text-sm">{gap.suggestion}</p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-taupe text-sm">
                    Your wardrobe already covers all major color families. Nicely balanced.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}