import { useMediaQuery, usePrefersReducedMotion } from "./useMediaQuery";

export function useCinematic(): boolean {
  const wide = useMediaQuery("(min-width: 1024px)");
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = usePrefersReducedMotion();
  return wide && fine && !reduced;
}
