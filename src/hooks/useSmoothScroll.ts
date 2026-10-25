import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePrefersReducedMotion } from "./useMediaQuery";

/**
 * Lenis smooth scroll — gives that buttery, high-end agency scroll.
 * Disabled under reduced motion. Cleans up on unmount.
 */
export function useSmoothScroll(enabled = true) {
  const reduce = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled || reduce) return;

    const lenis = new Lenis({
      // lerp-based smoothing responds immediately to input (the old 1.2 s eased duration felt delayed).
      lerp: 0.11,
      wheelMultiplier: 1,
      syncTouch: false, // keep native momentum scrolling on phones
      infinite: false,
    });

    lenisRef.current = lenis;

    let raf: number;
    function frame(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled, reduce]);

  return lenisRef;
}
