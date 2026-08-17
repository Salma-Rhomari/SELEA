"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";

type OutfitItem = {
  id: string;
  category: string;
  image_url: string | null;
  color: string | null;
  style: string | null;
};

type GeneratedOutfit = {
  items: OutfitItem[];
};

const MOODS = [
  "confident",
  "cozy",
  "romantic",
  "edgy",
  "playful",
  "professional",
];

export default function StyleMe() {
  const router = useRouter();
  const [mood, setMood] = useState<string | null>(null);
  const [occasion, setOccasion] = useState("");
  const [outfits, setOutfits] = useState<GeneratedOutfit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());
  const [outfitNames, setOutfitNames] = useState<Record<number, string>>({});
  const [outfitErrors, setOutfitErrors] = useState<Record<number, string>>({});

  const generate = async () => {
    if (!mood) return;
    setError("");
    setLoading(true);
    setOutfits(null);
    setSavedIndices(new Set());
    setOutfitErrors({});
    setOutfitNames({});

    try {
      const token = localStorage.getItem("selea_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/outfits/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood,
          occasion: occasion || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Failed to generate outfits"
        );
      }

      const data = await res.json();
      setOutfits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const saveOutfit = async (outfit: GeneratedOutfit, index: number) => {
    setOutfitErrors((prev) => ({ ...prev, [index]: "" }));
    setSavingIndex(index);

    try {
      const token = localStorage.getItem("selea_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const name = outfitNames[index] || `${mood} outfit`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/outfits/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          occasion: occasion || null,
          style: mood,
          item_ids: outfit.items.map((item) => item.id),
        }),
      });

      if (res.status === 409) {
        setOutfitErrors((prev) => ({
          ...prev,
          [index]: "You've already saved this exact outfit.",
        }));
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          typeof data?.detail === "string" ? data.detail : "Failed to save outfit"
        );
      }

      setSavedIndices((prev) => new Set(prev).add(index));
    } catch (err) {
      setOutfitErrors((prev) => ({
        ...prev,
        [index]: err instanceof Error ? err.message : "Something went wrong",
      }));
    } finally {
      setSavingIndex(null);
    }
  };

  return (
    <main className="flex-1 px-6 py-16 bg-ivory">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-2">Style Me</h1>
        <p className="text-taupe mb-12">Pick a mood — SELÉA builds the outfit</p>

        <div className="mb-10">
          <p className="text-xs uppercase tracking-wide text-taupe mb-3">Mood</p>
          <div className="flex flex-wrap gap-3">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-5 py-2 text-sm uppercase tracking-wide border transition-colors duration-200 ${
                  mood === m
                    ? "bg-ink text-ivory border-ink"
                    : "border-taupe/40 text-ink hover:border-ink"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10 max-w-sm">
          <Input
            label="Occasion (optional)"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder="e.g. work, date night, casual"
          />
        </div>

        <div className="flex gap-4">
          <Button variant="primary" onClick={generate} disabled={!mood || loading}>
            {loading ? "Generating…" : "Generate outfits"}
          </Button>

          {outfits && (
            <Button variant="secondary" onClick={generate} disabled={!mood || loading}>
              {loading ? "Regenerating…" : "Regenerate"}
            </Button>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-700 mt-4 max-w-md">{error}</p>
        )}

        {outfits && outfits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {outfits.map((outfit, index) => (
              <Card key={index} className="p-5">
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {outfit.items.map((item) => (
                    <img
                      key={item.id}
                      src={item.image_url ?? "https://placehold.co/300x400"}
                      alt={item.category}
                      className="w-full aspect-[3/4] object-cover"
                    />
                  ))}
                </div>

                {savedIndices.has(index) ? (
                  <p className="text-sm text-taupe text-center">Saved ✓</p>
                ) : (
                  <div className="space-y-3">
                    <Input
                      label="Name this outfit"
                      value={outfitNames[index] || ""}
                      onChange={(e) =>
                        setOutfitNames((prev) => ({ ...prev, [index]: e.target.value }))
                      }
                      placeholder={`${mood} outfit`}
                    />
                    {outfitErrors[index] && (
                      <p className="text-xs text-red-700">{outfitErrors[index]}</p>
                    )}
                    <Button
                      variant="accent"
                      className="w-full"
                      onClick={() => saveOutfit(outfit, index)}
                      disabled={savingIndex === index}
                    >
                      {savingIndex === index ? "Saving…" : "Save outfit"}
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {outfits && outfits.length === 0 && (
          <p className="text-taupe mt-16">
            No outfits found for this mood. Try another one or add more items to your wardrobe.
          </p>
        )}
      </div>
    </main>
  );
}