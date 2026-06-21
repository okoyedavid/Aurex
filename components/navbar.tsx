"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
  { label: "Contact", href: "/contact" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateNavbar = () => setIsScrolled(window.scrollY > 16);

    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });
    return () => window.removeEventListener("scroll", updateNavbar);
  }, []);

  if (pathname.startsWith("/dashboard")) return null;

  return (
    <header
      className={cn(
        "fixed top-0 z-30 w-full border-b border-transparent py-4 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        (isScrolled || isOpen) &&
          "border-border bg-background/90 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/80",
      )}
    >
      <nav className="mx-auto flex w-full min-w-0 max-w-6xl items-center justify-between px-6 text-foreground">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
          aria-label="Aurex home"
        >
          Aurex
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-sm font-medium transition hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-foreground",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-1 lg:flex">
          <Button asChild size="lg" variant="ghost">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild size="lg" className="rounded-full px-5">
            <Link href="/register">Start Free</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-foreground transition hover:bg-muted lg:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-border bg-background px-6 pb-6 pt-4 lg:hidden"
        >
          <ul className="mx-auto max-w-6xl space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block rounded-md px-3 py-3 text-sm font-medium transition hover:bg-muted hover:text-primary",
                    pathname === link.href && "bg-muted text-primary",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mx-auto mt-4 grid max-w-6xl grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-11">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                Sign In
              </Link>
            </Button>
            <Button asChild className="h-11">
              <Link
                href="/register"
                className="text-white"
                onClick={() => setIsOpen(false)}
              >
                Start Free
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
