"use client";

import { motion, type Variants } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const smoothEase = [0.22, 1, 0.36, 1] as const;

const ctaVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.75,
      ease: smoothEase,
    },
  },
};

function CtaBackground() {
  return (
    <svg
      className="absolute left-1/2 top-0 h-full w-[1600px] -translate-x-1/2 md:w-full"
      viewBox="0 0 1440 698"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M1440 281.43V0L718.5 81L-3 0V281.43C-3 359.089 44.2608 428.931 116.351 457.807L711.063 696.021C715.837 697.933 721.163 697.933 725.937 696.021L1320.65 457.807C1392.74 428.931 1440 359.089 1440 281.43Z"
        className="fill-soft"
      />
    </svg>
  );
}

export default function SignupCta() {
  return (
    <section className="relative min-h-[520px] overflow-hidden bg-background md:min-h-[620px]">
      <CtaBackground />

      <motion.div
        variants={ctaVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        className="relative z-10 mx-auto flex min-h-[420px] max-w-3xl flex-col items-center justify-center px-6 pt-16 text-center md:min-h-[500px]"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Business Payments Platform
        </p>

        <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Start managing your business payments with confidence.
        </h2>

        <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
          Create your free account and bring invoices, payments, settlements,
          and cash-flow tracking into one secure workspace.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-7 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
          >
            Contact Sales
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
