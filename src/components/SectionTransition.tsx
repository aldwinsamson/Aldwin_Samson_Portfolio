import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useCinematic } from "@/hooks/useCinematic";

/**
 * SectionTransition — scroll-scrubbed entrance for a content section.
 *  Desktop  → the section rises out of depth (scale + tilt + blur) as it enters and eases back as it leaves.
 *  Mobile / reduced motion → rendered in place with no scroll-linked transform (stable, fixed positions).
 * Don't wrap pinned (sticky) stages in this — a transform on a section that is being scrubbed would fight the pin.
 */
export function SectionTransition({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const cinematic = useCinematic();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const on = <T,>(a: T, b: T) => (cinematic ? a : b);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.93, 1], on([0, 1, 1, 0.45], [1, 1, 1, 1]));
  const y = useTransform(scrollYProgress, [0, 0.12, 1], on([100, 0, -36], [0, 0, 0]));
  const scale = useTransform(scrollYProgress, [0, 0.12, 0.93, 1], on([0.93, 1, 1, 0.975], [1, 1, 1, 1]));
  const rotateX = useTransform(scrollYProgress, [0, 0.12], on([7, 0], [0, 0]));

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, scale, rotateX, transformPerspective: 1200, transformOrigin: "50% 100%" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
