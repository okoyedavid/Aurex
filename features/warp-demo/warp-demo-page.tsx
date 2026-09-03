"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CodeXml } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LiveDemo } from "./live-demo";
import { WarpArchitecture, WarpNarrative } from "./warp-narrative";
import { useScrollReveal } from "./use-scroll-reveal";

const links = [
  ["Problem", "#problem"],
  ["Resolution", "#resolution"],
  ["Live demo", "#demo"],
  ["Audit", "#audit"],
  ["Architecture", "#architecture"],
] as const;

export function WarpDemoPage() {
  const root = useRef<HTMLElement>(null);
  useScrollReveal(root);

  return (
    <main
      ref={root}
      className="min-h-screen bg-background text-foreground selection:bg-primary/20"
    >
      <header className="sticky top-0 z-40 border-b border-border/90 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/warp-demo"
            className="flex items-center gap-2.5 font-semibold tracking-tight"
          >
            <Image
              src="/icon.png"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-md object-cover"
              priority
            />
            <span>
              Aurex{" "}
              <span className="font-mono text-xs font-normal text-muted-foreground">
                / WARP
              </span>
            </span>
          </Link>
          <nav
            className="hidden items-center gap-5 lg:flex"
            aria-label="Case study sections"
          >
            {links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="text-xs font-medium text-muted-foreground transition hover:text-primary"
              >
                {label}
              </a>
            ))}
          </nav>
          <Button asChild size="sm" className="rounded-full px-4">
            <a href="#demo">
              Open explorer <ArrowRight className="size-3.5" />
            </a>
          </Button>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-border px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-50 [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div data-reveal>
            <p className="mb-6 font-mono text-xs uppercase tracking-[.2em] text-primary">
              AUREX ENGINEERING CASE STUDY · WARP POLICY ASSIGNMENT
            </p>
            <h1 className="max-w-5xl text-balance text-4xl font-semibold leading-[.98] tracking-[-.055em] sm:text-6xl lg:text-[5rem]">
              Policy assignment, implemented in Aurex.
            </h1>
            <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
              Aurex’s implementation of Warp’s Policy Assignment problem
              resolves employee policies from business attributes, ordered
              rules, and category constraints — with reconciliation and
              historical explainability.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-6">
                <a href="#demo">
                  Explore the live system <ArrowRight />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-border bg-card/70 px-6"
              >
                <a
                  href="https://github.com/okoyedavid/aurex-backend"
                  target="_blank"
                  rel="noreferrer"
                >
                  <CodeXml /> View source
                </a>
              </Button>
            </div>
          </div>
          <div
            data-reveal
            className="rounded-md border border-border bg-inverse p-4 text-inverse-foreground shadow-2xl shadow-primary/10 sm:p-6"
          >
            <div className="flex items-center justify-between border-b border-inverse-foreground/10 pb-4 font-mono text-[11px] uppercase tracking-wider text-inverse-foreground/60">
              <span>Resolution trace</span>
              <span className="rounded-full bg-primary/15 px-2 py-1 text-primary">
                deterministic
              </span>
            </div>
            <div className="space-y-3 py-5 font-mono text-xs sm:text-sm">
              <TraceRow
                number="01"
                label="Employee facts"
                value="department = Engineering"
              />
              <TraceRow
                number="02"
                label="Matching rules"
                value="4 candidates"
              />
              <TraceRow
                number="03"
                label="Priority order"
                value="100 → 80 → 40"
              />
              <TraceRow
                number="04"
                label="Cardinality"
                value="Vacation · Max 1"
              />
            </div>
            <div className="rounded-md bg-primary p-5 text-primary-foreground">
              <p className="font-mono text-[10px] uppercase tracking-[.18em] opacity-70">
                Selected policy
              </p>
              <p className="mt-2 text-xl font-semibold">Enhanced Vacation</p>
              <p className="mt-1 text-sm opacity-70">
                Winner by matched rule priority
              </p>
            </div>
          </div>
        </div>
      </section>

      <WarpNarrative />
      <LiveDemo />
      <WarpArchitecture />

      <section
        className="bg-inverse px-5 py-24 text-inverse-foreground sm:px-8"
        data-reveal
      >
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[.2em] text-primary">
              Reviewer workspace
            </p>
            <h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-.04em] sm:text-5xl">
              Inspect the product behind the resolver.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-inverse-foreground/65">
              The demo is public and read-only. The authenticated workspace
              exposes the broader employee, role, and policy-management flows.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="rounded-full px-6"
          >
            <Link href="/login">
              Open reviewer login <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <span>Built as an explainable systems case study for Aurex.</span>
          <span className="font-mono">
            WARP / v1 / read-only public surface
          </span>
        </div>
      </footer>
    </main>
  );
}

function TraceRow({
  number,
  label,
  value,
}: {
  number: string;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[2rem_1fr] gap-3 rounded-md border border-inverse-foreground/10 bg-inverse-foreground/5 p-3">
      <span className="text-primary">{number}</span>
      <div className="flex flex-wrap justify-between gap-2">
        <span className="text-inverse-foreground/55">{label}</span>
        <span>{value}</span>
      </div>
    </div>
  );
}
