import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useCanHover, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

/**
 * Custom cursor — a dual dot+ring that morphs on interactive elements.
 * Only renders on fine pointer devices (mouse/trackpad).
 *
 * IMPORTANT: The container must be pointer-events:none and NOT create
 * a blocking stacking context. No mix-blend-mode on the container.
 */

type CursorMode = "default" | "hover" | "text" | "magnetic" | "hidden";

export function CustomCursor() {
  const canHover = useCanHover();
  const reduce = usePrefersReducedMotion();
  const [mode, setMode] = useState<CursorMode>("default");
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);

  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const dotX = useSpring(cx, { stiffness: 1200, damping: 60, mass: 0.1 });
  const dotY = useSpring(cy, { stiffness: 1200, damping: 60, mass: 0.1 });
  const ringX = useSpring(cx, { stiffness: 160, damping: 22, mass: 0.4 });
  const ringY = useSpring(cy, { stiffness: 160, damping: 22, mass: 0.4 });

  const magTarget = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const onMove = useCallback(
    (e: MouseEvent) => {
      setVisible(true);
      let x = e.clientX;
      let y = e.clientY;

      if (magTarget.current) {
        const { x: mx, y: my, w, h } = magTarget.current;
        const pull = 0.35;
        x += (mx + w / 2 - x) * pull;
        y += (my + h / 2 - y) * pull;
      }

      cx.set(x);
      cy.set(y);
    },
    [cx, cy],
  );

  useEffect(() => {
    if (!canHover || reduce) return;

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest?.("[data-cursor]") as HTMLElement | null;
      if (!el) {
        setMode("default");
        setLabel("");
        magTarget.current = null;
        return;
      }
      const kind = el.dataset.cursor ?? "hover";
      if (kind === "text") {
        setMode("text");
        setLabel(el.dataset.cursorText ?? "View");
      } else if (kind === "magnetic") {
        setMode("magnetic");
        setLabel("");
        const rect = el.getBoundingClientRect();
        magTarget.current = { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
      } else if (kind === "hidden") {
        setMode("hidden");
      } else {
        setMode("hover");
        setLabel("");
        magTarget.current = null;
      }
    };

    const onOut = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest?.("[data-cursor]");
      if (el) {
        setMode("default");
        setLabel("");
        magTarget.current = null;
      }
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [canHover, reduce, onMove]);

  if (!canHover || reduce) return null;

  const ringSize = mode === "hover" || mode === "magnetic" ? 64 : mode === "text" ? 100 : 40;
  const dotHidden = mode === "text";

  return (
    <>
      {/* Dot — fast follower */}
      <motion.div
        aria-hidden="true"
        style={{ x: dotX, y: dotY, pointerEvents: "none" }}
        animate={{
          opacity: visible && !dotHidden ? 1 : 0,
          scale: mode === "hidden" ? 0 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="fixed -left-1 -top-1 z-[200] size-2 rounded-full bg-white mix-blend-difference"
      />
      {/* Ring — soft follower */}
      <motion.div
        aria-hidden="true"
        style={{
          x: ringX,
          y: ringY,
          pointerEvents: "none",
          marginLeft: -(ringSize / 2),
          marginTop: -(ringSize / 2),
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          opacity: visible && mode !== "hidden" ? 1 : 0,
          borderRadius: mode === "text" ? 16 : ringSize,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="fixed z-[200] flex items-center justify-center border border-white/70 mix-blend-difference"
      >
        {mode === "text" && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-medium uppercase tracking-wider text-white"
          >
            {label}
          </motion.span>
        )}
      </motion.div>
    </>
  );
}
