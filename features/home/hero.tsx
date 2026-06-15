"use client";
import HeroCurve from "./hero-curve";
import HeroDash from "./hero-dash";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      <HeroCurve />
      <div className="relative z-2 mx-auto grid max-w-7xl grid-cols-1 px-6 pt-16 pb-6 lg:pt-24 lg:pb-10 lg:min-h-screen lg:grid-cols-2 lg:gap-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.75,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="relative z-10 py-8"
        >
          <span className="text-sm sm:text-base text-primary">
            Product Growth Solution in Single Platform.
          </span>
          <h1 className="mt-4 max-w-xl text-4xl font-bold text-foreground tracking-tight sm:text-5xl lg:text-6xl">
            Managing business payments has never been easier
          </h1>
          <p className="mt-6 max-w-lg text-base text- sm:text-lg text-muted-foreground">
            Automate invoices, manage payments, and track your business cash
            flow from one platform.
          </p>
          <div className="w-full max-w-lg py-6">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-muted-foreground"
            >
              Register using email address
            </label>

            <div
              className="flex h-14 overflow-hidden rounded-none border border-gray-300 bg-background p-1 shadow-sm transition focus-
    within:border-black focus-within:ring-4 focus-within:ring-black/5"
            >
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Aurex@gmail.com"
                className="min-w-0 flex-1 bg-transparent text-foreground px-4 text-base outline-none placeholder:text-muted-foreground"
              />

              <button
                type="submit"
                className="shrink-0 rounded-none bg-black px-6 font-medium text-white transition-colors hover:bg-gray-800 focus-
        visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Submit
              </button>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.15,
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="relative mx-auto min-h-100 w-full lg:translate-x-12 lg:-translate-y-12"
        >
          <HeroDash />
        </motion.div>
      </div>
    </section>
  );
}
