"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import StepItem from "@/components/step-item";

const processPath =
  "M 0 300 C 95 365 175 390 265 325 C 360 255 365 190 510 205 C 640 220 650 255 725 190 C 805 115 815 48 925 58 C 1025 68 1060 105 1200 80";

export type Step = {
  number: string;
  title: string;
  body: string;
  at: number;
  dot: {
    left: string;
    top: string;
  };
  numberPosition: {
    left: string;
    top: string;
  };
  card: {
    left: string;
    top: string;
  };
};

const steps: Step[] = [
  {
    number: "1",
    title: "Project Discovery Call",
    body: "We identify payment bottlenecks, business needs, and the current tools your team depends on.",
    at: 0.22,
    dot: { left: "13%", top: "66%" },
    numberPosition: { left: "22%", top: "55%" },
    card: { left: "10%", top: "74%" },
  },
  {
    number: "2",
    title: "Process Automation",
    body: "We help automate invoices, settlements, reconciliation, and cash-flow tracking in one platform.",
    at: 0.52,
    dot: { left: "51%", top: "40%" },
    numberPosition: { left: "59%", top: "35%" },
    card: { left: "50%", top: "49%" },
  },
  {
    number: "3",
    title: "Scale With Confidence",
    body: "Your business gets better visibility, fewer payment errors, and a cleaner operating workflow.",
    at: 0.8,
    dot: { left: "80%", top: "16%" },
    numberPosition: { left: "87%", top: "4%" },
    card: { left: "79%", top: "25%" },
  },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const rawPathLength = useTransform(scrollYProgress, [0.08, 0.88], [0, 1]);

  const pathLength = useSpring(rawPathLength, {
    stiffness: 80,
    damping: 24,
    mass: 0.35,
  });

  return (
    <section ref={sectionRef} className="relative pt-20  lg:h-[220vh]">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 lg:sticky lg:top-0 lg:flex lg:min-h-screen lg:items-center lg:py-0">
        <div className="relative hidden h-[620px] w-full lg:block">
          <div className="absolute left-0 top-20 z-30 max-w-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Streamline operation across the world
            </p>

            <h2 className="mt-3 max-w-xs text-4xl font-bold tracking-tight text-black">
              We have best team and best process
            </h2>

            <p className="mt-4 max-w-xs text-sm leading-6 text-gray-600">
              Get real-time payment intelligence, automate business workflows,
              and manage financial operations from one clean system.
            </p>

            <button className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
              Get Started
            </button>
          </div>

          <div className="absolute right-[-210px] top-0 z-0 h-[430px] w-[430px] rounded-full bg-indigo-50" />

          <svg
            className="absolute left-0 top-24 z-10 h-[449px] w-full overflow-visible"
            viewBox="0 0 1070 449"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter
                id="process-wave-shadow"
                x="0"
                y="0"
                width="1070"
                height="448.255"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="24" />
                <feGaussianBlur stdDeviation="12" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.215686 0 0 0 0 0.203922 0 0 0 0 0.662745 0 0 0 0.3 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow"
                  result="shape"
                />
              </filter>
            </defs>

            {/* faint full path */}
            <path
              d={processPath}
              stroke="#E5E7EB"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* animated scroll path */}
            <motion.path
              d={processPath}
              stroke="#F57059"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="url(#process-wave-shadow)"
              style={{ pathLength }}
            />
          </svg>

          {steps.map((step) => (
            <StepItem
              key={step.number}
              step={step}
              progress={scrollYProgress}
            />
          ))}
        </div>

        <div className="lg:hidden">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Streamline operation across the world
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-black">
            We have best team and best process
          </h2>

          <p className="mt-4 text-sm leading-6 text-gray-600">
            Get real-time payment intelligence, automate business workflows, and
            manage financial operations from one clean system.
          </p>

          <div className="mt-10 space-y-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative border-l border-gray-200 pl-6"
              >
                <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {step.number}
                </div>

                <h3 className="font-bold text-black">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
