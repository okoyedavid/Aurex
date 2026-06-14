"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./ui/button";

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateNavbar = () => setIsScrolled(window.scrollY > 16);

    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });

    return () => window.removeEventListener("scroll", updateNavbar);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-30 w-full border-b border-transparent py-4 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        isScrolled &&
          "border-black/5 bg-white/75 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/60",
      )}
    >
      <nav className="flex justify-between items-center max-w-6xl mx-auto w-full">
        <h1 className="text-3xl">Aurex</h1>
        <ul className="flex items-center justify-between gap-8">
          <li>Product</li>
          <li>Template</li>
          <li>Blog</li>
          <li>Pricing</li>
        </ul>
        <div>
          <Button size={"lg"} variant={"ghost"}>
            Sign in
          </Button>
          <Button size={"lg"}>Start Free</Button>
        </div>
      </nav>
    </header>
  );
}
