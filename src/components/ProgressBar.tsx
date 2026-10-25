import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * ProgressBar — a thin accent-colored bar at the top of the viewport.
 * Width = scroll progress. Height pulses slightly with scroll velocity
 * for a subtle "the site is alive" feel. Invisible at top of page.
 */
export function ProgressBar() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = scrollYProgress; // Lenis already smooths the scroll — no extra springs needed
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
