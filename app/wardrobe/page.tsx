"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/Button";

type Item = {
  id: string;
  category: string;
  subcategory: string;
  color: string;
  swatch: string; // placeholder color block until real images exist
};

// Mock wardrobe — will be replaced by a real call to GET /wardrobe/items.
const MOCK_ITEMS: Item[] = [
  { id: "1", category: "Top", subcategory: "Tailored Blazer", color: "Beige", swatch: "#E4D9C9" },
  { id: "2", category: "Bottom", subcategory: "Straight-leg Trouser", color: "Black", swatch: "#1C1B19" },
  { id: "3", category: "Top", subcategory: "Silk Blouse", color: "White", swatch: "#FAF7F2" },
  { id: "4", category: "Shoes", subcategory: "Loafers", color: "Brown", swatch: "#6B4226" },
  { id: "5", category: "Outerwear", subcategory: "Wool Coat", color: "Camel", swatch: "#C19A6B" },
  { id: "6", category: "Bottom", subcategory: "Denim Jeans", color: "Denim Blue", swatch: "#4A6FA5" },
];

export default function Wardrobe() {
  const [query, setQuery] = useState("");

  const filtered = MOCK_ITEMS.filter((item) =>
    `${item.category} ${item.subcategory} ${item.color}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const isEmpty = MOCK_ITEMS.length === 0;

  return (
    <main className="flex-1 px-6 py-16 bg-ivory">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl mb-1">Your wardrobe</h1>
            <p className="text-taupe">{MOCK_ITEMS.length} pieces</p>
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

        {isEmpty ? (
          <Card className="p-12 text-center">
            <h2 className="text-xl mb-2">No items yet</h2>
            <p className="text-taupe mb-8">Add your first piece to get started.</p>
            <Link href="/upload">
              <Button variant="primary">Add your first item</Button>
            </Link>
          </Card>
        ) : filtered.length === 0 ? (
          <p className="text-taupe">No items match "{query}".</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <Card key={item.id} hoverable className="overflow-hidden cursor-pointer">
                <div
                  className="aspect-[3/4]"
                  style={{ backgroundColor: item.swatch }}
                />
                <div className="p-3">
                  <p className="text-sm font-medium">{item.subcategory}</p>
                  <p className="text-xs text-taupe uppercase tracking-wide">{item.color}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}