import { motion, useReducedMotion } from "motion/react";

/**
 * TechBadge — a technology pill with a fill animation on hover.
 * The accent color bleeds in from the left creating a liquid fill effect.
 */
export function TechBadge({
  label,
  note,
  index = 0,
}: {
  label: string;
  note?: string;
  index?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.4) }}
      className="group relative overflow-hidden rounded-full border border-line"
    >
      {/* Liquid fill */}
      {!reduce && (
        <motion.div
          className="absolute inset-0 origin-left rounded-full bg-accent/10"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
      <div className="relative flex items-center gap-2 px-3 py-1.5">
        <span className="text-[0.75rem] text-ink-soft transition-colors duration-300 group-hover:text-accent">
          {label}
        </span>
        {note && (
          <span className="hidden text-[0.62rem] text-muted sm:inline">· {note}</span>
        )}
      </div>
    </motion.div>
  );
}
