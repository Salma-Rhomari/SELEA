"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // No backend yet — this is where the login API call will go in Phase 4b.
    console.log("Login form submitted:", form);
    setTimeout(() => setLoading(false), 600); // placeholder for now
  };

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-24 bg-ivory">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl mb-2">Welcome back</h1>
        <p className="text-taupe mb-10">Sign in to your digital wardrobe.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {error && <p className="text-sm text-red-700">{error}</p>}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-sm text-taupe mt-8">
          No account?{" "}
          <Link href="/signup" className="underline text-ink">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}