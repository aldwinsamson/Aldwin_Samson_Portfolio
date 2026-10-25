import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { BrandMark } from "./BrandMark";

const SESSION_KEY = "jas-preloaded";

/**
 * Cinematic Preloader v2 — full-screen reveal with:
 * - Gold monogram reveal
 * - Word-by-word name reveal
 * - Horizontal scan line
 * - Split-curtain exit (top + bottom panels slide apart revealing the site)
 * Plays once per session, skipped on repeat visits & reduced motion.
 */
export function Preloader({ onComplete }: { onComplete: () => void }) {
  const reduce = usePrefersReducedMotion();
  const [phase, setPhase] = useState<"logo" | "text" | "exit" | "done">("logo");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        setPhase("done");
        onComplete();
        return;
      }
    } catch { /* private mode */ }
    if (reduce) { setPhase("done"); onComplete(); return; }

    const t1 = setTimeout(() => setPhase("text"), 350);
    const t2 = setTimeout(() => setPhase("exit"), 1050);
    const t3 = setTimeout(() => {
      setPhase("done");
      onComplete();
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
    }, 1650);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete, reduce]);

  if (phase === "done") return null;

  const easing = [0.16, 1, 0.3, 1] as const;
  const exitActive = phase === "exit";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] overflow-hidden" aria-hidden="true">
        {/* Top panel */}
        <motion.div
          className="absolute inset-x-0 top-0 flex h-1/2 flex-col items-center justify-end pb-10 bg-[#09090a]"
          animate={exitActive ? { y: "-100%" } : { y: 0 }}
          transition={exitActive ? { duration: 0.6, ease: easing } : {}}
        >
          {/* Personal monogram */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: easing }}
          >
            <span aria-hidden="true" className="absolute inset-0 -z-10 scale-150 rounded-full bg-[#c9ae7c]/15 blur-2xl" />
            <BrandMark eager variant="dark" className="size-20 sm:size-24" />
          </motion.div>
        </motion.div>

        {/* Bottom panel */}
        <motion.div
          className="absolute inset-x-0 bottom-0 flex h-1/2 flex-col items-center justify-start pt-10 bg-[#09090a]"
          animate={exitActive ? { y: "100%" } : { y: 0 }}
          transition={exitActive ? { duration: 0.6, ease: easing } : {}}
        >
          {/* Animated scan line at seam */}
          <div className="absolute -top-px left-0 right-0 h-px overflow-hidden">
            <motion.div
              className="h-px w-full bg-gradient-to-r from-transparent via-[#c9ae7c] to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: easing, delay: 0.1 }}
            />
          </div>

          {/* Name */}
          <div className="flex flex-col items-center gap-2 overflow-hidden">
            <motion.p
              className="font-display text-2xl italic text-[#ece7dc] sm:text-[2rem]"
              initial={{ y: 40, opacity: 0 }}
              animate={phase !== "logo" ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.7, ease: easing }}
            >
              John Aldwin Samson
            </motion.p>
            <motion.p
              className="text-[0.6rem] tracking-[0.36em] uppercase text-[#9a9487] sm:text-[0.65rem]"
              initial={{ y: 20, opacity: 0 }}
              animate={phase !== "logo" ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.7, ease: easing, delay: 0.1 }}
            >
              Cloud · DevOps · Embedded · Hardware
            </motion.p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
