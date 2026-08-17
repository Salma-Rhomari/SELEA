"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/wardrobe", label: "Wardrobe" },
  { href: "/upload", label: "Add Item" },
  { href: "/style-me", label: "Style Me" },
  { href: "/outfits", label: "Outfits" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(!!localStorage.getItem("selea_token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("selea_token");
    setIsAuthed(false);
    router.push("/");
  };

  return (
    <nav className="flex items-center justify-between px-10 py-6 border-b border-taupe/15 bg-ivory">
      <Link href="/" className="font-serif text-2xl tracking-widest text-ink">
        SELÉA
      </Link>

      {isAuthed ? (
        <div className="flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs uppercase tracking-wide transition-colors ${
                pathname === link.href
                  ? "text-burgundy border-b border-burgundy pb-1"
                  : "text-ink hover:text-taupe"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="text-xs uppercase tracking-wide text-taupe hover:text-ink transition-colors"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary" className="px-5 py-2">
              Get Started
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}