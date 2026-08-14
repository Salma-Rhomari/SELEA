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

// Mock AI response — will be replaced by a real call to POST /wardrobe/analyze.
const MOCK_ANALYSIS: Analysis = {
  category: "Top",
  subcategory: "Tailored blazer",
  color: "Beige",
  pattern: "Plain",
  style: "Elegant",
  season: "Spring/Autumn",
  occasion: "Formal",
  material: "Cotton",
};

export default function Upload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setAnalysis(null);
  };

  const runAnalysis = () => {
    setAnalyzing(true);
    // Placeholder delay simulating the AI vision call.
    setTimeout(() => {
      setAnalysis(MOCK_ANALYSIS);
      setAnalyzing(false);
    }, 1200);
  };

  const updateField = (field: keyof Analysis) => (e: ChangeEvent<HTMLInputElement>) => {
    if (!analysis) return;
    setAnalysis({ ...analysis, [field]: e.target.value });
  };

  const confirmSave = () => {
    setSaving(true);
    // No backend yet — this is where we'll POST the image + confirmed fields
    // to /wardrobe/items once the backend exists.
    console.log("Saving item:", analysis);
    setTimeout(() => {
      setSaving(false);
      router.push("/wardrobe");
    }, 600);
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