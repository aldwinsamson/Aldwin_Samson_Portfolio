import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { useCanHover } from "@/hooks/useMediaQuery";
import { cn } from "@/utils/cn";

/**
 * GlowCard — a card with a luminous gradient border that follows
 * the pointer. The glow appears only on hover and fades out smoothly.
 * Completely static under reduced motion or touch-only devices.
 */
export function GlowCard({
  children,
  className,
  glowColor = "var(--accent)",
  glowSize = 300,
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const canHover = useCanHover();
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const opacity = useMotionValue(0);
  const smoothX = useSpring(mx, { stiffness: 300, damping: 30 });
  const smoothY = useSpring(my, { stiffness: 300, damping: 30 });
  const smoothOpacity = useSpring(opacity, { stiffness: 200, damping: 25 });

  const background = useTransform(
    () =>
      `radial-gradient(${glowSize}px circle at ${smoothX.get() * 100}% ${smoothY.get() * 100}%, ${glowColor}, transparent 70%)`,
  );

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !canHover || reduce) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
    opacity.set(1);
  };

  const onLeave = () => opacity.set(0);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("group relative overflow-hidden rounded-[24px]", className)}
    >
      {/* Glow layer behind the border */}
      {canHover && !reduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-[24px]"
          style={{ background, opacity: smoothOpacity }}
        />
      )}
      {/* Inner card */}
      <div className="relative overflow-hidden rounded-[23px] border border-line bg-bg transition-colors duration-500 group-hover:border-transparent">
        {children}
      </div>
    </div>
  );
}
