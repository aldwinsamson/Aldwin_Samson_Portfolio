import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ease } from "@/styles/motion";

/**
 * WordReveal — each word slides up from below with a stagger.
 * Elegant, cinematic, and plays only once. Used for key headings.
 */
export function WordReveal({
  text,
  className,
  as: Tag = "span",
  stagger = 0.04,
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3";
  stagger?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) {
    return <Tag ref={ref as never} className={className}>{text}</Tag>;
  }

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : {}}
            transition={{
              duration: 0.8,
              ease: ease.cinematic,
              delay: delay + i * stagger,
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && "\u00A0"}
        </span>
      ))}
    </Tag>
  );
}
