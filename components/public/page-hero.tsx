"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
};

export function PageHero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}: PageHeroProps) {
  return (
    <section className="relative w-full min-w-0 overflow-hidden bg-background px-6 pb-24 pt-36 sm:pt-40">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-full w-full"
        viewBox="0 0 1440 620"
        preserveAspectRatio="none"
      >
        <path
          className="fill-soft"
          d="M0 0h1440v342c-180 95-385 127-610 75C579 359 292 405 0 535V0Z"
        />
      </svg>

      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto w-full min-w-0 max-w-3xl text-center"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-5 break-words text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          {description}
        </p>

        {(primaryAction || secondaryAction) && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primaryAction && (
              <Button asChild size="lg" className="h-12 rounded-full px-7">
                <Link href={primaryAction.href}>
                  {primaryAction.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {secondaryAction && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-7"
              >
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
}
