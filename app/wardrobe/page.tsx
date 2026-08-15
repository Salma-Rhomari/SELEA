"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/Button";

type Item = {
  id: string;
  category: string;
  subcategory: string | null;
  color: string | null;
  image_url: string;
};

// Rough color name -> hex mapping for the placeholder swatch until real photos render.
const COLOR_SWATCHES: Record<string, string> = {
  beige: "#E4D9C9",
  black: "#1C1B19",
  white: "#FAF7F2",
  brown: "#6B4226",
  camel: "#C19A6B",
  "denim blue": "#4A6FA5",
  blue: "#4A6FA5",
  navy: "#1B2A4A",
  grey: "#9C9B96",
  gray: "#9C9B96",
  red: "#8B2E2E",
  green: "#4A5F42",
};

function swatchFor(color: string | null) {
  if (!color) return "#D9D2C4";
  return COLOR_SWATCHES[color.toLowerCase()] ?? "#D9D2C4";
}

export default function Wardrobe() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("selea_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/wardrobe/items`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load wardrobe");
        return res.json();
      })
      .then((data) => setItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = items.filter((item) =>
    `${item.category} ${item.subcategory ?? ""} ${item.color ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const isEmpty = items.length === 0;

  if (loading) {
    return (
      <main className="flex-1 px-6 py-16 bg-ivory">
        <div className="max-w-5xl mx-auto">
          <p className="text-taupe">Loading your wardrobe…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-16 bg-ivory">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl mb-1">Your wardrobe</h1>
            <p className="text-taupe">{items.length} pieces</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-64">
              <Input
                placeholder="Search — e.g. 'black trousers'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Link href="/upload">
              <Button variant="secondary">+ Add item</Button>
            </Link>
          </div>
        </div>

        {error && <p className="text-sm text-red-700 mb-6">{error}</p>}

        {isEmpty ? (
          <Card className="p-12 text-center">
            <h2 className="text-xl mb-2">No items yet</h2>
            <p className="text-taupe mb-8">Add your first piece to get started.</p>
            <Link href="/upload">
              <Button variant="primary">Add your first item</Button>
            </Link>
          </Card>
        ) : filtered.length === 0 ? (
          <p className="text-taupe">No items match &quot;{query}&quot;.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <Card key={item.id} hoverable className="overflow-hidden cursor-pointer">
                <div
                  className="aspect-[3/4]"
                  style={{ backgroundColor: swatchFor(item.color) }}
                />
                <div className="p-3">
                  <p className="text-sm font-medium">{item.subcategory ?? item.category}</p>
                  <p className="text-xs text-taupe uppercase tracking-wide">{item.color ?? "—"}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}