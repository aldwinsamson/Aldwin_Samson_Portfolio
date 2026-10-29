import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { projects as allProjects } from "@/content/projects";
import { MAX_RING, selectRingProjects } from "@/content/projectLogic";
import type { Project } from "@/content/types";
import { Container, StatusDot, Tag } from "@/components/ui";
import { TypeWriter } from "@/components/TypeWriter";
import { BrandMark } from "@/components/BrandMark";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { ease } from "@/styles/motion";
import { cn } from "@/utils/cn";
import { ProjectCover } from "./ProjectCover";
import { angleForIndex, frontIndex, normalizeAngle, ringGeometryCount, ringRadius, ringStep, snapAngle } from "./ringMath";

/** Card + camera sizes. Phones use a "coverflow" view: the ring is larger than the screen and only the front peeks in. */
const SIZES = {
  desktop: { w: 220, h: 276, gap: 20, perspective: 2200 },
  mobile: { w: 180, h: 228, gap: 14, perspective: 1800 },
};
const TILT_DEG = -12;
const AUTO_DEG_PER_MS = 0.004; // ≈ 4° per second — set to 0 to switch the idle drift off
const DRAG_DEG_PER_PX = 0.32;
/** Mouse-wheel feel: one card step per this many pixels of scroll (a typical wheel notch is ~100px → ¼ of a card). */
const WHEEL_PX_PER_STEP = 450;
/** Extra width (px) around the wheel in which the scroll wheel turns it. */
const WHEEL_ZONE_PAD = 40;
const SPRING = { type: "spring", stiffness: 90, damping: 20, mass: 0.9 } as const;

/**
 * Homepage project showcase: a tilted 3D wheel with ONE card per project.
 *
 * It is an ordinary block in the page (nothing is pinned). The mouse wheel is only captured while the
 * pointer is ON the wheel: scrolling there turns the wheel. Anywhere else on the page, scrolling moves
 * the page as usual. You can also drag / swipe it, press the arrows, click a dot or click a side card.
 */
export function ProjectRing() {
  const reduced = usePrefersReducedMotion();
  const desktopSize = useMediaQuery("(min-width: 1024px)");
  const size = desktopSize ? SIZES.desktop : SIZES.mobile;

  // One card per project (capped at MAX_RING; featured projects win the slots if there are more).
  const ring = useMemo(() => selectRingProjects(allProjects, MAX_RING), []);
  const count = ring.length;
  const interactive = count > 1;
  const step = ringStep(count);
  const radius = interactive ? ringRadius(size.w, ringGeometryCount(count), size.gap) : 0;

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { margin: "10% 0px 10% 0px" });

  // Desktop: scale the whole wheel so it always fits the stage, however many projects there are.
  const [fit, setFit] = useState(1);
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !desktopSize) {
      setFit(1);
      return;
    }
    const needW = (2 * (radius + size.w / 2) + size.w) * 1.15;
    const measure = () => setFit(Math.min(1.25, Math.max(0.5, Math.min(el.clientHeight / 520, el.clientWidth / needW))));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [desktopSize, radius, size.w]);

  const auto = useMotionValue(0);
  const drag = useMotionValue(0);
  const angle = useTransform([auto, drag], (v) => (v as number[]).reduce((a, b) => a + b, 0));

  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  useMotionValueEvent(angle, "change", (v) => {
    const i = frontIndex(v, Math.max(count, 1));
    activeRef.current = i;
    setActive((prev) => (prev === i ? prev : i));
  });

  // Idle drift — paused while hovered / dragging / off-screen / reduced motion.
  const hovering = useRef(false);
  const dragging = useRef(false);
  useAnimationFrame((_, delta) => {
    if (!interactive || reduced || !inView || hovering.current || dragging.current) return;
    auto.set(auto.get() - delta * AUTO_DEG_PER_MS);
  });

  /** Moves the `drag` offset to `next` (springy), cancelling any spring that is still running. */
  const anim = useRef<ReturnType<typeof animate> | null>(null);
  const turnTo = useCallback(
    (next: number) => {
      anim.current?.stop();
      if (reduced) drag.set(next);
      else anim.current = animate(drag, next, SPRING);
    },
    [drag, reduced],
  );

  /** Eases the wheel so a card sits squarely at the front. */
  const settle = useCallback(() => {
    if (!interactive) return;
    const total = angle.get();
    turnTo(drag.get() + (snapAngle(total, count) - total));
  }, [angle, count, drag, interactive, turnTo]);

  /** Turns the wheel to bring card `index` to the front (shortest way round). */
  const rotateTo = useCallback(
    (index: number) => {
      if (!interactive) return;
      const total = angle.get();
      turnTo(drag.get() + (angleForIndex(index, total, count) - total));
    },
    [angle, count, drag, interactive, turnTo],
  );

  const go = (dir: 1 | -1) => {
    if (!interactive) return;
    const total = angle.get();
    turnTo(drag.get() + (snapAngle(total, count) - total) - dir * step);
  };

  // Drag / swipe to spin (mouse, pen, touch). `touch-action: pan-y` keeps vertical page scroll working on phones.
  const gesture = useRef({ x: 0, start: 0, moved: false, id: -1 });
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || (e.pointerType === "mouse" && e.button !== 0)) return;
    anim.current?.stop();
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
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== gesture.current.id) return;
    dragging.current = false;
    if (gesture.current.moved) settle();
  };

  // Scroll wheel / trackpad: while the pointer is ON the wheel, scrolling turns the wheel (and the page stays put).
  // Anywhere else — including the empty sides of the stage — the page scrolls normally.
  const zoneWidth = useRef(0);
  zoneWidth.current = (2 * radius + size.w) * fit + WHEEL_ZONE_PAD;
  /** Is the mouse over the wheel itself (the centred area where the cards are)? Only then does the idle spin pause. */
  const updateHover = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const box = e.currentTarget.getBoundingClientRect();
    hovering.current = Math.abs(e.clientX - (box.left + box.width / 2)) <= zoneWidth.current / 2;
  };
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !interactive) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom / ctrl+wheel
      const box = el.getBoundingClientRect();
      if (Math.abs(e.clientX - (box.left + box.width / 2)) > zoneWidth.current / 2) return; // outside the wheel → page scrolls
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1; // lines / pages → pixels
      const raw = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const delta = Math.max(-240, Math.min(240, raw * unit));
      if (!delta) return;
      e.preventDefault(); // don't scroll the page…
      e.stopPropagation(); // …and keep the smooth-scroll library from doing it either
      anim.current?.stop();
      drag.set(drag.get() - delta * (step / WHEEL_PX_PER_STEP));
      clearTimeout(timer);
      timer = setTimeout(settle, 140); // when the wheel stops, ease to the nearest card
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(timer);
    };
  }, [drag, interactive, settle, step]);

  if (count === 0) return null;

  const project = ring[Math.min(active, count - 1)];
  const hiddenCount = allProjects.length - count;

  return (
    <section ref={sectionRef} aria-labelledby="work-title" className="relative py-12 sm:py-20">
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
            <span className="hidden sm:inline">{hiddenCount > 0 ? `All ${allProjects.length} projects` : "All projects"}</span>
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

      {/* The wheel — a fixed-height stage. Only THIS area reacts to dragging; the page scrolls normally around it. */}
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
                onPointerMove={(e) => {
          updateHover(e);
          onPointerMove(e);
        }}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={updateHover}
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
        style={{ touchAction: "pan-y", overscrollBehaviorX: "contain", perspective: size.perspective, perspectiveOrigin: "50% 38%" }}
        className={cn(
          "relative mt-4 h-[430px] w-full select-none overflow-hidden sm:h-[480px] lg:h-[500px]",
          interactive && "cursor-grab active:cursor-grabbing",
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
              transform: `scale(${fit}) translateY(${desktopSize ? -4 : -3}%) rotateX(${TILT_DEG}deg)`,
              width: size.w,
              height: size.h,
            }}
            className="relative"
          >
            <motion.div style={{ rotateY: angle, transformStyle: "preserve-3d", willChange: "transform" }} className="absolute inset-0">
              {ring.map((p, i) => (
                <RingCard
                  key={p.slug}
                  project={p}
                  index={i}
                  step={step}
                  radius={radius}
                  w={size.w}
                  h={size.h}
                  angle={angle}
                  onSideClick={(e) => {
                    // Clicking a card that isn't at the front brings it to the front instead of opening it.
                    if (i !== activeRef.current) {
                      e.preventDefault();
                      rotateTo(i);
                    }
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
        {/* Edge fade so the wheel melts into the page */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[10%] bg-gradient-to-r from-bg to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[10%] bg-gradient-to-l from-bg to-transparent" />
      </div>

      {/* Info + controls */}
      <Container className="relative z-10 mt-2 w-full">
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

          {interactive && (
            <div className="flex flex-row-reverse items-center justify-between gap-6 lg:flex-row lg:justify-end">
              <p className="t-meta text-muted" aria-hidden="true">
                <span className="text-ink">{String(active + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")}
                <span className="ml-4 hidden xl:inline">Scroll, drag or swipe the wheel to rotate</span>
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center" role="group" aria-label="Choose a project">
                  {ring.map((p, i) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => rotateTo(i)}
                      aria-label={`Show ${p.title}`}
                      aria-current={i === active}
                      className="group/dot flex size-6 items-center justify-center"
                    >
                      <span
                        className={cn(
                          "block h-1.5 rounded-full transition-all duration-300",
                          i === active ? "w-6 bg-accent" : "w-1.5 bg-line-strong group-hover/dot:bg-ink-soft",
                        )}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous project"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-accent hover:text-accent"
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next project"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-accent hover:text-accent"
                  >
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>

      {/* Screen-reader / no-pointer route to every project (the wheel itself is decorative). */}
      <ul className="sr-only">
        {allProjects.map((p) => (
          <li key={p.slug}>
            <Link to={`/projects/${p.slug}`}>
              {p.title} — {p.tagline}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  One card of the wheel = one project                                */
/* ------------------------------------------------------------------ */
function RingCard({
  project,
  index,
  step,
  radius,
  w,
  h,
  angle,
  onSideClick,
}: {
  project: Project;
  index: number;
  step: number;
  radius: number;
  w: number;
  h: number;
  angle: MotionValue<number>;
  onSideClick: (e: ReactMouseEvent) => void;
}) {
  // 0 = facing the viewer. Depth cues are applied to the faces (not the card) so preserve-3d stays intact.
  const rel = useTransform(angle, (v) => normalizeAngle(index * step + v));
  const opacity = useTransform(rel, (v) => 0.3 + 0.7 * Math.max(0, 1 - Math.abs(v) / 150));
  const shade = useTransform(rel, (v) => 0.5 * Math.min(1, Math.abs(v) / 120));

  const faceClass =
    "absolute inset-0 overflow-hidden rounded-[1.4rem] border border-line-strong bg-elev shadow-[0_30px_60px_-30px_rgba(0,0,0,0.55)]";

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
      {/* Front face — the project card */}
      <motion.div style={{ opacity, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }} className={faceClass}>
        <Link to={`/projects/${project.slug}`} tabIndex={-1} draggable={false} onClick={onSideClick} className="relative block size-full">
          <div className="relative size-full">
            <ProjectCover project={project} className="absolute inset-0" imgClassName="absolute inset-0" sizes={`${w}px`} />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/70">{project.categories[0]}</p>
              <p className="mt-1 font-display text-[1.6rem] leading-none">{project.title}</p>
            </div>
            {project.cover?.kind === "representative" && (
              <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-0.5 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm">
                Concept image
              </span>
            )}
          </div>
          <motion.span aria-hidden="true" style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-black" />
        </Link>
      </motion.div>
      {/* Back face — your logo, seen on the far side of the wheel */}
      <div
        style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[1.4rem] border border-line bg-sunken/90"
      >
        <BrandMark className="size-16 opacity-60" />
      </div>
    </div>
  );
}