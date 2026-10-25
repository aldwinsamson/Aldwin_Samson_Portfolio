import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

/**
 * TextScramble — letters decode from random chars into the real text.
 * Plays ONCE on scroll into view. No hover replay (that was annoying).
 * Falls back to plain text under reduced motion.
 */

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function TextScramble({
  text,
  className,
  as: Tag = "span",
  speed = 30,
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  speed?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const hasPlayed = useRef(false);

  const scramble = useCallback(() => {
    if (reduce || hasPlayed.current) return;
    hasPlayed.current = true;
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < iteration) return text[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join(""),
      );
      iteration += 1 / 3;
      if (iteration >= text.length) {
        clearInterval(interval);
        setDisplay(text);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, reduce]);

  useEffect(() => {
    if (inView && !hasPlayed.current) scramble();
  }, [inView, scramble]);

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {reduce ? text : display}
    </Tag>
  );
}
