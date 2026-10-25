import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { useCanHover } from "@/hooks/useMediaQuery";
import { cn } from "@/utils/cn";

/**
 * SpotlightCard — a container where a soft spotlight follows the cursor.
 * Used to wrap grids or card collections for that premium collective glow.
 */
export function SpotlightContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const canHover = useCanHover();
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const opacity = useMotionValue(0);
  const smoothX = useSpring(mx, { stiffness: 250, damping: 35 });
  const smoothY = useSpring(my, { stiffness: 250, damping: 35 });
  const smoothOpacity = useSpring(opacity, { stiffness: 200, damping: 25 });

  const background = useTransform(
    () =>
      `radial-gradient(650px circle at ${smoothX.get()}px ${smoothY.get()}px, color-mix(in oklab, var(--accent) 6%, transparent), transparent 50%)`,
  );

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !canHover || reduce) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
    opacity.set(1);
  };

  const onLeave = () => opacity.set(0);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("relative", className)}
    >
      {canHover && !reduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[24px]"
          style={{ background, opacity: smoothOpacity }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
