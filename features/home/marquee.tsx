"use client";

import { motion } from "motion/react";
import {
  Monday,
  Morpheus,
  Oracle,
  Protonet,
  Samsung,
  Segment,
  Zeppelin,
} from "@/components/icons";

const sponsors = [
  { name: "Oracle", src: Oracle },
  { name: "Samsung", src: Zeppelin },
  { name: "Monday", src: Samsung },
  { name: "Segment", src: Morpheus },
  { name: "Protonet", src: Monday },
  { name: "OpenZeppelin", src: Segment },
  { name: "OpenZeppelin", src: Protonet },
];

export default function Marquee() {
  const repeatedSponsors = [...sponsors, ...sponsors];

  return (
    <section className="max-w-7xl mx-auto">
      <div className="pb-10">
        <h1 className="text-center text-lg md:text-xl font-semibold">
          Over 32k+ software businesses growing with Aurex
        </h1>
      </div>
      <div className="relative overflow-hidden">
        <motion.div
          className="flex w-max items-center gap-12"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 22,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {repeatedSponsors.map((sponsor, index) => (
            <div
              key={`${sponsor.name}-${index}`}
              className="flex h-12 w-40 shrink-0 items-center justify-center"
            >
              <sponsor.src />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
