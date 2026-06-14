"use client";
import { motion, MotionConfig } from "motion/react";
export default function Gestures() {
  return (
    <div className="grid place-content-center h-screen gap-1.5">
      <MotionConfig transition={{ duration: 0.125, ease: "easeInOut" }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, rotate: "2.5deg" }}
          className="example-button p-2"
        >
          Click Me
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95, rotate: "2.5deg" }}
          whileHover={{ scale: 1.05 }}
          className="example-button p-2"
          style={{ backgroundColor: "red" }}
        >
          Click Me
        </motion.button>
      </MotionConfig>
    </div>
  );
}
