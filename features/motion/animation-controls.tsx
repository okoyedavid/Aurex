"use client";
import { motion, useAnimationControls } from "motion/react";

export default function AnimationControls() {
  const controls = useAnimationControls();
  const handleClick = () => {
    controls.start("flip");
  };
  return (
    <div className="grid place-content-center h-screen gap-1.5">
      <button onClick={handleClick} className="example-button p-2">
        Flip it!
      </button>
      <motion.div
        whileHover="initial"
        animate={controls}
        variants={{ initial: { rotate: "0deg" }, flip: { rotate: "360deg" } }}
        className="w-37.5 h-37.5 bg-black"
      ></motion.div>
    </div>
  );
}
