import { useSyncExternalStore } from "react";

/** Subscribes to a CSS media query. SSR-safe (returns `fallback` without window). */
export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

/** True only for devices whose primary input can genuinely hover (mouse/trackpad). */
export const useCanHover = () => useMediaQuery("(hover: hover) and (pointer: fine)");
export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
