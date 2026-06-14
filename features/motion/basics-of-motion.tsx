"use client";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
const BasicsOfMotion = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div
      style={{
        display: "grid",
        placeContent: "center",
        height: "100vh",
        gap: "0.8rem",
      }}
    >
      <motion.button
        layout
        onClick={() => setIsVisible((e) => !e)}
        className="example-button"
      >
        Show/Hide
      </motion.button>
      <AnimatePresence mode="popLayout">
        {isVisible && (
          <motion.div
            initial={{
              y: 0,
              rotate: "0deg",
              scale: 0,
            }}
            exit={{ rotate: "0deg", scale: 0 }}
            transition={{
              duration: 1,
              ease: "backInOut",
              times: [0, 0.25, 0.5, 0.85, 1],
            }}
            animate={{
              y: [0, 150, -150, -150, 0],
              rotate: "180deg",
              scale: 1,
            }}
            className="w-77.5 h-77.5 bg-black"
          ></motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { BasicsOfMotion };
