"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/card";
import Button from "@/components/ui/Button";

type OutfitItem = {
  id: string;
  category: string;
  image_url: string | null;
  color: string | null;
  style: string | null;
};

type Outfit = {
  id: string;
  name: string;
  occasion: string | null;
  style: string | null;
  weather: string | null;
  items: OutfitItem[];
};

export default function Outfits() {
  const router = useRouter();
  const [outfits, setOutfits] = useState<Outfit[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("selea_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/outfits/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Failed to load outfits");
      }

      const data = await res.json();
      setOutfits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const deleteOutfit = async (id: string) => {
    setDeletingId(id);
    setError("");

    try {
      const token = localStorage.getItem("selea_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/outfits/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Failed to delete outfit");
      }

      setOutfits((prev) => (prev ? prev.filter((o) => o.id !== id) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="flex-1 px-6 py-16 bg-ivory">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl mb-2">Your Outfits</h1>
        <p className="text-taupe mb-12">Saved combinations from Style Me</p>

        {loading && <p className="text-taupe">Loading…</p>}

        {error && <p className="text-sm text-red-700 mb-6">{error}</p>}

        {outfits && outfits.length === 0 && (
          <p className="text-taupe">
            No saved outfits yet. Head to Style Me to generate and save one.
          </p>
        )}

        {outfits && outfits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {outfits.map((outfit) => (
              <Card key={outfit.id} className="p-5">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {outfit.items.map((item) => (
                    <img
                      key={item.id}
                      src={item.image_url ?? "https://placehold.co/300x400"}
                      alt={item.category}
                      className="w-full aspect-[3/4] object-cover"
                    />
                  ))}
                </div>

                <p className="text-sm mb-1">{outfit.name}</p>
                <p className="text-xs uppercase tracking-wide text-taupe mb-4">
                  {[outfit.occasion, outfit.style].filter(Boolean).join(" · ")}
                </p>

                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => deleteOutfit(outfit.id)}
                  disabled={deletingId === outfit.id}
                >
                  {deletingId === outfit.id ? "Deleting…" : "Delete"}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}