import { forwardRef, useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { ease, spring, stagger as staggerTokens } from "@/styles/motion";

/* ------------------------------------------------------------------ */
/* Safe external link — always noopener/noreferrer, opens in new tab   */
/* ------------------------------------------------------------------ */
export const ExternalLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
  function ExternalLink({ children, href, className, ...rest }, ref) {
    const safe = typeof href === "string" && /^(https:|mailto:)/.test(href) ? href : undefined;
    const isMail = safe?.startsWith("mailto:");
    return (
      <a
        ref={ref}
        href={safe}
        className={className}
        {...(isMail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        {...rest}
      >
        {children}
        {!isMail && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    );
  },
);

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */
type Variant = "primary" | "ghost" | "quiet";

const base =
  "group relative inline-flex min-h-12 items-center justify-center gap-2.5 overflow-hidden rounded-full px-6 text-[0.92rem] font-medium tracking-[0.01em] transition-colors duration-300 select-none";
const variants: Record<Variant, string> = {
  primary: "bg-ink text-bg hover:bg-accent hover:text-accent-ink",
  ghost: "border border-line-strong text-ink hover:border-ink",
  quiet: "px-0 text-ink-soft hover:text-ink underline-offset-[6px] hover:underline decoration-accent",
};

const MotionLink = motion.create(Link);

export function ButtonLink({
  to,
  children,
  variant = "primary",
  className,
  icon = true,
}: {
  to: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  icon?: boolean;
}) {
  return (
    <MotionLink
      to={to}
      whileTap={{ scale: 0.97 }}
      transition={spring.ui}
      data-cursor="magnetic"
      className={cn(base, variants[variant], className)}
    >
      <span>{children}</span>
      {icon && (
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      )}
    </MotionLink>
  );
}

export function ButtonAnchor({
  href,
  children,
  variant = "primary",
  className,
  icon,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; icon?: ReactNode }) {
  return (
    <motion.span whileTap={{ scale: 0.97 }} transition={spring.ui} className="inline-flex">
      <ExternalLink href={href} className={cn(base, variants[variant], className)} {...rest}>
        {icon}
        <span>{children}</span>
      </ExternalLink>
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Section header (wireframe: LABEL ··· "All projects ›")              */
/* ------------------------------------------------------------------ */
export function SectionHeader({
  index,
  label,
  title,
  link,
  as: Tag = "h2",
  id,
}: {
  index?: string;
  label: string;
  title: ReactNode;
  link?: { to: string; label: string };
  as?: "h1" | "h2";
  id?: string;
}) {
  return (
    <div className="mb-8 sm:mb-10 md:mb-14">
      <div className="flex items-center gap-3 text-muted sm:gap-4">
        {index && <span className="t-meta text-accent">{index}</span>}
        <span className="t-eyebrow text-[0.6rem] sm:text-[0.7rem]">{label}</span>
        <span className="rule flex-1" aria-hidden="true" />
        {link && (
          <Link
            to={link.to}
            className="t-meta group inline-flex items-center gap-1.5 text-[0.62rem] text-ink-soft transition-colors hover:text-accent sm:text-[0.72rem]"
          >
            <span className="hidden sm:inline">{link.label}</span>
            <span className="sm:hidden">View</span>
            <ArrowUpRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}
      </div>
      <Tag id={id} className={cn(Tag === "h1" ? "t-h1" : "t-h2", "mt-4 max-w-4xl text-balance sm:mt-6")}>
        {title}
      </Tag>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reveal — staggered on-scroll reveal; inert under reduced motion     */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 32,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** @deprecated kept for API compatibility — blur was removed for performance. */
  blur?: boolean;
  as?: "div" | "li" | "section" | "article";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Comp
      data-reveal
      className={className}
      // No filter: a leftover `filter: blur(0px)` promotes every revealed element to its own GPU layer for good.
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, ease: ease.lux, delay }}
    >
      {children}
    </Comp>
  );
}

export const staggerDelay = (i: number) => Math.min(i * staggerTokens.base, 0.5);

/* ------------------------------------------------------------------ */
/* SmartImage — lazy, fades in, aspect-stable, graceful fallback        */
/* ------------------------------------------------------------------ */
export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  ratio,
  eager = false,
  position = "50% 50%",
  label,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  ratio?: string;
  eager?: boolean;
  position?: string;
  label?: string;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  return (
    <div
      className={cn("relative overflow-hidden bg-sunken", className)}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {state !== "loaded" && (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            state === "loading" && "animate-pulse",
          )}
          style={{ background: "linear-gradient(135deg, var(--bg-sunken), var(--bg-elev))" }}
        >
          {state === "error" && <span className="t-meta text-muted">Image unavailable</span>}
        </div>
      )}
      {state !== "error" && (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          style={{ objectPosition: position }}
          className={cn(
            "h-full w-full object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-lux)]",
            state === "loaded" ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
      {label && (
        <span className="t-meta absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[0.62rem] text-white/85 backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small atoms                                                         */
/* ------------------------------------------------------------------ */
export function Tag({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "tech" | "accent" }) {
  return (
    <span
      className={cn(
        "t-meta inline-flex items-center rounded-full border px-2.5 py-1 text-[0.66rem]",
        tone === "default" && "border-line text-ink-soft",
        tone === "tech" && "border-tech/30 text-tech",
        tone === "accent" && "border-accent/40 text-accent",
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ status }: { status: string }) {
  const tone = status === "Completed" ? "bg-emerald-500" : status === "In progress" ? "bg-amber-500" : "bg-sky-500";
  return (
    <span className="t-meta inline-flex items-center gap-2 text-ink-soft">
      <span className={cn("size-1.5 rounded-full", tone)} aria-hidden="true" />
      {status}
    </span>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12", className)}>{children}</div>;
}

/** Per-page metadata — updates the existing head tags from index.html (no duplicates). */
export function Seo({ title, description }: { title?: string; description?: string }) {
  useEffect(() => {
    const full = title ? siteConfig.titleTemplate(title) : `${siteConfig.title} — Cloud & DevOps Engineer · Embedded Systems`;
    document.title = full;
    const set = (selector: string, value: string) => document.querySelector(selector)?.setAttribute("content", value);
    set('meta[property="og:title"]', full);
    if (description) {
      set('meta[name="description"]', description);
      set('meta[property="og:description"]', description);
    }
  }, [title, description]);
  return null;
}
