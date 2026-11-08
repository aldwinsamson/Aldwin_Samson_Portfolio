import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePrefersReducedMotion } from "./useMediaQuery";

export function useSmoothScroll(enabled = true) {
  const reduce = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled || reduce) return;

    const lenis = new Lenis({
      lerp: 0.12,
      wheelMultiplier: 1,
      syncTouch: false, 
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
