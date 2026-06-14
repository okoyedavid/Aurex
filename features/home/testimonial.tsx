"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  type Variants,
} from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Monday, Oracle, Segment } from "@/components/icons";

const smoothEase = [0.22, 1, 0.36, 1] as const;

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Finance Lead, NovaTrade",
    image: "/profile1.jpg",
    logo: Segment,
    quote:
      "Aurex gave our finance team one clean place to track payments, invoices, and settlements. We now close our weekly reports much faster.",
  },
  {
    name: "Daniel Carter",
    role: "Founder, Ledgerly",
    image: "/profile2.jpg",
    logo: Monday,
    quote:
      "Before Aurex, payment tracking was scattered across spreadsheets and emails. Now every transaction is easier to monitor and reconcile.",
  },
  {
    name: "Amara Okafor",
    role: "Operations Manager, PayAxis",
    image: "/profile1.jpg",
    logo: Oracle,
    quote:
      "The biggest win for us was visibility. We can see what has been paid, what is pending, and where our cash flow stands in real time.",
  },
];

const sectionVariants: Variants = {
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

const slideVariants: Variants = {
  enter: {
    opacity: 0,
    x: 40,
    filter: "blur(8px)",
  },
  center: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    x: -40,
    filter: "blur(8px)",
    transition: {
      duration: 0.35,
      ease: smoothEase,
    },
  },
};

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextIndex = Math.min(
      testimonials.length - 1,
      Math.floor(latest * testimonials.length),
    );

    setActiveIndex(nextIndex);
  });

  const testimonial = testimonials[activeIndex];

  function goToPrevious() {
    setActiveIndex((current) =>
      current === 0 ? testimonials.length - 1 : current - 1,
    );
  }

  function goToNext() {
    setActiveIndex((current) =>
      current === testimonials.length - 1 ? 0 : current + 1,
    );
  }

  return (
    <section ref={sectionRef} className="relative bg-background lg:h-[300vh]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:sticky lg:top-0 lg:flex lg:min-h-screen lg:items-center">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          className="w-full"
        >
          <motion.div
            variants={fadeUp}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Testimonials
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Check what our clients are saying
            </h2>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
            <motion.div
              variants={fadeUp}
              className="relative mx-auto w-full max-w-md"
            >
              <div className="absolute -left-8 -top-8 h-20 w-20 rounded-tl-[4rem] bg-cyan-400" />
              <div className="absolute -bottom-10 right-2 h-28 w-28 rounded-br-[5rem] bg-cyan-400" />

              <div className="absolute right-4 top-2 z-0 grid grid-cols-8 gap-2 opacity-30">
                {Array.from({ length: 48 }).map((_, index) => (
                  <span
                    key={index}
                    className="h-1 w-1 rounded-full bg-muted-foreground"
                  />
                ))}
              </div>

              <div className="relative z-10 mx-auto aspect-[4/5] w-[78%] overflow-hidden bg-muted">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={testimonial.image}
                    src={testimonial.image}
                    alt={testimonial.name}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="h-full w-full object-cover"
                  />
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground shadow-lg transition hover:-translate-x-1 hover:bg-muted"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={goToNext}
                className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground shadow-lg transition hover:translate-x-1 hover:bg-muted"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="mt-8 flex justify-center gap-2">
                {testimonials.map((item, index) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      activeIndex === index
                        ? "w-8 bg-primary"
                        : "w-2 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonial.name}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="max-w-xl"
                >
                  <Quote className="h-10 w-10 fill-[#F57059] text-[#F57059]" />

                  <div className="mt-4 flex gap-1 text-[#F57059]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span key={index} className="text-lg leading-none">
                        ★
                      </span>
                    ))}
                  </div>

                  <p className="mt-5 text-xl font-semibold leading-8 text-foreground md:text-2xl md:leading-10">
                    {testimonial.quote}
                  </p>

                  <div className="mt-10 flex items-end justify-between gap-8">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {testimonial.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>

                    <p className="text-lg font-semibold text-muted-foreground/60">
                      <testimonial.logo />
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
