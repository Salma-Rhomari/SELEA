"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // No backend yet — this is where the signup API call will go in Phase 4b.
    console.log("Signup form submitted:", form);
    setTimeout(() => setLoading(false), 600); // placeholder for now
  };

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-24 bg-ivory">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl mb-2">Create your account</h1>
        <p className="text-taupe mb-10">Start building your digital wardrobe.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Name"
            id="name"
            value={form.name}
            onChange={update("name")}
            required
          />
          <Input
            label="Email"
            id="email"
            type="email"
            value={form.email}
            onChange={update("email")}
            required
          />
          <Input
            label="Password"
            id="password"
            type="password"
            value={form.password}
            onChange={update("password")}
            required
          />

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-taupe mt-8">
          Already have an account?{" "}
          <Link href="/login" className="underline text-ink">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}