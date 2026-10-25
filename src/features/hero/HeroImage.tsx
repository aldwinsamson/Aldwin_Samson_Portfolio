import { useState } from "react";
import { motion, useMotionTemplate, useTransform, type MotionValue } from "motion/react";
import type { HeroImageConfig } from "@/config/hero";
import { profile } from "@/content/profile";
import { cn } from "@/utils/cn";

/**
 * The replaceable hero image. Image-agnostic: it only needs a src.
 * Fallback chain: cfg.src → cfg.fallbackSrc → designed CSS plate (never a broken image).
 */
export function HeroImage({
  cfg,
  isMobile,
  scale,
  light,
  className,
}: {
  cfg: HeroImageConfig;
  isMobile: boolean;
  /** Optional motion value controlling the inner image zoom (closer → explored). */
  scale?: MotionValue<number>;
  /** Optional normalized pointer for the moving specular highlight. */
  light?: { x: MotionValue<number>; y: MotionValue<number> };
  className?: string;
}) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [loaded, setLoaded] = useState(false);
  const src = stage === 0 ? cfg.src : stage === 1 ? cfg.fallbackSrc : undefined;

  const handleError = () => {
    setLoaded(false);
    setStage((s) => (s === 0 && cfg.fallbackSrc ? 1 : 2));
  };

  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-[radial-gradient(90%_70%_at_50%_18%,color-mix(in_srgb,var(--accent)_24%,var(--bg-elev)),var(--bg-sunken))]", className)}>
      {src ? (
        <motion.img
          key={src}
          src={src}
          srcSet={stage === 0 ? cfg.srcSet : undefined}
          sizes="(max-width: 768px) 80vw, 40vw"
          alt={cfg.alt}
          fetchPriority="high"
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={handleError}
          style={{
            objectPosition: isMobile ? cfg.focalPoint.mobile : cfg.focalPoint.desktop,
            scale: scale ?? cfg.initialScale,
          }}
          className={cn(
            "h-full w-full select-none object-cover transition-opacity duration-1000",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      ) : (
        <FallbackPlate />
      )}

      {/* Tonal grade so any photo sits inside the palette */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{ background: "linear-gradient(160deg, rgba(214,186,134,0.35), transparent 45%, rgba(103,212,230,0.12))", opacity: cfg.lightingIntensity }}
      />
      {light && <Specular x={light.x} y={light.y} intensity={cfg.lightingIntensity} />}
      {!loaded && src && <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-gradient-to-br from-sunken to-elev" />}
    </div>
  );
}

function Specular({ x, y, intensity }: { x: MotionValue<number>; y: MotionValue<number>; intensity: number }) {
  const px = useTransform(x, (v) => `${50 + v * 38}%`);
  const py = useTransform(y, (v) => `${30 + v * 30}%`);
  const bg = useMotionTemplate`radial-gradient(60% 45% at ${px} ${py}, rgba(255,246,228,${0.28 * intensity}), transparent 70%)`;
  return <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: bg }} />;
}

/** Shown only if every image source fails. Elegant, on-brand, never "broken". */
export function FallbackPlate() {
  return (
    <div
      role="img"
      aria-label="Decorative monogram"
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: "radial-gradient(80% 60% at 50% 30%, var(--bg-elev), var(--bg-sunken))" }}
    >
      <span className="font-display text-[9rem] italic leading-none text-accent/70">{profile.initials.slice(0, 1)}</span>
      <span className="t-meta absolute bottom-6 text-muted">{profile.name}</span>
    </div>
  );
}
