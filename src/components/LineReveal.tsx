import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ease } from "@/styles/motion";

/**
 * LineReveal — an animated horizontal line that draws itself on scroll.
 * Used as a refined divider between sections. Much classier than a static <hr>.
 */
export function LineReveal({
  className,
  delay = 0,
  duration = 1.2,
}: {
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -5% 0px" });
  const reduce = useReducedMotion();

  return (
    <div ref={ref} className={`relative h-px ${className ?? ""}`} aria-hidden="true">
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView || reduce ? { scaleX: 1 } : {}}
        transition={reduce ? { duration: 0 } : { duration, ease: ease.lux, delay }}
        className="absolute inset-0 origin-left bg-gradient-to-r from-transparent via-line-strong to-transparent"
      />
      {/* Accent dot at center */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView || reduce ? { scale: 1, opacity: 1 } : {}}
        transition={reduce ? { duration: 0 } : { duration: 0.4, ease: ease.lux, delay: delay + duration * 0.5 }}
        className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
      />
    </div>
  );
}
