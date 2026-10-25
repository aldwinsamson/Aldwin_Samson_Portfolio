import { useMediaQuery, usePrefersReducedMotion } from "./useMediaQuery";

/**
 * "Cinematic" = scroll-driven, pinned, scrubbed motion. Desktop only:
 * wide screen + a real hover-capable pointer + no reduced-motion preference.
 * Everything else (phones, tablets, touch laptops, reduced motion) gets the fixed, stable layout.
 */
export function useCinematic(): boolean {
  const wide = useMediaQuery("(min-width: 1024px)");
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = usePrefersReducedMotion();
  return wide && fine && !reduced;
}
