"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 50,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[1px] z-[100] origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, rgba(201,169,110,0.1) 0%, #C9A96E 50%, rgba(201,169,110,0.1) 100%)",
      }}
    />
  );
}
