export interface HeroImageConfig {
  src: string;
  srcSet?: string;
  fallbackSrc?: string;
  alt: string;
  isPlaceholder: boolean;
  credit?: { name: string; url: string; source: string };
  aspectRatio: number;
  focalPoint: { desktop: string; mobile: string };
  initialScale: number;
  exploredScale: number;
  maxTilt: number;
  maxShift: number;
  depthIntensity: number;
  hoverSensitivity: number;
  dragSensitivity: number;
  lightingIntensity: number;
  exploreThreshold: number;
  idleResetMs: number;
  mobile: {
    interaction: "drag" | "static";
    disable3D: boolean;
  };
  reducedMotion: {
    behavior: "static" | "minimal";
  };
}

export const heroImage: HeroImageConfig = {
  src: "/images/portrait-cutout.webp",
  srcSet: "/images/portrait-cutout-512.webp 512w, /images/portrait-cutout.webp 1024w",
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
