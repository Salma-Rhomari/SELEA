"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Invalid email or password");
      }

      const data = await res.json();
      localStorage.setItem("selea_token", data.access_token);

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
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