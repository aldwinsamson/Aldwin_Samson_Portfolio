import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ease } from "@/styles/motion";
import { cn } from "@/utils/cn";

const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const randomChar = () => POOL[Math.floor(Math.random() * POOL.length)];

/**
 * Chrome lettering that scrambles and then lands letter by letter (a nod to the reference reel).
 * Decorative only — the real accessible name lives in the parent <h1>.
 */
export function HeroWord({
  text,
  reduced,
  startDelay = 0.2,
  className,
}: {
  text: string;
  reduced: boolean;
  startDelay?: number;
  className?: string;
}) {
  const letters = text.toUpperCase().split("");
  const [shown, setShown] = useState<string[]>(() => (reduced ? letters : letters.map(() => " ")));

  useEffect(() => {
    if (reduced) {
      setShown(letters);
      return;
    }
    const t0 = performance.now() + startDelay * 1000;
    const settleAt = letters.map((_, i) => 650 + i * 150);
    const id = window.setInterval(() => {
      const el = performance.now() - t0;
      if (el < 0) return;
      setShown(letters.map((ch, i) => (el >= settleAt[i] ? ch : randomChar())));
      if (el >= settleAt[settleAt.length - 1]) window.clearInterval(id);
    }, 55);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, reduced, startDelay]);

  return (
    <span aria-hidden="true" className={cn("flex justify-center", className)}>
      {letters.map((_, i) => (
        <motion.span
          key={i}
          className="text-chrome inline-block"
          style={{ transformPerspective: 800 }}
          initial={reduced ? false : { y: "-0.35em", rotateX: -80, opacity: 0 }}
          animate={{ y: "0em", rotateX: 0, opacity: 1 }}
          transition={{ duration: 1.1, ease: ease.cinematic, delay: startDelay + 0.1 + i * 0.09 }}
        >
          {shown[i]}
        </motion.span>
      ))}
    </span>
  );
}
