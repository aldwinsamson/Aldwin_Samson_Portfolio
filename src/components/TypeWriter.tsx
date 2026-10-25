import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

/**
 * TypeWriter — types out text character-by-character with a blinking cursor.
 * Used for dynamic headline effects. Cycles through multiple phrases.
 */
export function TypeWriter({
  phrases,
  className,
  typingSpeed = 70,
  deletingSpeed = 40,
  pauseDuration = 2500,
}: {
  phrases: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!inView || reduce) return;

    const current = phrases[phraseIdx];
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting && text.length < current.length) {
      timer = setTimeout(() => setText(current.slice(0, text.length + 1)), typingSpeed);
    } else if (!isDeleting && text.length === current.length) {
      timer = setTimeout(() => setIsDeleting(true), pauseDuration);
    } else if (isDeleting && text.length > 0) {
      timer = setTimeout(() => setText(current.slice(0, text.length - 1)), deletingSpeed);
    } else if (isDeleting && text.length === 0) {
      setIsDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, phraseIdx, phrases, inView, reduce, typingSpeed, deletingSpeed, pauseDuration]);

  if (reduce) return <span ref={ref} className={className}>{phrases[0]}</span>;

  return (
    <span ref={ref} className={className}>
      {text}
      <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-accent" style={{ height: "1em" }} />
    </span>
  );
}
