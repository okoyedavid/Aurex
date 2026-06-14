"use client";
import { Step } from "@/features/home/process";
import { motion, useTransform, type MotionValue } from "motion/react";
function StepItem({
  step,
  progress,
}: {
  step: Step;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, [step.at - 0.08, step.at], [0, 1]);
  const y = useTransform(progress, [step.at - 0.08, step.at], [24, 0]);
  const scale = useTransform(progress, [step.at - 0.06, step.at], [0.85, 1]);

  const dotScale = useTransform(progress, [step.at - 0.04, step.at], [0.7, 1]);
  const dotColor = useTransform(
    progress,
    [step.at - 0.04, step.at],
    ["#D1D5DB", "#FF654F"],
  );

  const numberOpacity = useTransform(
    progress,
    [step.at - 0.08, step.at],
    [0.4, 0.9],
  );

  return (
    <>
      <motion.span
        style={{
          left: step.numberPosition.left,
          top: step.numberPosition.top,
          opacity: numberOpacity,
        }}
        className="pointer-events-none absolute z-0 select-none text-[150px] font-bold leading-none text-black"
      >
        {step.number}
      </motion.span>

      <motion.div
        style={{
          left: step.dot.left,
          top: step.dot.top,
          scale: dotScale,
          backgroundColor: dotColor,
          x: "-50%",
          y: "-50%",
        }}
        className="absolute z-20 h-5 w-5 rounded-full border-[5px] border-white shadow-lg"
      />

      <motion.div
        style={{
          left: step.card.left,
          top: step.card.top,
          opacity,
          y,
          scale,
        }}
        className="absolute z-20 max-w-[250px]"
      >
        <h3 className="text-sm font-bold text-black">{step.title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">{step.body}</p>
      </motion.div>
    </>
  );
}

export default StepItem;
