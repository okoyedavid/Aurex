"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthHandoff } from "@/components/auth-handoff-provider";

const smoothEase = [0.22, 1, 0.36, 1] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: smoothEase,
    },
  },
};

export default function FinalSignupCta() {
  const router = useRouter();
  const { stage } = useAuthHandoff();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <section className="relative overflow-hidden bg-[#0B0924] px-6 py-16 text-white md:py-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2"
      >
        <motion.div variants={fadeUp}>
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">
            Why choose us
          </p>

          <h2 className="mt-4 max-w-md text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Track your business payments the smarter way.
          </h2>

          <p className="mt-6 max-w-md text-sm leading-6 text-white/70">
            Bring invoices, settlements, cash flow, and payment records into one
            secure workspace built for growing teams.
          </p>
        </motion.div>

        <motion.form
          method="post"
          variants={fadeUp}
          className="mx-auto w-full max-w-sm space-y-4 md:ml-auto"
          onSubmit={(event) => {
            event.preventDefault();
            stage({ email, password });
            router.push("/login");
          }}
        >
          <Input
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="Email Address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 rounded-sm border-0 bg-white/20 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-primary"
          />

          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-sm border-0 bg-white/20 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-primary"
          />

          <Button
            type="submit"
            className="h-12 w-full rounded-sm bg-primary text-xs font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
          >
            Get Started
          </Button>
        </motion.form>
      </motion.div>
    </section>
  );
}
