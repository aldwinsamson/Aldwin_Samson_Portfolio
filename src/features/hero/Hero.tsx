import { lazy, Suspense, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowRight, User, X } from "lucide-react";
import { profile, socials } from "@/content/profile";
import { siteConfig } from "@/config/site";
import { ButtonLink, Container, ExternalLink } from "@/components/ui";
import { StatusTicker } from "@/components/StatusTicker";
import { BrandMark } from "@/components/BrandMark";
import { GitHubIcon, LinkedInIcon } from "@/components/Icons";
import { useCinematic } from "@/hooks/useCinematic";
import { detectWebGL } from "@/hooks/useDeviceCapability";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useTheme } from "@/hooks/useTheme";
import { ease } from "@/styles/motion";
import { cn } from "@/utils/cn";
import { HeroWord } from "./HeroWord";

// three.js lives in its own chunk and only loads when the hero actually needs it.
const ParticlePortrait = lazy(() => import("./ParticlePortrait").then((m) => ({ default: m.ParticlePortrait })));

const PORTRAIT_FULL = "/images/portrait-cutout.webp";
const PORTRAIT_SAMPLE = "/images/portrait-cutout-512.webp";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, ease: ease.lux, delay },
});

/** Slowly rotating role badge with the monogram in the middle. Transform-only animation → free. */
function RoleBadge({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("relative select-none", className)}>
      <svg viewBox="0 0 120 120" className="badge-spin absolute inset-0 size-full text-ink-soft">
        <defs>
          <path id="badge-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <text fill="currentColor" fontSize="9.2" letterSpacing="3.4" fontFamily="JetBrains Mono, monospace">
          <textPath href="#badge-circle">CLOUD • DEVOPS • EMBEDDED • HARDWARE •</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        <BrandMark className="size-[46%]" />
      </span>
    </div>
  );
}

/**
 * Cinematic hero.
 *  Desktop  → tall section with a pinned stage: scrolling scrubs the scene (the portrait disperses into
 *             particles, the lettering rises, the side copy slides away).
 *  Phones / tablets / reduced motion → a fixed "poster": the portrait, outline name and chrome name are
 *             placed inside one aspect-locked frame so their positions can never shift or collapse.
 *             The particle portrait, chrome lettering and scroll-dispersal are all still there.
 */
export function Hero() {
  const cinematic = useCinematic();
  const reduced = usePrefersReducedMotion();
  const coarse = useMediaQuery("(pointer: coarse)");
  const small = useMediaQuery("(max-width: 767px)");
  const { theme } = useTheme();
  const light = theme === "light";
  const [particlesFailed, setParticlesFailed] = useState(false);
  // The real photo only appears once the particle intro has finished.
  const [photoReady, setPhotoReady] = useState(false);
  // Desktop: the description (headline + lead) is hidden until the visitor opens it with the toggle.
  const [descOpen, setDescOpen] = useState(false);
  const useParticles = siteConfig.features.hero3D && !reduced && !particlesFailed && detectWebGL();

  const sectionRef = useRef<HTMLElement>(null);
  // Desktop: pinned stage, progress across the whole tall section. Phones: progress while the poster scrolls away.
  const desk = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const mob = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const still = useMotionValue(0);
  const p = cinematic ? desk.scrollYProgress : reduced ? still : mob.scrollYProgress;

  const disperse = useTransform(p, cinematic ? [0.1, 0.78] : [0.04, 0.42], [0, 1]);
  const photoFade = useTransform(p, cinematic ? [0.12, 0.6] : [0.05, 0.38], [1, 0]);
  const nameY = useTransform(p, [0, 1], ["0svh", "-24svh"]);
  const nameScale = useTransform(p, [0, 1], [1, 1.16]);
  const nameOpacity = useTransform(p, [0, 0.5, 0.8], [1, 1, 0]);
  const outlineY = useTransform(p, [0, 1], ["0svh", "-14svh"]);
  const outlineX = useTransform(p, [0, 1], ["0%", "-9%"]);
  const portraitScale = useTransform(p, [0, 1], [1, 1.14]);
  const portraitY = useTransform(p, [0, 1], ["0svh", "-5svh"]);
  const sideOpacity = useTransform(p, [0, 0.34], [1, 0]);
  const stageOpacity = useTransform(p, [0.62, 0.9], [1, 0]);
  const hintOpacity = useTransform(p, [0, 0.08], [1, 0]);
  // Phones: the poster eases out as it scrolls away (no pinning, no hijacking).
  const posterOpacity = useTransform(mob.scrollYProgress, [0.25, 0.5], [1, 0.0]);

  const social = socials.filter((s) => s.id !== "email");

  /** The still portrait: the base layer (shown after the particle intro) and the fallback when WebGL / motion is unavailable. */
  const still_ = (
    <img
      src={PORTRAIT_FULL}
      alt={`Portrait of ${profile.displayName}`}
      width={1024}
      height={1024}
      fetchPriority="high"
      decoding="async"
      className="absolute inset-0 h-full w-full object-contain [mask-image:linear-gradient(to_bottom,#000_74%,transparent_100%)]"
    />
  );

  const portrait = (
    <>
      {/* Both themes: the real photo is the base layer. It stays hidden until the particle intro has
          finished, then fades in while the particles melt away (and fades out again as you scroll). */}
      {useParticles && (
        <motion.div style={{ opacity: photoFade }} className="absolute inset-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: photoReady ? 1 : 0 }}
            transition={{ duration: 1.4, ease: ease.lux }}
            className="absolute inset-0"
          >
            {still_}
          </motion.div>
        </motion.div>
      )}
      {useParticles ? (
        <Suspense fallback={null}>
          <ParticlePortrait
            src={PORTRAIT_SAMPLE}
            disperse={disperse}
            count={cinematic ? (light ? 16000 : 24000) : small ? 9000 : 14000}
            interactive={cinematic}
            dprCap={coarse ? 1.5 : 1.6}
            onAssembled={() => setPhotoReady(true)}
            onFail={() => setParticlesFailed(true)}
            className="absolute inset-0"
          />
        </Suspense>
      ) : (
        still_
      )}
    </>
  );

  const outlineStyle = { WebkitTextStroke: "1.5px color-mix(in srgb, var(--accent) 70%, transparent)" };
  const nameSr = (
    <span className="sr-only">
      {profile.displayName} — Cloud & DevOps Engineer. {profile.hero.headline.join(" ")}
    </span>
  );

  /* ------------------------------ PHONES / TABLETS ------------------------------ */
  if (!cinematic) {
    return (
      <section ref={sectionRef} aria-labelledby="hero-title" className="relative isolate overflow-hidden pb-4 pt-[4.75rem]">
        <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0 -z-20" />
        <div aria-hidden="true" className="blueprint pointer-events-none absolute inset-0 -z-20 opacity-50" />

        {/* The poster: one aspect-locked frame, everything inside is positioned in % of it. */}
        <motion.div style={reduced ? undefined : { opacity: posterOpacity }} className="poster relative mx-auto w-full max-w-[560px] sm:max-w-[640px]">
          <div className="relative w-full" style={{ paddingTop: "122%" }}>
            <div className="absolute inset-0">
              <div
                aria-hidden="true"
                className="poster-outline pointer-events-none absolute inset-x-0 top-[13%] select-none whitespace-nowrap text-center font-display italic leading-none text-transparent"
              >
                <span style={outlineStyle}>{profile.givenNames}</span>
              </div>

              {/* Portrait — fixed square pinned to the bottom of the poster */}
              <div className="absolute inset-x-0 bottom-0" style={{ height: "82%" }}>
                <div className="relative mx-auto h-full" style={{ aspectRatio: "1 / 1", maxWidth: "100%" }}>
                  {portrait}
                </div>
              </div>

              <RoleBadge className="poster-badge absolute right-[4%] top-[1.5%] z-10" />

              <h1
                id="hero-title"
                className="poster-name absolute inset-x-0 bottom-[7%] z-10 w-full font-sans font-extrabold uppercase leading-[0.8] tracking-[-0.04em]"
              >
                {nameSr}
                <HeroWord text={profile.lastName} reduced={reduced} startDelay={0.15} />
              </h1>
            </div>
          </div>
        </motion.div>

        <div className="relative z-20 mx-auto mt-3 w-full max-w-[640px] px-5 sm:px-8">
          <motion.p {...fade(0.3)} className="flex items-center gap-3 text-muted">
            <span className="h-px w-6 bg-accent" aria-hidden="true" />
            <span className="t-eyebrow text-[0.62rem] text-ink-soft">{profile.displayName}</span>
          </motion.p>
          <motion.p {...fade(0.45)} className="mt-3 font-display text-[clamp(1.7rem,7.4vw,2.6rem)] italic leading-[1.08] text-ink">
            {profile.hero.headline.map((line, i) => (
              <span key={line} className={cn("block", i === profile.hero.accentLine && "text-metal")}>
                {line}
              </span>
            ))}
          </motion.p>
          <motion.p {...fade(0.6)} className="t-lead mt-4 text-ink-soft">
            {profile.hero.lead}
          </motion.p>
          <motion.div {...fade(0.75)} className="mt-6 flex flex-wrap items-center gap-3">
            <ButtonLink to={profile.hero.primaryCta.to}>{profile.hero.primaryCta.label}</ButtonLink>
            <ButtonLink to={profile.hero.secondaryCta.to} variant="ghost">
              {profile.hero.secondaryCta.label}
            </ButtonLink>
          </motion.div>
          <motion.div {...fade(0.9)} className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              to={profile.hero.tertiaryLink.to}
              className="group inline-flex items-center gap-2 text-sm text-ink-soft decoration-accent underline-offset-[6px] hover:text-ink hover:underline"
            >
              {profile.hero.tertiaryLink.label}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Socials social={social} />
          </motion.div>
          <div className="t-meta mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[0.62rem] text-muted">
            <StatusTicker />
            <button
              type="button"
              onClick={() => document.getElementById("introduction")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" })}
              className="inline-flex min-h-10 items-center gap-2 hover:text-ink"
            >
              Scroll <ArrowDown className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ------------------------------ DESKTOP (cinematic) ------------------------------ */
  return (
    <>
      <section ref={sectionRef} aria-labelledby="hero-title" className="relative -mb-[45svh] h-[190svh]">
        <motion.div style={{ opacity: stageOpacity }} className="sticky top-0 isolate h-svh overflow-hidden">
          <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0 -z-20" />
          <div aria-hidden="true" className="blueprint pointer-events-none absolute inset-0 -z-20 opacity-60" />

          {/* Role badge with the monogram — top-right corner, the same place as on phones.
              It fades out together with the side copy as you start to scroll. */}
          <motion.div aria-hidden="true" style={{ opacity: sideOpacity }} className="pointer-events-none absolute inset-x-0 top-0 z-20">
            <Container className="flex justify-end pt-5 xl:pt-6">
              <RoleBadge className="size-[clamp(84px,7.4vw,124px)]" />
            </Container>
          </motion.div>

          {/* Outline given names — depth layer behind the portrait */}
          <motion.div
            aria-hidden="true"
            style={{ y: outlineY, x: outlineX }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="pointer-events-none absolute left-0 right-0 top-[max(9svh,4.75rem)] -z-10 select-none whitespace-nowrap text-center font-display text-[min(11vw,23svh)] italic leading-none text-transparent"
          >
            <span style={outlineStyle}>{profile.givenNames}</span>
          </motion.div>

          <div className="relative h-full">
            <motion.div
              style={{ scale: portraitScale, y: portraitY }}
              className="absolute bottom-0 left-1/2 z-0 aspect-square w-[min(92svh,64vw)] -translate-x-1/2 origin-bottom"
            >
              {portrait}
            </motion.div>

            <motion.h1
              id="hero-title"
              style={{ y: nameY, scale: nameScale, opacity: nameOpacity }}
              className="pointer-events-none absolute bottom-[max(21svh,7.5rem)] max-[1319px]:bottom-[max(21svh,10.5rem)] left-0 right-0 z-10 w-full font-sans text-[min(17.5vw,31svh)] font-extrabold uppercase leading-[0.8] tracking-[-0.04em]"
            >
              {nameSr}
              <HeroWord text={profile.lastName} reduced={reduced} startDelay={0.15} />
            </motion.h1>

            {/* Description — same spots as the deployed site: headline left, lead right.
                Hidden by default (clean hero). The "Intro" button next to the contact bar opens / closes it. */}
            <motion.div style={{ opacity: sideOpacity }} className="pointer-events-none absolute inset-x-0 top-[max(30svh,11rem)] z-20">
              <AnimatePresence>
                {descOpen && (
                  <div id="hero-description" className="flex items-start justify-between gap-10 px-[clamp(1.5rem,4.6vw,7rem)]">
                    <motion.div
                      key="desc-left"
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.6, ease: ease.lux }}
                      className="pointer-events-auto max-w-[24rem]"
                    >
                      <p className="flex items-center gap-3">
                        <span className="h-px w-8 shrink-0 bg-accent" aria-hidden="true" />
                        <span className="t-eyebrow text-[0.62rem] text-ink">{profile.displayName}</span>
                      </p>
                      <p className="t-meta mt-2 pl-11 text-[0.6rem] text-muted">{profile.hero.eyebrow}</p>
                      <p className="mt-4 font-display text-[clamp(1.45rem,1.75vw,2.1rem)] italic leading-[1.08] text-ink">
                        {profile.hero.headline.map((line, i) => (
                          <span key={line} className={cn("block", i === profile.hero.accentLine && "text-metal")}>
                            {line}
                          </span>
                        ))}
                      </p>
                    </motion.div>

                    <motion.p
                      key="desc-right"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ duration: 0.6, ease: ease.lux, delay: 0.06 }}
                      className="t-lead pointer-events-auto w-[min(24rem,30vw)] text-ink-soft"
                    >
                      {profile.hero.lead}
                    </motion.p>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Bottom row.
                ≥1320px : status (left) · contact bar + Intro button (centre) · scroll hint (right)
                <1320px : status centred just above the contact bar, so nothing can collide on smaller laptops. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 px-[clamp(1.5rem,3.4vw,4rem)]">
              <div className="flex flex-col items-center gap-3 min-[1320px]:grid min-[1320px]:grid-cols-[1fr_auto_1fr] min-[1320px]:gap-6">
                <motion.div {...fade(1.1)} className="pointer-events-auto min-[1320px]:justify-self-start">
                  <StatusTicker variant="readable" />
                </motion.div>

                <motion.div {...fade(1.0)} className="pointer-events-auto flex items-center gap-3">
                  {/* Contact bar */}
                  <div className="flex items-center gap-2 rounded-full border border-line-strong bg-bg/55 p-3 backdrop-blur-xl">
                    <ButtonLink to={profile.hero.primaryCta.to}>{profile.hero.primaryCta.label}</ButtonLink>
                    <ButtonLink to={profile.hero.secondaryCta.to} variant="ghost">
                      {profile.hero.secondaryCta.label}
                    </ButtonLink>
                    <Link
                      to={profile.hero.tertiaryLink.to}
                      className="group mx-2 inline-flex items-center gap-2 whitespace-nowrap text-sm text-ink-soft decoration-accent underline-offset-[6px] transition-colors hover:text-ink hover:underline"
                    >
                      {profile.hero.tertiaryLink.label}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                    <Socials social={social} />
                  </div>

                  {/* Profile toggle — beside the contact bar */}
                  <button
                    type="button"
                    onClick={() => setDescOpen((v) => !v)}
                    aria-expanded={descOpen}
                    aria-controls="hero-description"
                    data-cursor="magnetic"
                    className={cn(
                      "inline-flex h-14 items-center gap-2 rounded-full border px-5 text-sm font-medium backdrop-blur-xl transition-colors duration-300",
                      descOpen
                        ? "border-accent bg-accent text-accent-ink"
                        : "border-line-strong bg-bg/55 text-ink hover:border-accent hover:text-accent",
                    )}
                  >
                    {descOpen ? <X className="size-4" aria-hidden="true" /> : <User className="size-4" aria-hidden="true" />}
                  </button>
                </motion.div>

                <motion.div
                  {...fade(1.3)}
                  style={{ opacity: hintOpacity }}
                  className="pointer-events-auto t-meta hidden text-[0.7rem] text-ink-soft min-[1320px]:block min-[1320px]:justify-self-end"
                >
                  <button
                    type="button"
                    onClick={() => document.getElementById("introduction")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="mr-14 inline-flex min-h-10 items-center gap-2 hover:text-ink"
                  >
                    Scroll <ArrowDown className="size-3.5" aria-hidden="true" />
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}

function Socials({ social }: { social: { id: string; label: string; href: string }[] }) {
  return (
    <ul className="flex items-center gap-2" aria-label="Social profiles">
      {social.map((s) => (
        <li key={s.id}>
          <ExternalLink
            href={s.href}
            aria-label={s.label}
            data-cursor="magnetic"
            className="group inline-flex size-11 items-center justify-center rounded-full border border-line text-ink-soft transition-all duration-300 hover:border-accent hover:text-accent hover:shadow-[0_0_14px_-4px_var(--accent)]"
          >
            {s.id === "github" ? (
              <GitHubIcon className="size-[18px] transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <LinkedInIcon className="size-[17px] transition-transform duration-300 group-hover:scale-110" />
            )}
          </ExternalLink>
        </li>
      ))}
    </ul>
  );
}