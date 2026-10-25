import { useMemo } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "./useMediaQuery";

/**
 * Adaptive quality tiers for the hero.
 *  high     → full WebGL scene, environment reflections, particles, DPR up to 2
 *  medium   → simplified scene, fewer particles, DPR up to 1.5
 *  low      → no WebGL; image parallax only
 *  static   → no WebGL, no continuous motion (reduced motion / no JS features)
 * (The homepage hero now uses its own simple rules — see features/hero/Hero.tsx.)
 */
export type QualityTier = "high" | "medium" | "low" | "static";

export interface CapabilitySignals {
  webgl: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  coarsePointer: boolean;
  smallScreen: boolean;
  cores: number;
  memoryGB: number | null;
  disable3DOnMobile: boolean;
  feature3DEnabled: boolean;
}

/** Pure decision function — unit tested in tests/quality.test.ts */
export function decideQualityTier(s: CapabilitySignals): QualityTier {
  if (s.reducedMotion) return "static";
  if (!s.feature3DEnabled || !s.webgl || s.saveData) return "low";
  if ((s.coarsePointer || s.smallScreen) && s.disable3DOnMobile) return "low";
  if (s.cores > 0 && s.cores <= 2) return "low";
  if (s.memoryGB !== null && s.memoryGB <= 2) return "low";
  if (s.coarsePointer || s.smallScreen || (s.cores > 0 && s.cores <= 4) || (s.memoryGB !== null && s.memoryGB <= 4)) {
    return "medium";
  }
  return "high";
}

let webglCache: boolean | null = null;
export function detectWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    webglCache = !!gl;
    // Release the probe context immediately.
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglCache = false;
  }
  return webglCache;
}

export function useDeviceCapability(opts: { disable3DOnMobile: boolean; feature3DEnabled: boolean }) {
  const reducedMotion = usePrefersReducedMotion();
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const smallScreen = useMediaQuery("(max-width: 767px)");

  return useMemo(() => {
    const nav = (typeof navigator !== "undefined" ? navigator : {}) as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    const signals: CapabilitySignals = {
      webgl: typeof document !== "undefined" ? detectWebGL() : false,
      reducedMotion,
      saveData: !!nav.connection?.saveData,
      coarsePointer,
      smallScreen,
      cores: nav.hardwareConcurrency ?? 0,
      memoryGB: typeof nav.deviceMemory === "number" ? nav.deviceMemory : null,
      disable3DOnMobile: opts.disable3DOnMobile,
      feature3DEnabled: opts.feature3DEnabled,
    };
    return { tier: decideQualityTier(signals), signals };
  }, [reducedMotion, coarsePointer, smallScreen, opts.disable3DOnMobile, opts.feature3DEnabled]);
}
