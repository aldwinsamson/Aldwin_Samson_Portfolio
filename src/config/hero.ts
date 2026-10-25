/**
 * HERO IMAGE & INTERACTION CONFIGURATION
 * ======================================
 * This is the ONLY file you need to edit to replace the hero image or tune its motion.
 *
 * Replacing the placeholder:
 *   1. Put your photo in `public/images/` (e.g. public/images/john-portrait.jpg), then set
 *      `src: "/images/john-portrait.jpg"`.
 *      — or — import it for bundling:  import portrait from "@/assets/portrait.jpg"; src: portrait
 *      — or — use any HTTPS URL you have the rights to use.
 *   2. Update `alt` so it describes the real image.
 *   3. Set `isPlaceholder: false` to remove the small "placeholder image" caption.
 *   4. Tune `focalPoint` (CSS object-position) until the face/subject sits well in the arch.
 *
 * The animation is image-agnostic — it never depends on a face, subject or specific URL.
 */

export interface HeroImageConfig {
  /** Primary image source (local path, imported asset, or HTTPS URL). */
  src: string;
  /** Optional responsive sources — `srcSet` string passed directly to <img>. */
  srcSet?: string;
  /** Used if `src` fails to load. If that also fails, an elegant CSS plate is rendered. */
  fallbackSrc?: string;
  alt: string;
  /** True while the image is a stand-in; shows a discreet caption so no one assumes it's John. */
  isPlaceholder: boolean;
  credit?: { name: string; url: string; source: string };
  /** Native aspect ratio of the frame (width / height). Portrait images look best at 0.72–0.8. */
  aspectRatio: number;
  /** CSS object-position for desktop and mobile crops, e.g. "50% 30%". */
  focalPoint: { desktop: string; mobile: string };
  /** Initial "closer" art-directed scale; relaxes to 1 after meaningful interaction. */
  initialScale: number;
  /** Scale when fully explored (zoomed out to reveal depth). */
  exploredScale: number;
  /** Maximum tilt in degrees for the image plane. Keep ≤ 12 for readability. */
  maxTilt: number;
  /** Max parallax translation in px for the deepest layer. */
  maxShift: number;
  /** 0–1. Multiplies depth separation between background, subject and foreground layers. */
  depthIntensity: number;
  /** 0–2. Pointer sensitivity multiplier (hover). */
  hoverSensitivity: number;
  /** 0–2. Drag/touch sensitivity multiplier. */
  dragSensitivity: number;
  /** 0–1. Strength of the moving specular highlight + bottom overlay. */
  lightingIntensity: number;
  /** Pointer travel (in normalized units) required before the "explored" zoom-out state activates. */
  exploreThreshold: number;
  /** Milliseconds of inactivity before the scene eases back to rest. */
  idleResetMs: number;
  mobile: {
    /** "drag" = horizontal drag to explore (vertical scroll stays native); "static" = no gesture. */
    interaction: "drag" | "static";
    /** Disable WebGL layer on coarse pointers / small screens to save battery. */
    disable3D: boolean;
  };
  reducedMotion: {
    /** "static" = no tilt/parallax/drift, image shown with a refined still composition. */
    behavior: "static" | "minimal";
  };
}

export const heroImage: HeroImageConfig = {
  // Background-free cut-out of the ID photo. Used on the About page (the homepage hero rebuilds
  // the same picture out of particles — see src/features/hero/ParticlePortrait.tsx).
  src: "/images/portrait-cutout.webp",
  srcSet: "/images/portrait-cutout-512.webp 512w, /images/portrait-cutout.webp 1024w",
  // No fallbackSrc on purpose: if the photo ever fails to load, the on-brand plate shows instead.
  alt: "Portrait of John Aldwin R. Samson in a black suit and tie",
  isPlaceholder: false,
  aspectRatio: 0.82,
  focalPoint: { desktop: "50% 22%", mobile: "50% 18%" },
  initialScale: 1.02,
  exploredScale: 1.0,
  maxTilt: 9,
  maxShift: 26,
  depthIntensity: 1,
  hoverSensitivity: 1,
  dragSensitivity: 1,
  lightingIntensity: 0.5,
  exploreThreshold: 2.4,
  idleResetMs: 2600,
  mobile: { interaction: "drag", disable3D: true },
  reducedMotion: { behavior: "static" },
};
