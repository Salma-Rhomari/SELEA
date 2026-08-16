"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";

type Analysis = {
  category: string;
  subcategory: string;
  color: string;
  pattern: string;
  style: string;
  season: string;
  occasion: string;
  material: string;
};

const FIELDS: { key: keyof Analysis; label: string }[] = [
  { key: "category", label: "Category" },
  { key: "subcategory", label: "Subcategory" },
  { key: "color", label: "Color" },
  { key: "pattern", label: "Pattern" },
  { key: "style", label: "Style" },
  { key: "season", label: "Season" },
  { key: "occasion", label: "Occasion" },
  { key: "material", label: "Material" },
];

export default function Upload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setAnalysis(null);
    setImageUrl(null);
  };

  const runAnalysis = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError("");

    try {
      const token = localStorage.getItem("selea_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wardrobe/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "AI analysis failed");
      }

      const data = await res.json();
      const { image_url, ...analysisFields } = data;
      setAnalysis(analysisFields as Analysis);
      setImageUrl(image_url ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAnalyzing(false);
    }
  };

  const updateField = (field: keyof Analysis) => (e: ChangeEvent<HTMLInputElement>) => {
    if (!analysis) return;
    setAnalysis({ ...analysis, [field]: e.target.value });
  };

  const confirmSave = async () => {
    if (!analysis) return;
    setError("");
    setSaving(true);

    try {
      const token = localStorage.getItem("selea_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wardrobe/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image_url: imageUrl ?? preview ?? "https://placehold.co/400x500",
          category: analysis.category,
          subcategory: analysis.subcategory,
          color: analysis.color,
          pattern: analysis.pattern,
          style: analysis.style,
          season: analysis.season,
          occasion: analysis.occasion,
          material: analysis.material,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Failed to save item");
      }

      router.push("/wardrobe");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 px-6 py-16 bg-ivory">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl mb-2">Add to your wardrobe</h1>
        <p className="text-taupe mb-12">Upload — AI analysis — Confirm</p>

        {!file && (
          <label className="block border border-dashed border-taupe/40 py-24 text-center cursor-pointer hover:border-ink transition-colors">
            <span className="text-taupe">Click to upload a photo of your item</span>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        )}

        {file && preview && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <img src={preview} alt="preview" className="w-full aspect-[3/4] object-cover" />

            <div>
              {!analysis && !analyzing && (
                <Button variant="primary" onClick={runAnalysis}>
                  Run AI analysis
                </Button>
              )}

              {analyzing && <p className="text-taupe">Analyzing…</p>}

              {error && !analysis && <p className="text-sm text-red-700 mt-3">{error}</p>}

              {analysis && (
                <div className="space-y-5">
                  <p className="text-xs uppercase tracking-wide text-taupe mb-1">
                    Review &amp; correct — SELÉA learns from your edits
                  </p>
                  {FIELDS.map((field) => (
                    <Input
                      key={field.key}
                      label={field.label}
                      value={analysis[field.key]}
                      onChange={updateField(field.key)}
                    />
                  ))}

                  {error && <p className="text-sm text-red-700">{error}</p>}

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={confirmSave}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Add to wardrobe"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}