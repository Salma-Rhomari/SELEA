import Link from "next/link";
import Button from "@/components/ui/Button";

type NavbarProps = {
  isAuthed?: boolean;
};

const NAV_LINKS = [
  { href: "/wardrobe", label: "Wardrobe" },
  { href: "/upload", label: "Add Item" },
  { href: "/outfits", label: "Outfits" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar({ isAuthed = false }: NavbarProps) {
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
              className="text-xs uppercase tracking-wide text-ink hover:text-taupe transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/logout"
            className="text-xs uppercase tracking-wide text-taupe hover:text-ink transition-colors"
          >
            Logout
          </Link>
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