import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { MediaItem } from "@/content/types";
import { responsiveSrcSet } from "@/utils/image";
import { swipeDirection, wrapIndex } from "@/utils/lightbox";

interface LightboxProps {
  items: MediaItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const FOCUSABLE = "button, [href], [tabindex]:not([tabindex='-1'])";

export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const open = index !== null;
  const count = items.length;

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      root.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => trigger?.focus?.();
  }, [open]);

  useEffect(() => {
    if (index === null) return;
    const current = index;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight" && count > 1) {
        onNavigate(wrapIndex(current + 1, count));
      } else if (e.key === "ArrowLeft" && count > 1) {
        onNavigate(wrapIndex(current - 1, count));
      } else if (e.key === "Tab") {
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (!nodes || nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, count, onClose, onNavigate]);

  useEffect(() => {
    if (index === null || count < 2) return;
    for (const offset of [-1, 1]) {
      const img = new Image();
      img.src = items[wrapIndex(index + offset, count)].src;
    }
  }, [index, count, items]);

  if (typeof document === "undefined") return null;

  const item = index !== null ? items[index] : null;

  return createPortal(
    <AnimatePresence>
      {item && index !== null && (
        <motion.div
          key="lightbox"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Image viewer, ${index + 1} of ${count}`}
          data-lenis-prevent
          className="fixed inset-0 z-[240] flex flex-col bg-black/[0.97] text-white backdrop-blur-md"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ touchAction: "pan-y pinch-zoom" }}
          onClick={() => {
            if (swiped.current) {
              swiped.current = false;
              return;
            }
            onClose();
          }}
          onPointerDown={(e) => {
            swiped.current = false;
            touchStart.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const start = touchStart.current;
            touchStart.current = null;
            if (!start || count < 2) return;
            const dir = swipeDirection(e.clientX - start.x, e.clientY - start.y);
            if (dir !== 0) {
              swiped.current = true;
              onNavigate(wrapIndex(index + dir, count));
            }
          }}
        >
          <div className="flex items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
            <p className="t-meta text-white/70" aria-hidden="true">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close image viewer"
              className="grid size-11 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16">
            {count > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(wrapIndex(index - 1, count));
                }}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20 sm:left-4"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
            )}

            <motion.img
              key={item.src}
              src={item.src}
              srcSet={responsiveSrcSet(item.src)}
              sizes="100vw"
              alt={item.alt}
              draggable={false}
              onClick={(e) => e.stopPropagation()}
              initial={reduce ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="max-h-[calc(100dvh-10.5rem)] max-w-full select-none rounded-lg object-contain"
            />

            {count > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(wrapIndex(index + 1, count));
                }}
                aria-label="Next image"
                className="absolute right-2 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-4"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            )}
          </div>

          <p
            onClick={(e) => e.stopPropagation()}
            className="mx-auto min-h-[4.5rem] max-w-2xl px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 text-center text-sm leading-relaxed text-white/80"
          >
            {item.caption ?? item.alt}
            {item.credit && <span className="text-white/50">{` · ${item.credit}`}</span>}
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
