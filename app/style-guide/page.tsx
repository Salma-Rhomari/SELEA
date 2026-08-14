import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";

export default function StyleGuide() {
  return (
    <main className="flex-1 bg-ivory px-10 py-16 max-w-4xl mx-auto w-full space-y-16">
      <header>
        <h1 className="text-4xl mb-2">SELÉA Style Guide</h1>
        <p className="text-taupe">Visual identity reference — not part of the real app.</p>
      </header>

      {/* Typography */}
      <section>
        <h2 className="text-2xl mb-6">Typography</h2>
        <div className="space-y-4">
          <h1 className="text-6xl">Heading 1 — Cormorant</h1>
          <h2 className="text-4xl">Heading 2 — Cormorant</h2>
          <h3 className="text-2xl">Heading 3 — Cormorant</h3>
          <p className="text-base font-sans">Body text — Inter, regular weight, for paragraphs and descriptions.</p>
          <p className="text-xs uppercase tracking-wide text-taupe font-sans">Micro label — Inter, tracked, uppercase</p>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-2xl mb-6">Buttons</h2>
        <div className="flex items-center gap-6">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost / inline link</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="text-2xl mb-6">Inputs</h2>
        <div className="max-w-sm space-y-6">
          <Input label="Email" placeholder="you@example.com" />
          <Input label="Password" type="password" placeholder="••••••••" />
          <Input label="With an error" defaultValue="wrong@" error="Please enter a valid email." />
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-2xl mb-6">Cards</h2>
        <div className="grid grid-cols-3 gap-6">
          <Card hoverable className="p-4">
            <div className="aspect-[3/4] bg-offwhite mb-3" />
            <p className="text-sm font-medium">Tailored Blazer</p>
            <p className="text-xs text-taupe uppercase tracking-wide">Beige</p>
          </Card>
          <Card className="p-6">
            <p className="text-xs uppercase tracking-wide text-taupe mb-1">Pieces</p>
            <p className="text-3xl">42</p>
          </Card>
          <Card className="p-6">
            <p className="text-xs uppercase tracking-wide text-taupe mb-1">Dominant Color</p>
            <p className="text-3xl">Black</p>
          </Card>
        </div>
      </section>

      {/* Color Palette */}
      <section>
        <h2 className="text-2xl mb-6">Palette</h2>
        <div className="flex gap-4">
          {[
            ["Ivory", "bg-ivory", "border border-taupe/20"],
            ["Offwhite", "bg-offwhite", ""],
            ["Beige", "bg-beige", ""],
            ["Taupe", "bg-taupe", ""],
            ["Ink", "bg-ink", ""],
          ].map(([name, bg, extra]) => (
            <div key={name} className="text-center">
              <div className={`w-20 h-20 ${bg} ${extra}`} />
              <p className="text-xs mt-2 uppercase tracking-wide text-taupe">{name}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}