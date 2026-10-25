import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ease } from "@/styles/motion";
import { cn } from "@/utils/cn";

/**
 * ImageReveal — a curtain slides away to reveal the image.
 * The classic high-end agency reveal effect.
 * Direction can be left→right, right→left, or bottom→top.
 */
export function ImageReveal({
  children,
  className,
  direction = "left",
  delay = 0,
  duration = 1.0,
  curtainColor,
}: {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right" | "bottom";
  delay?: number;
  duration?: number;
  curtainColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();

  const curtainInitial = direction === "left"
    ? { x: "0%" }
    : direction === "right"
    ? { x: "0%" }
    : { y: "0%" };

  const curtainAnimate = direction === "left"
    ? { x: "101%" }
    : direction === "right"
    ? { x: "-101%" }
    : { y: "-101%" };

  const imageInitial = { scale: 1.12, opacity: 0 };
  const imageAnimate = { scale: 1, opacity: 1 };

  if (reduce) {
    return <div ref={ref} className={cn("overflow-hidden", className)}>{children}</div>;
  }

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {/* Content — scale in after curtain passes */}
      <motion.div
        initial={imageInitial}
        animate={inView ? imageAnimate : imageInitial}
        transition={{ duration: duration * 0.8, ease: ease.lux, delay: delay + duration * 0.4 }}
      >
        {children}
      </motion.div>

      {/* Curtain */}
      <motion.div
        aria-hidden="true"
        initial={curtainInitial}
        animate={inView ? curtainAnimate : curtainInitial}
        transition={{ duration, ease: ease.lux, delay }}
        className="absolute inset-0"
        style={{ background: curtainColor ?? "var(--bg)" }}
      />
    </div>
  );
}
