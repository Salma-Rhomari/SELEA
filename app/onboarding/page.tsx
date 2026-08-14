import Link from "next/link";
import Button from "@/components/ui/Button";

const STEPS = [
  { title: "Digitize your wardrobe", description: "Upload photos of pieces you already own." },
  { title: "Tell us your style", description: "A few quick preferences — style, colors, sizes." },
  { title: "Get styled", description: "Receive outfit recommendations built from your closet." },
];

export default function Onboarding() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 bg-ivory text-center">
      <p className="text-xs uppercase tracking-wide text-taupe mb-4">Welcome to SELÉA</p>
      <h1 className="text-4xl mb-4 max-w-lg">
        Let's turn your closet into a digital wardrobe.
      </h1>
      <p className="text-taupe mb-16 max-w-md">
        Takes about two minutes. Here's what happens next:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-3xl mb-16">
        {STEPS.map((step, i) => (
          <div key={step.title}>
            <p className="font-serif text-2xl text-taupe mb-2">{i + 1}</p>
            <h3 className="text-lg mb-1">{step.title}</h3>
            <p className="text-sm text-taupe font-sans">{step.description}</p>
          </div>
        ))}
      </div>

      <Link href="/style-profile">
        <Button variant="primary">Get Started</Button>
      </Link>
    </main>
  );
}