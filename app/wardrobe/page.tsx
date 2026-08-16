"use client";

import { useState, useEffect, useCallback } from "react";
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
  pattern: string | null;
  style: string | null;
  season: string | null;
  occasion: string | null;
  material: string | null;
  image_url: string;
};

type EditableFields = {
  category: string;
  subcategory: string;
  color: string;
  pattern: string;
  style: string;
  season: string;
  occasion: string;
  material: string;
};

const EDIT_FIELDS: { key: keyof EditableFields; label: string }[] = [
  { key: "category", label: "Category" },
  { key: "subcategory", label: "Subcategory" },
  { key: "color", label: "Color" },
  { key: "pattern", label: "Pattern" },
  { key: "style", label: "Style" },
  { key: "season", label: "Season" },
  { key: "occasion", label: "Occasion" },
  { key: "material", label: "Material" },
];

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [editFields, setEditFields] = useState<EditableFields | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(
    (searchQuery: string) => {
      const token = localStorage.getItem("selea_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/wardrobe/items`);
      if (searchQuery.trim()) {
        url.searchParams.set("q", searchQuery.trim());
      }

      fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to load wardrobe");
          return res.json();
        })
        .then((data) => setItems(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    },
    [router]
  );

  useEffect(() => {
    fetchItems("");
  }, [fetchItems]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchItems(query);
    }, 350);
    return () => clearTimeout(timeout);
  }, [query, fetchItems]);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete.id;

    setDeletingId(id);
    try {
      const token = localStorage.getItem("selea_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wardrobe/items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete item");

      setItems((prev) => prev.filter((item) => item.id !== id));
      setItemToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (item: Item) => {
    setItemToEdit(item);
    setEditFields({
      category: item.category ?? "",
      subcategory: item.subcategory ?? "",
      color: item.color ?? "",
      pattern: item.pattern ?? "",
      style: item.style ?? "",
      season: item.season ?? "",
      occasion: item.occasion ?? "",
      material: item.material ?? "",
    });
  };

  const updateEditField = (field: keyof EditableFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editFields) return;
    setEditFields({ ...editFields, [field]: e.target.value });
  };

  const confirmEdit = async () => {
    if (!itemToEdit || !editFields) return;

    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("selea_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wardrobe/items/${itemToEdit.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editFields),
        }
      );

      if (!res.ok) throw new Error("Failed to update item");

      const updated: Item = await res.json();
      setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setItemToEdit(null);
      setEditFields(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const isEmpty = items.length === 0 && !query;

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
        ) : items.length === 0 ? (
          <p className="text-taupe">No items match &quot;{query}&quot;.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item.id} hoverable className="overflow-hidden group relative">
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity items-end">
                  <button
                    onClick={() => openEdit(item)}
                    className="bg-ivory/90 border border-taupe/40 text-xs px-2 py-1 hover:border-ink"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setItemToDelete(item)}
                    className="bg-ivory/90 border border-taupe/40 text-xs px-2 py-1 hover:border-ink"
                  >
                    Remove
                  </button>
                </div>

                {item.image_url && !item.image_url.startsWith("blob:") ? (
                  <img
                    src={item.image_url}
                    alt={item.subcategory ?? item.category}
                    className="aspect-[3/4] w-full object-cover"
                  />
                ) : (
                  <div
                    className="aspect-[3/4]"
                    style={{ backgroundColor: swatchFor(item.color) }}
                  />
                )}
                <div className="p-3">
                  <p className="text-sm font-medium">{item.subcategory ?? item.category}</p>
                  <p className="text-xs text-taupe uppercase tracking-wide">{item.color ?? "—"}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {itemToDelete && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-6">
          <div className="bg-ivory border border-ink max-w-sm w-full p-8">
            <h2 className="text-xl mb-3">Remove this item?</h2>
            <p className="text-taupe mb-8">
              &quot;{itemToDelete.subcategory ?? itemToDelete.category}&quot; will be permanently
              removed from your wardrobe. This can&apos;t be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setItemToDelete(null)}
                disabled={deletingId !== null}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={confirmDelete}
                disabled={deletingId !== null}
              >
                {deletingId ? "Removing…" : "Remove"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {itemToEdit && editFields && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-6 py-12 overflow-y-auto">
          <div className="bg-ivory border border-ink max-w-md w-full p-8">
            <h2 className="text-xl mb-6">Edit item</h2>
            <div className="space-y-4 mb-8">
              {EDIT_FIELDS.map((field) => (
                <Input
                  key={field.key}
                  label={field.label}
                  value={editFields[field.key]}
                  onChange={updateEditField(field.key)}
                />
              ))}
            </div>

            {error && <p className="text-sm text-red-700 mb-4">{error}</p>}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setItemToEdit(null);
                  setEditFields(null);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" onClick={confirmEdit} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}