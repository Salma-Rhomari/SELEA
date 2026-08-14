"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

const STYLES = ["Minimalist", "Elegant", "Casual", "Streetwear", "Classic", "Romantic", "Sporty", "Vintage"];

const COLORS = [
  { name: "Black", hex: "#1C1B19" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Ivory", hex: "#FAF7F2" },
  { name: "Cream", hex: "#F3EAD9" },
  { name: "Beige", hex: "#E4D9C9" },
  { name: "Taupe", hex: "#A89A8B" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Brown", hex: "#6B4226" },
  { name: "Charcoal", hex: "#3A3A3A" },
  { name: "Grey", hex: "#9B9B9B" },
  { name: "Navy", hex: "#1F2A44" },
  { name: "Denim Blue", hex: "#4A6FA5" },
  { name: "Blue", hex: "#3B6FD6" },
  { name: "Turquoise", hex: "#3FB6A8" },
  { name: "Emerald", hex: "#2E6F4E" },
  { name: "Olive", hex: "#6B6E3A" },
  { name: "Khaki", hex: "#B7AD8F" },
  { name: "Mustard", hex: "#D4A72C" },
  { name: "Gold", hex: "#C9A227" },
  { name: "Orange", hex: "#D9722C" },
  { name: "Rust", hex: "#A6491F" },
  { name: "Red", hex: "#B03A2E" },
  { name: "Burgundy", hex: "#6E1E2B" },
  { name: "Pink", hex: "#E6B4BE" },
  { name: "Coral", hex: "#E2725B" },
  { name: "Purple", hex: "#6B4E71" },
  { name: "Lavender", hex: "#C6B7DE" },
  { name: "Silver", hex: "#C6C6C6" },
];

const OCCASIONS = ["University", "Work", "Dinner", "Date", "Party", "Casual", "Wedding"];

function TagGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="mb-12">
      <h2 className="text-lg mb-4">{title}</h2>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                isSelected
                  ? "bg-ink text-ivory border-ink"
                  : "border-taupe/40 text-ink hover:border-ink"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColorGroup({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="mb-12">
      <h2 className="text-lg mb-4">Favorite colors</h2>
      <div className="flex flex-wrap gap-5">
        {COLORS.map((color) => {
          const isSelected = selected.includes(color.name);
          return (
            <button
              key={color.name}
              type="button"
              onClick={() => onToggle(color.name)}
              className="flex flex-col items-center gap-2 w-16"
            >
              <span
                className={`w-10 h-10 rounded-full border transition-all ${
                  isSelected
                    ? "ring-2 ring-offset-2 ring-ink border-transparent"
                    : "border-taupe/30"
                }`}
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-[11px] text-center uppercase tracking-wide text-taupe leading-tight">
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function StyleProfile() {
  const router = useRouter();
  const [styles, setStyles] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [occasions, setOccasions] = useState<string[]>([]);

  const toggle = (
    value: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const handleContinue = () => {
    // No backend yet — this is where we'll POST { styles, colors, occasions } in Phase 4b.
    console.log({ styles, colors, occasions });
    router.push("/dashboard");
  };

  return (
    <main className="flex-1 px-6 py-20 bg-ivory">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-wide text-taupe mb-2">Step 2 of 2</p>
        <h1 className="text-4xl mb-2">Your style profile</h1>
        <p className="text-taupe mb-12">
          This helps SELÉA tailor recommendations to you. You can change this anytime.
        </p>

        <TagGroup title="Style" options={STYLES} selected={styles} onToggle={(v) => toggle(v, styles, setStyles)} />
        <ColorGroup selected={colors} onToggle={(v) => toggle(v, colors, setColors)} />
        <TagGroup title="Frequent occasions" options={OCCASIONS} selected={occasions} onToggle={(v) => toggle(v, occasions, setOccasions)} />

        <Button variant="primary" onClick={handleContinue}>
          Continue to dashboard
        </Button>
      </div>
    </main>
  );
}