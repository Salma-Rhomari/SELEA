"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Signup failed");
      }

      // Auto-login right after signup so the user lands in the app immediately
      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const loginData = await loginRes.json();
      localStorage.setItem("selea_token", loginData.access_token);

      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
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

          {error && <p className="text-sm text-red-600">{error}</p>}

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