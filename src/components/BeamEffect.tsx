import { motion, useReducedMotion } from "motion/react";

/**
 * BeamEffect — animated beams of light radiating from a point.
 * Used as a decorative flourish behind important headings.
 * Purely decorative, hidden from assistive tech.
 */
export function BeamEffect({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div className={`pointer-events-none absolute overflow-hidden ${className ?? ""}`} aria-hidden="true">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: [0, 0.4, 0], scaleY: [0, 1, 0] }}
          transition={{
            duration: 3,
            delay: i * 0.6,
            repeat: Infinity,
            repeatDelay: 4,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute bottom-0 origin-bottom"
          style={{
            left: `${20 + i * 15}%`,
            width: "1px",
            height: "100%",
            background: `linear-gradient(to top, transparent, ${i % 2 === 0 ? "var(--accent)" : "var(--tech)"}, transparent)`,
            transform: `rotate(${-15 + i * 8}deg)`,
          }}
        />
      ))}
      {/* Central glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
        className="absolute bottom-0 left-1/2 h-1/2 w-px -translate-x-1/2"
        style={{ background: "linear-gradient(to top, var(--accent), transparent)", filter: "blur(8px)", width: "40px" }}
      />
    </div>
  );
}
