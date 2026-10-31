import { useEffect, useRef } from "react";
import { useCanHover, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

/**
 * Minimal cursor: one small gold dot that grows into a ring over links and buttons.
 * Why this and not springs: the position is written straight to the element's transform in the
 * mousemove handler (no react state, no easing), so it can't trail behind the real pointer.
 * The grow/shrink is a css transition on the inner element only, which the gpu handles.
 */
export function CustomCursor() {
  const canHover = useCanHover();
  const reduce = usePrefersReducedMotion();
  const posRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canHover || reduce) return;
    const pos = posRef.current;
    const dot = dotRef.current;
    if (!pos || !dot) return;

    const onMove = (e: PointerEvent) => {
      pos.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
      pos.style.opacity = "1";
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const field = !!t?.closest?.("input,textarea,select,[contenteditable='true']");
      const link = !!t?.closest?.("a,button,[role='button'],summary,[data-cursor]");
      pos.dataset.field = field ? "1" : "0";
      dot.dataset.active = link ? "1" : "0";
    };
    const onLeave = () => {
      pos.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [canHover, reduce]);

  if (!canHover || reduce) return null;

  return (
    <div ref={posRef} aria-hidden="true" className="site-cursor pointer-events-none fixed left-0 top-0 z-[200] opacity-0">
      <div ref={dotRef} className="site-cursor-dot" />
    </div>
  );
}
