import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { useCanHover } from "@/hooks/useMediaQuery";

/**
 * MagneticWrap — children are magnetically pulled toward the cursor
 * when hovering. Premium UX detail seen on luxury agency sites.
 * No-ops on touch devices and reduced motion.
 */
export function MagneticWrap({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const canHover = useCanHover();
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18 });
  const sy = useSpring(y, { stiffness: 250, damping: 18 });

  const active = canHover && !reduce;

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !active) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (!active) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      data-cursor="magnetic"
      className={className}
    >
      {children}
    </motion.div>
  );
}
