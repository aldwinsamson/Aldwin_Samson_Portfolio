import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Award } from "lucide-react";
import { projects } from "@/content/projects";
import type { Project } from "@/content/types";
import { Container, SmartImage, StatusDot, Tag } from "@/components/ui";
import { TypeWriter } from "@/components/TypeWriter";
import { BrandMark } from "@/components/BrandMark";
import { useCinematic } from "@/hooks/useCinematic";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { ease } from "@/styles/motion";
import { cn } from "@/utils/cn";
import { buildSlots, frontIndex, normalizeAngle, ringRadius, snapAngle, type RingSlot } from "./ringMath";

const bySlug = (slug: string): Project => projects.find((p) => p.slug === slug) ?? projects[0];

/** Card + camera sizes. Phones use a "coverflow" view: the ring is larger than the screen and only the front peeks in. */
const SIZES = {
  desktop: { w: 220, h: 276, gap: 20, perspective: 2200 },
  mobile: { w: 180, h: 228, gap: 14, perspective: 1800 },
};
const TILT_DEG = -12;
const AUTO_DEG_PER_MS = 0.006; // 6° per second
const DRAG_DEG_PER_PX = 0.32;
const SPRING = { type: "spring", stiffness: 90, damping: 20, mass: 0.9 } as const;

/**
 * Homepage project showcase: a tilted 3D ring of project faces that keeps rotating.
 *  Desktop  → the stage is pinned and scrolling turns the ring (plus a slow idle drift; drag to spin).
 *  Mobile   → fixed layout, idle drift + horizontal drag, arrow buttons. Vertical scroll stays native.
 */
export function ProjectRing() {
  const cinematic = useCinematic();
  const reduced = usePrefersReducedMotion();
  const desktopSize = useMediaQuery("(min-width: 1024px)");
  const size = desktopSize ? SIZES.desktop : SIZES.mobile;

  const slots = useMemo(() => buildSlots(projects), []);
  const count = slots.length;
  const step = 360 / count;
  const radius = ringRadius(size.w, count, size.gap);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  // Desktop: scale the whole ring so it always fits the space between header and info panel.
  const [fit, setFit] = useState(1);
  useEffect(() => {
    const el = ringRef.current;
    if (!el || !desktopSize) {
      setFit(1);
      return;
    }
    const measure = () => setFit(Math.min(1.25, Math.max(0.5, Math.min(el.clientHeight / 520, el.clientWidth / 1350))));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [desktopSize, cinematic]);
  const inView = useInView(stageRef, { margin: "20% 0px 20% 0px" });

  const auto = useMotionValue(0);
  const drag = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const scrollDeg = useTransform(scrollYProgress, [0, 1], cinematic ? [0, -450] : [0, 0]);
  const angle = useTransform([auto, drag, scrollDeg], (v) => (v as number[]).reduce((a, b) => a + b, 0));

  const [active, setActive] = useState(0);
  useMotionValueEvent(angle, "change", (v) => {
    const i = frontIndex(v, count);
    setActive((prev) => (prev === i ? prev : i));
  });

  // Idle drift — paused while hovered / dragging / off-screen / reduced motion.
  const hovering = useRef(false);
  const dragging = useRef(false);
  useAnimationFrame((_, delta) => {
    if (reduced || !inView || hovering.current || dragging.current) return;
    auto.set(auto.get() - delta * AUTO_DEG_PER_MS);
  });

  // Drag to spin (mouse, pen, touch). `touch-action: pan-y` keeps vertical page scroll working.
  const gesture = useRef({ x: 0, start: 0, moved: false, id: -1 });
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    gesture.current = { x: e.clientX, start: drag.get(), moved: false, id: e.pointerId };
    dragging.current = true;
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current || e.pointerId !== gesture.current.id) return;
    const dx = e.clientX - gesture.current.x;
    if (!gesture.current.moved && Math.abs(dx) > 6) {
      gesture.current.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (gesture.current.moved) drag.set(gesture.current.start + dx * DRAG_DEG_PER_PX);
  };
  const settle = () => {
    // Ease the ring so a card sits squarely at the front.
    const total = angle.get();
    const next = drag.get() + (snapAngle(total, count) - total);
    if (reduced) drag.set(next);
    else animate(drag, next, SPRING);
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== gesture.current.id) return;
    dragging.current = false;
    if (gesture.current.moved) settle();
  };

  const go = (dir: 1 | -1) => {
    const total = angle.get();
    const next = drag.get() + (snapAngle(total, count) - total) - dir * step;
    if (reduced) drag.set(next);
    else animate(drag, next, SPRING);
  };

  const current = slots[active] ?? slots[0];
  const project = bySlug(current.projectSlug);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="work-title"
      className={cn("relative", cinematic ? "h-[380svh]" : "py-12 sm:py-20")}
    >
      <div ref={stageRef} className={cn("relative", cinematic && "sticky top-0 flex h-svh flex-col overflow-hidden pt-24")}>
        <Container className="w-full">
          {/* Same header row as the other sections: index · label · rule · link */}
          <div className="flex items-center gap-3 text-muted sm:gap-4">
            <span className="t-meta text-accent">02</span>
            <span className="t-eyebrow text-[0.6rem] sm:text-[0.7rem]">Projects</span>
            <span className="rule flex-1" aria-hidden="true" />
            <Link
              to="/projects"
              className="t-meta group inline-flex items-center gap-1.5 text-[0.62rem] text-ink-soft transition-colors hover:text-accent sm:text-[0.72rem]"
            >
              <span className="hidden sm:inline">All projects</span>
              <span className="sm:hidden">View</span>
              <ArrowUpRight aria-hidden="true" className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <h2 id="work-title" className="mt-4 max-w-4xl text-balance font-display text-[clamp(1.8rem,3.4vw,3.1rem)] leading-[1.05] sm:mt-5">
            Case studies from the{" "}
            <em className="text-metal">
              <TypeWriter phrases={["bench.", "breadboard.", "browser.", "command line."]} className="inline" />
            </em>
          </h2>
        </Container>

        {/* The ring */}
        <div
          ref={ringRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") hovering.current = true;
          }}
          onPointerLeave={() => {
            hovering.current = false;
          }}
          onClickCapture={(e) => {
            // A drag must never count as a click on a card.
            if (gesture.current.moved) {
              e.preventDefault();
              e.stopPropagation();
              gesture.current.moved = false;
            }
          }}
          aria-hidden="true"
          style={{ touchAction: "pan-y", perspective: size.perspective, perspectiveOrigin: "50% 38%" }}
          className={cn(
            "relative w-full cursor-grab select-none overflow-hidden active:cursor-grabbing",
            cinematic ? "min-h-0 flex-1" : "mt-4 h-[440px] sm:h-[500px]",
          )}
        >
          {/* Soft stage glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[8%] inset-y-[12%]"
            style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--accent) 12%, transparent), transparent 75%)" }}
          />
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.2, ease: ease.cinematic }}
            style={{ transformStyle: "preserve-3d" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              style={{
                transformStyle: "preserve-3d",
                transform: `scale(${fit}) translateY(${desktopSize ? -16 : -9}%) rotateX(${TILT_DEG}deg)`,
                width: size.w,
                height: size.h,
              }}
              className="relative"
            >
              <motion.div style={{ rotateY: angle, transformStyle: "preserve-3d", willChange: "transform" }} className="absolute inset-0">
                {slots.map((slot, i) => (
                  <RingCard key={slot.id} slot={slot} index={i} step={step} radius={radius} w={size.w} h={size.h} angle={angle} />
                ))}
              </motion.div>
            </div>
          </motion.div>
          {/* Edge fade so the ring melts into the page */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-[10%] bg-gradient-to-r from-bg to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-[10%] bg-gradient-to-l from-bg to-transparent"
          />
        </div>

        {/* Info + controls */}
        <Container className={cn("relative z-10 w-full", cinematic ? "pb-8" : "mt-2")}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div aria-live="polite" className="min-h-[9.5rem] max-w-xl lg:min-h-[11rem]">
              <AnimatePresence mode="wait">
                <motion.article
                  key={project.slug}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: ease.lux }}
                >
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <StatusDot status={project.status} />
                    <span className="t-meta text-muted">{project.period}</span>
                  </div>
                  <h3 className="mt-3 font-display text-[clamp(1.7rem,2.8vw,2.6rem)] leading-none">{project.title}</h3>
                  <p className="t-meta mt-2 text-accent">{project.role}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft sm:text-[0.95rem]">{project.tagline}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <Link
                      to={`/projects/${project.slug}`}
                      className="group inline-flex items-center gap-2 text-sm font-medium text-ink decoration-accent underline-offset-[6px] hover:underline"
                    >
                      Read the case study
                      <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                    <span className="hidden flex-wrap gap-1.5 sm:flex">
                      {project.stack.slice(0, 3).map((s) => (
                        <Tag key={s}>{s}</Tag>
                      ))}
                    </span>
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>

            <div className="flex flex-row-reverse items-center justify-between gap-6 pb-14 lg:flex-row lg:justify-end lg:pb-0 lg:pr-20">
              <p className="t-meta text-muted" aria-hidden="true">
                <span className="text-ink">{String(active + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")}
                <span className="ml-4 hidden sm:inline">{cinematic ? "Scroll or drag to rotate" : "Drag to rotate"}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous project view"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next project view"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </Container>

        {/* Screen-reader / no-pointer route to every project (the ring itself is decorative). */}
        <ul className="sr-only">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link to={`/projects/${p.slug}`}>
                {p.title} — {p.tagline}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  One face of the ring                                               */
/* ------------------------------------------------------------------ */
function RingCard({
  slot,
  index,
  step,
  radius,
  w,
  h,
  angle,
}: {
  slot: RingSlot;
  index: number;
  step: number;
  radius: number;
  w: number;
  h: number;
  angle: MotionValue<number>;
}) {
  const project = bySlug(slot.projectSlug);
  // 0 = facing the viewer. Depth cues are applied to the faces (not the card) so preserve-3d stays intact.
  const rel = useTransform(angle, (v) => normalizeAngle(index * step + v));
  const opacity = useTransform(rel, (v) => 0.3 + 0.7 * Math.max(0, 1 - Math.abs(v) / 150));
  const shade = useTransform(rel, (v) => 0.5 * Math.min(1, Math.abs(v) / 120));

  return (
    <div
      className="absolute"
      style={{
        left: "50%",
        top: "50%",
        width: w,
        height: h,
        marginLeft: -w / 2,
        marginTop: -h / 2,
        transformStyle: "preserve-3d",
        transform: `rotateY(${index * step}deg) translateZ(${radius}px)`,
      }}
    >
      {/* Front face */}
      <motion.div
        style={{ opacity, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        className="absolute inset-0 overflow-hidden rounded-[1.4rem] border border-line-strong bg-elev shadow-[0_30px_60px_-30px_rgba(0,0,0,0.55)]"
      >
        <Link to={`/projects/${project.slug}`} tabIndex={-1} draggable={false} className="relative block size-full">
          <FaceContent slot={slot} project={project} />
          <motion.span aria-hidden="true" style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-black" />
        </Link>
      </motion.div>
      {/* Back face — plain glass with the monogram, seen on the far side of the ring */}
      <div
        style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[1.4rem] border border-line bg-sunken/90"
      >
        <BrandMark className="size-16 opacity-60" />
      </div>
    </div>
  );
}

function FaceContent({ slot, project }: { slot: RingSlot; project: Project }) {
  if ((slot.kind === "cover" || slot.kind === "shot") && slot.media) {
    return (
      <div className="relative size-full">
        <SmartImage src={slot.media.src} alt="" className="absolute inset-0" imgClassName="absolute inset-0" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/70">{project.categories[0]}</p>
          <p className="mt-1 font-display text-[1.6rem] leading-none">{project.title}</p>
        </div>
        {slot.media.kind === "representative" && (
          <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-0.5 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm">
            Concept image
          </span>
        )}
      </div>
    );
  }

  if (slot.kind === "stack") {
    return (
      <div className="flex size-full flex-col p-5">
        <p className="t-eyebrow text-[0.58rem] text-accent">Built with</p>
        <p className="mt-2 font-display text-[1.7rem] leading-none text-ink">{project.title}</p>
        <div className="mt-4 flex flex-wrap content-start gap-1.5">
          {project.stack.slice(0, 7).map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </div>
        <p className="t-meta mt-auto text-[0.62rem] text-muted">{project.period}</p>
      </div>
    );
  }

  // highlight — awards if the project has them, otherwise its first outcome
  return (
    <div className="flex size-full flex-col p-5">
      <p className="t-eyebrow text-[0.58rem] text-accent">{project.awards?.length ? "Recognition" : "Outcome"}</p>
      <p className="mt-2 font-display text-[1.7rem] leading-none text-ink">{project.title}</p>
      {project.awards?.length ? (
        <ul className="mt-4 space-y-2">
          {project.awards.slice(0, 4).map((a) => (
            <li key={a} className="flex items-center gap-2 text-[0.8rem] leading-tight text-ink-soft">
              <Award className="size-3.5 shrink-0 text-accent" aria-hidden="true" />
              {a}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 line-clamp-6 text-[0.82rem] leading-relaxed text-ink-soft">{project.outcomes[0] ?? project.tagline}</p>
      )}
    </div>
  );
}
