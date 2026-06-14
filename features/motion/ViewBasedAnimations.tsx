"use client";
import { motion, useInView } from "motion/react";
import { useEffect, useRef } from "react";

const ViewBasedAnimations = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <>
      <div style={{ height: "150vh" }}></div>
      <motion.div
        className="h-screen bg-black"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      ></motion.div>

      <div
        ref={ref}
        className="h-screen bg-red-500 "
        style={{ transition: "1s background" }}
      ></div>
    </>
  );
};

export default ViewBasedAnimations;
