/**
 * Shared motion tokens — every animation in the site draws from these values
 * so the motion language stays consistent.
 */
import type { Transition } from "motion/react";

export const ease = {
  lux: [0.16, 1, 0.3, 1] as const,
  cinematic: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  out: [0.16, 1, 0.3, 1] as const,
};

export const duration = {
  fast: 0.2,
  base: 0.45,
  slow: 0.8,
  cinematic: 1.3,
};

export const spring = {
  /** Pointer-follow — soft, settles naturally. */
  pointer: { stiffness: 110, damping: 20, mass: 0.6 },
  /** UI press/hover */
  ui: { type: "spring", stiffness: 420, damping: 30 } as Transition,
  /** Layout indicators (nav underline, filters) */
  layout: { type: "spring", stiffness: 380, damping: 34 } as Transition,
  /** Gentle zoom states */
  zoom: { stiffness: 60, damping: 18, mass: 1 },
};

export const distance = {
  reveal: 28,
  small: 12,
};

export const stagger = {
  tight: 0.06,
  base: 0.09,
  loose: 0.14,
};

export const revealVariants = {
  hidden: { opacity: 0, y: distance.reveal },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.lux },
  },
};
