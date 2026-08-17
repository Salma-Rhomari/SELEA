"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";

const STEPS = [
  {
    number: "01",
    title: "Upload your clothes",
    description: "Photograph a piece from your wardrobe and add it to your digital closet.",
  },
  {
    number: "02",
    title: "AI analyzes it",
    description: "SELÉA detects category, color, pattern, and style automatically.",
  },
  {
    number: "03",
    title: "Get styled",
    description: "Choose an occasion and mood — receive outfit combinations built from pieces you already own.",
  },
  {
    number: "04",
    title: "Refine your style",
    description: "Like or dislike suggestions, and SELÉA learns your preferences over time.",
  },
];

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("selea_token");
    setIsLoggedIn(!!token);
    setChecked(true);
  }, []);

  return (
    <main className="flex-1 bg-ivory">
      {/* Hero */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-7xl md:text-8xl tracking-widest text-ink mb-6">
          SELÉA
        </h1>

        {!checked ? null : isLoggedIn ? (
          <>
            <p className="font-sans text-taupe text-lg md:text-xl tracking-wide max-w-md mb-10">
              Welcome back. Ready for your next look?
            </p>
            <Link href="/dashboard">
              <Button variant="accent">Go to Dashboard</Button>
            </Link>
          </>
        ) : (
          <>
            <p className="font-sans text-taupe text-lg md:text-xl tracking-wide max-w-md mb-10">
              Your digital wardrobe, styled by AI.
            </p>
            <div className="flex gap-4">
              <Link href="/signup">
                <Button variant="primary">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary">Sign In</Button>
              </Link>
            </div>
          </>
        )}
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-24 border-t border-taupe/15">
        <h2 className="text-3xl mb-2 text-center">How it works</h2>
        <p className="text-taupe text-center mb-16">
          From a photo of your closet to a fully styled outfit — in seconds.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {STEPS.map((step) => (
            <div key={step.number}>
              <p className="font-serif text-3xl text-taupe mb-3">{step.number}</p>
              <h3 className="text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-taupe font-sans leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Value proposition cards */}
      <section className="max-w-5xl mx-auto px-6 py-24 border-t border-taupe/15">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-8">
            <h3 className="text-xl mb-3">Wardrobe intelligence</h3>
            <p className="text-sm text-taupe font-sans leading-relaxed">
              See what you actually wear, what's gathering dust, and what's
              missing from your closet.
            </p>
          </Card>
          <Card className="p-8">
            <h3 className="text-xl mb-3">Outfits from what you own</h3>
            <p className="text-sm text-taupe font-sans leading-relaxed">
              No more staring at a full closet with nothing to wear —
              recommendations are built from your real pieces.
            </p>
          </Card>
          <Card className="p-8">
            <h3 className="text-xl mb-3">Shop with intention</h3>
            <p className="text-sm text-taupe font-sans leading-relaxed">
              Understand your gaps before you buy, instead of collecting
              near-duplicates.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-taupe/15 py-10 px-6 text-center">
        <p className="text-xs uppercase tracking-wide text-taupe">
          SELÉA — AI-powered digital wardrobe
        </p>
      </footer>
    </main>
  );
}