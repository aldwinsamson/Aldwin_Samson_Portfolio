import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

export function ProgressBar() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = scrollYProgress;
  const opacity = useTransform(scrollYProgress, [0, 0.01, 0.02], [0, 0.5, 1]);

  if (reduce) return null;

  return (
    <motion.div
      style={{ scaleX, opacity }}
      className="fixed inset-x-0 top-0 z-[100] h-[2px] origin-left bg-gradient-to-r from-accent via-tech to-accent"
      aria-hidden="true"
    />
  );
}
