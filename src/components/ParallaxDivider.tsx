import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * ParallaxDivider — a cinematic split between sections.
 * Large editorial text scrolls at a different rate than its background,
 * creating a beautiful depth illusion. Like Apple product pages.
 */
export function ParallaxDivider({
  text,
  subtext,
  className,
}: {
  text: string;
  subtext?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, -60]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [1, 1, 1] : [0.9, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.2, 1, 1, 0.2]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden py-16 sm:py-28 lg:py-44 ${className ?? ""}`}
      aria-hidden="true"
    >
      {/* Background shapes */}
      <motion.div
        style={{ y: y1 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="size-[600px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 16%, transparent), transparent 70%)" }}
        />
      </motion.div>

      {/* Text */}
      <motion.div
        style={{ y: y2, scale, opacity }}
        className="relative flex flex-col items-center text-center"
      >
        <p className="font-display text-[clamp(2.8rem,10vw,10rem)] italic leading-none tracking-tight">
          <span className="text-ink/8">{text}</span>
        </p>
        {subtext && (
          <p className="mt-6 t-eyebrow text-accent">{subtext}</p>
        )}
      </motion.div>

      {/* Hairline decorators */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="absolute left-[10%] right-[10%] top-1/2 h-px origin-left bg-gradient-to-r from-transparent via-accent/30 to-transparent"
      />
    </div>
  );
}
