"use client";
import GrowthOverlay from "./growth-overlay";

import { motion, type Variants } from "motion/react";
import { ArrowRight, BadgeCheck, Landmark, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const smoothEase = [0.22, 1, 0.36, 1] as const;

const features = [
  {
    title: "Unified payments",
    description:
      "Collect, send, and monitor business payments from one clean financial workspace.",
    icon: Landmark,
  },
  {
    title: "Smart reconciliation",
    description:
      "Automatically match invoices, settlements, and transactions without manual tracking.",
    icon: BadgeCheck,
  },
  {
    title: "Secure operations",
    description:
      "Protect payment workflows with audit logs, approvals, and secure account activity tracking.",
    icon: ShieldCheck,
  },
];
const cardsContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.15,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 34,
    scale: 0.96,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: smoothEase,
    },
  },
};

export default function Growth() {
  return (
    <div className="relative min-h-screen max-w-screen overflow-hidden">
      <GrowthOverlay />

      <div className="relative z-10 mx-auto max-w-2xl py-10 text-center px-2">
        <h1 className="font-bold text-3xl md:text-4xl">
          We help your business grow faster.
        </h1>

        <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
          Automate payments, track cash flow, manage invoices, and keep every
          transaction organized from one secure platform.
        </p>
      </div>
      <section className="relative z-2 max-w-7xl mx-auto px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={cardsContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid gap-6 md:grid-cols-3"
          >
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.25 },
                  }}
                >
                  <Card>
                    <CardHeader className="space-y-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {feature.description}
                      </p>
                      <button className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700">
                        Read More
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="mt-10 flex justify-center">
            <Button size={"lg"} className="rounded-md py-4 px-8">
              More About Platform
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
