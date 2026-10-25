import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Command, Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { profile } from "@/content/profile";
import { frontIndex, normalizeAngle, ringRadius, snapAngle } from "@/features/projects/ringMath";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useCommandPalette } from "./CommandPalette";
import { cn } from "@/utils/cn";
import { ease, spring } from "@/styles/motion";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";

const isActive = (pathname: string, to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

/** iOS-style spring for the island growing / shrinking. */
const ISLAND = { type: "spring", stiffness: 380, damping: 32, mass: 0.9 } as const;
const ISLAND_RADIUS = 28;
const ISLAND_MAX_WIDTH = 380;

export function Navbar() {
  const { pathname } = useLocation();
  const { scrollY } = useScroll();
  const reduced = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [collapsedW, setCollapsedW] = useState<number | null>(null);
  const [expandedW, setExpandedW] = useState(ISLAND_MAX_WIDTH);

  // Context-aware: condenses after scroll, tucks away when scrolling down, returns on scroll up.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 480 && y > prev + 4 && !open);
    if (y < prev - 4) setHidden(false);
  });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);

  // Measure the closed island (phones) so it can grow from its exact size.
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row || !isMobile || open) return;
    const measure = () => setCollapsedW(Math.ceil(row.getBoundingClientRect().width) + 12); // + p-1.5 on both sides
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    return () => ro.disconnect();
  }, [isMobile, open]);

  // Island open: lock page scroll, Escape closes, focus returns to the button.
  useEffect(() => {
    if (!open) return;
    setExpandedW(Math.min(Math.floor(window.innerWidth * 0.92), ISLAND_MAX_WIDTH));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const toggleEl = toggleRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      toggleEl?.focus();
    };
  }, [open]);

  const mobileLinks = [...siteConfig.nav, { label: "Contact", to: "/contact" }];
  const islandWidth = isMobile && collapsedW ? (open ? expandedW : collapsedW) : undefined;

  return (
    <>
      <a
        href="#main"
        onClick={(e) => {
          // Handled manually so it works with hash routing too.
          e.preventDefault();
          const main = document.getElementById("main");
          main?.focus({ preventScroll: true });
          main?.scrollIntoView();
        }}
        className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-full bg-ink px-4 py-2 text-sm text-bg transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      {/* Tap outside the island to close it (phones only). */}
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.header
        initial={false}
        animate={{ y: hidden ? -96 : 0 }}
        transition={{ duration: 0.4, ease: ease.lux }}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:pt-4"
      >
        {/* One centred capsule. On phones it behaves like an iOS Dynamic Island: the menu button grows it
            downwards into a rotating word wheel; tapping a word goes straight to that page. */}
        <motion.div
          id="site-island"
          initial={false}
          animate={{ width: islandWidth ?? "auto" }}
          transition={reduced ? { duration: 0 } : ISLAND}
          style={{ borderRadius: ISLAND_RADIUS }}
          className={cn(
            "pointer-events-auto flex flex-col overflow-hidden border bg-elev p-1.5 transition-[border-color,box-shadow] duration-300",
            scrolled || open ? "border-line-strong shadow-[var(--shadow)]" : "border-line shadow-[var(--shadow-sm)]",
          )}
        >
          <div ref={rowRef} className={cn("flex items-center gap-1 sm:gap-1.5", open ? "w-full justify-between" : "w-fit")}>
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="group inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-sunken/70 sm:size-11"
              aria-label={`${profile.name} — home`}
            >
              <BrandMark eager className="size-8 transition-transform duration-500 group-hover:scale-110 sm:size-9" />
            </Link>

            <span aria-hidden="true" className="mx-0.5 hidden h-5 w-px bg-line lg:block" />

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-0.5">
                {siteConfig.nav.map((item) => {
                  const active = isActive(pathname, item.to);
                  return (
                    <li key={item.to} className="relative">
                      <Link
                        to={item.to}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative z-10 block rounded-full px-3.5 py-2 text-[0.86rem] transition-colors",
                          active ? "text-ink" : "text-muted hover:text-ink",
                        )}
                      >
                        {item.label}
                      </Link>
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          transition={spring.layout}
                          className="absolute inset-0 rounded-full border border-line bg-sunken/80"
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <span aria-hidden="true" className="mx-0.5 hidden h-5 w-px bg-line lg:block" />

            <div className={cn("flex items-center gap-1 sm:gap-1.5", open && "contents")}>
              {siteConfig.features.commandPalette && <CmdKButton />}
              <ThemeToggle />
              <Link
                to="/contact"
                className="hidden min-h-10 items-center rounded-full bg-ink px-4 text-[0.84rem] font-medium text-bg transition-colors hover:bg-accent hover:text-accent-ink lg:inline-flex"
              >
                Contact
              </Link>
              <button
                ref={toggleRef}
                type="button"
                className="inline-flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-sunken/70 sm:size-11 lg:hidden"
                aria-expanded={open}
                aria-controls="site-island"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((o) => !o)}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={open ? "x" : "menu"}
                    initial={{ opacity: 0, rotate: -60, scale: 0.7 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 60, scale: 0.7 }}
                    transition={{ duration: 0.18 }}
                    className="inline-flex"
                  >
                    {open ? <X className="size-[18px]" aria-hidden="true" /> : <Menu className="size-[18px]" aria-hidden="true" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Expanded island: rotating word wheel (phones only) */}
          <AnimatePresence initial={false}>
            {open && isMobile && (
              <motion.div
                key="wheel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1, transition: { ...(reduced ? { duration: 0 } : ISLAND), opacity: { delay: 0.1, duration: 0.25 } } }}
                exit={{ height: 0, opacity: 0, transition: { duration: reduced ? 0 : 0.22, ease: ease.inOut } }}
                className="overflow-hidden"
              >
                <NavWheel links={mobileLinks} pathname={pathname} reduced={reduced} onNavigate={() => setOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.header>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Rotating word wheel                                                */
/* ------------------------------------------------------------------ */
const WORD_W = 176;
const WORD_H = 76;
const WHEEL_SPRING = { type: "spring", stiffness: 90, damping: 20, mass: 0.9 } as const;

function NavWheel({
  links,
  pathname,
  reduced,
  onNavigate,
}: {
  links: { label: string; to: string }[];
  pathname: string;
  reduced: boolean;
  onNavigate: () => void;
}) {
  const count = links.length;
  const step = 360 / count;
  const radius = ringRadius(WORD_W, count, 4);
  const startIdx = Math.max(0, links.findIndex((l) => isActive(pathname, l.to)));

  const auto = useMotionValue(0);
  const drag = useMotionValue(-startIdx * step); // open with the current page in front
  const angle = useTransform([auto, drag], (v) => (v as number[]).reduce((a, b) => a + b, 0));
  const [front, setFront] = useState(startIdx);
  useMotionValueEvent(angle, "change", (v) => {
    const i = frontIndex(v, count);
    setFront((prev) => (prev === i ? prev : i));
  });

  // Gentle idle rotation; pauses while the finger is down and for a moment after.
  const paused = useRef(true);
  const dragging = useRef(false);
  const resumeTimer = useRef<number | undefined>(undefined);
  const resumeLater = (ms: number) => {
    paused.current = true;
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      paused.current = false;
    }, ms);
  };
  useEffect(() => {
    resumeLater(1400);
    return () => window.clearTimeout(resumeTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useAnimationFrame((_, delta) => {
    if (reduced || paused.current || dragging.current) return;
    auto.set(auto.get() - delta * 0.006); // 6° per second
  });

  // Swipe to spin. Taps still reach the links (pointer capture only starts after a real drag).
  const gesture = useRef({ x: 0, start: 0, moved: false, id: -1 });
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    gesture.current = { x: e.clientX, start: drag.get(), moved: false, id: e.pointerId };
    dragging.current = true;
    paused.current = true;
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current || e.pointerId !== gesture.current.id) return;
    const dx = e.clientX - gesture.current.x;
    if (!gesture.current.moved && Math.abs(dx) > 6) {
      gesture.current.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (gesture.current.moved) drag.set(gesture.current.start + dx * 0.45);
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== gesture.current.id) return;
    dragging.current = false;
    resumeLater(1800);
    if (!gesture.current.moved) return;
    const total = angle.get();
    const next = drag.get() + (snapAngle(total, count) - total);
    if (reduced) drag.set(next);
    else animate(drag, next, WHEEL_SPRING);
  };

  return (
    <div className="pb-2 pt-1">
      {/* Keyboard / screen-reader route: the wheel below is purely visual. */}
      <nav aria-label="Site menu" className="sr-only">
        <ul>
          {links.map((item) => (
            <li key={item.to}>
              <Link to={item.to} onClick={onNavigate} aria-current={isActive(pathname, item.to) ? "page" : undefined}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div
        aria-hidden="true"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => {
          // A swipe must never count as a tap on a word.
          if (gesture.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            gesture.current.moved = false;
          }
        }}
        style={{ touchAction: "pan-y", perspective: 700, perspectiveOrigin: "50% 50%" }}
        className="relative h-[132px] w-full select-none overflow-hidden"
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
          <div style={{ width: WORD_W, height: WORD_H, transformStyle: "preserve-3d" }} className="relative">
            <motion.div style={{ rotateY: angle, transformStyle: "preserve-3d" }} className="absolute inset-0">
              {links.map((item, i) => (
                <WheelWord
                  key={item.to}
                  index={i}
                  label={item.label}
                  to={item.to}
                  active={isActive(pathname, item.to)}
                  isFront={front === i}
                  step={step}
                  radius={radius}
                  angle={angle}
                  onNavigate={onNavigate}
                />
              ))}
            </motion.div>
          </div>
        </div>
        {/* Soft edges so the wheel melts into the island */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[14%] bg-gradient-to-r from-elev to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[14%] bg-gradient-to-l from-elev to-transparent" />
      </div>
      <p aria-hidden="true" className="t-meta pb-1.5 text-center text-[0.56rem] text-muted">
        Swipe to rotate · tap a word to go
      </p>
    </div>
  );
}

function WheelWord({
  index,
  label,
  to,
  active,
  isFront,
  step,
  radius,
  angle,
  onNavigate,
}: {
  index: number;
  label: string;
  to: string;
  active: boolean;
  isFront: boolean;
  step: number;
  radius: number;
  angle: MotionValue<number>;
  onNavigate: () => void;
}) {
  // 0 = facing the viewer. Depth cues live on the face (not the card) so preserve-3d stays intact.
  const rel = useTransform(angle, (v) => normalizeAngle(index * step + v));
  const opacity = useTransform(rel, (v) => 0.22 + 0.78 * Math.max(0, 1 - Math.abs(v) / 80));
  const scale = useTransform(rel, (v) => 1 - 0.14 * Math.min(1, Math.abs(v) / 60));

  return (
    <div
      className="absolute"
      style={{
        left: "50%",
        top: "50%",
        width: WORD_W,
        height: WORD_H,
        marginLeft: -WORD_W / 2,
        marginTop: -WORD_H / 2,
        transformStyle: "preserve-3d",
        transform: `rotateY(${index * step}deg) translateZ(${radius}px)`,
      }}
    >
      <motion.div style={{ opacity, scale, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }} className="size-full">
        <Link
          to={to}
          onClick={onNavigate}
          tabIndex={-1}
          draggable={false}
          aria-current={active ? "page" : undefined}
          className="flex size-full flex-col items-center justify-center gap-1.5 rounded-2xl"
        >
          <span className={cn("font-display text-[2rem] leading-none", active ? "italic text-accent" : "text-ink")}>{label}</span>
          <span className="flex items-center gap-1.5">
            <span className="t-meta text-[0.55rem] text-muted">{String(index + 1).padStart(2, "0")}</span>
            <span aria-hidden="true" className={cn("size-1 rounded-full bg-accent transition-opacity", isFront ? "opacity-100" : "opacity-0")} />
          </span>
        </Link>
      </motion.div>
    </div>
  );
}

function CmdKButton() {
  const palette = useCommandPalette();
  if (!palette) return null;
  return (
    <button
      type="button"
      onClick={palette.open}
      className="hidden min-h-10 items-center gap-2 rounded-full px-3 text-[0.72rem] text-muted transition-colors hover:bg-sunken/70 hover:text-ink lg:inline-flex"
      aria-label="Open command palette"
      data-cursor="magnetic"
    >
      <Command className="size-3" aria-hidden="true" />
      <kbd className="text-[0.6rem]">⌘K</kbd>
    </button>
  );
}