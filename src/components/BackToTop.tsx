import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { ArrowUp } from "lucide-react";
import { spring } from "@/styles/motion";

export function BackToTop() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion();
  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 1200));

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileTap={{ scale: 0.9 }}
          transition={spring.ui}
          onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
          className="fixed bottom-6 right-[4.5rem] z-[70] inline-flex size-11 items-center justify-center rounded-full border border-line bg-elev/90 text-ink shadow-[var(--shadow-sm)] transition-colors hover:border-accent hover:text-accent sm:size-12 sm:right-24"
          aria-label="Back to top"
        >
          <ArrowUp className="size-5" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
