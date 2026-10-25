import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion, useVelocity, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/content/projects";
import { SmartImage, Tag } from "./ui";

/**
 * HorizontalGallery — projects scroll horizontally as you scroll vertically.
 * A cinematic, high-end effect. The section takes up vertical space but the cards
 * move sideways. Falls back to a simple stacked list under reduced motion.
 */
export function HorizontalGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const featured = projects.filter((p) => p.featured);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0.1, 0.9], reduce ? ["0%", "0%"] : ["5%", "-65%"]);

  if (reduce) {
  const velocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 });
  const skew = useTransform(smoothVelocity, [-1, 1], [3, -3]);

  if (reduce) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {featured.map((p) => (
          <Link key={p.slug} to={`/projects/${p.slug}`} className="group surface overflow-hidden rounded-[22px]">
            <SmartImage src={p.cover.src} alt={p.cover.alt} ratio="16 / 10" imgClassName="group-hover:scale-[1.03]" />
            <div className="p-6">
              <h3 className="t-h3">{p.title}</h3>
              <p className="mt-2 text-sm text-muted">{p.tagline}</p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div style={{ x }} className="flex h-full items-center gap-8 px-8 will-change-transform">
          {featured.map((p, i) => (
            <Link
              key={p.slug}
              to={`/projects/${p.slug}`}
              data-cursor="text"
              data-cursor-text="View"
              className="group relative h-[70vh] w-[clamp(320px,42vw,620px)] shrink-0 overflow-hidden rounded-[28px]"
            >
              <motion.div style={{ skewX: skew }} className="absolute inset-0">
              <SmartImage
                src={p.cover.src}
                alt={p.cover.alt}
                className="absolute inset-0"
                imgClassName="transition-transform duration-700 group-hover:scale-[1.06]"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/90" />
              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
                <div className="flex flex-wrap gap-1.5">
                  {p.categories.slice(0, 3).map((c) => (
                    <Tag key={c} tone="tech">{c}</Tag>
                  ))}
                </div>
                <h3 className="mt-4 font-display text-4xl italic text-white sm:text-5xl">{p.title}</h3>
                {p.fullTitle && (
                  <p className="mt-2 text-sm text-white/60">{p.fullTitle}</p>
                )}
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">{p.tagline}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors group-hover:text-[#d6ba86]">
                  Read case study
                  <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </div>
              </div>
              </motion.div>
              {/* Index */}
              <span className="t-meta absolute right-6 top-6 text-white/40 text-[0.7rem]">
                {String(i + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")}
              </span>
            </Link>
          ))}

          {/* End card */}
          <Link
            to="/projects"
            data-cursor="magnetic"
            className="group flex h-[70vh] w-[clamp(220px,25vw,340px)] shrink-0 flex-col items-center justify-center rounded-[28px] border border-dashed border-line-strong transition-colors hover:border-accent"
          >
            <span className="font-display text-5xl italic text-accent">→</span>
            <span className="mt-4 text-sm text-muted transition-colors group-hover:text-ink">All projects</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
}
