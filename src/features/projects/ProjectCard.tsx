import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/content/types";
import { StatusDot, Tag } from "@/components/ui";
import { ProjectCover } from "./ProjectCover";
import { useCanHover } from "@/hooks/useMediaQuery";

/** Project card — 3D tilt + cinematic image scale on hover. */
export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const canHover = useCanHover();
  const reduce = useReducedMotion();
  const tilt = canHover && !reduce;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, (v) => -v * 5), { stiffness: 180, damping: 22 });
  const ry = useSpring(useTransform(mx, (v) => v * 5), { stiffness: 180, damping: 22 });
  const glowX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);

  return (
    <motion.div
      style={tilt ? { rotateX: rx, rotateY: ry, transformPerspective: 1400 } : undefined}
      className="h-full"
    >
      <Link
        ref={ref}
        to={`/projects/${project.slug}`}
        onPointerMove={(e) => {
          if (!tilt || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => { mx.set(0); my.set(0); }}
        data-cursor="text"
        data-cursor-text="View"
        className="group relative surface flex h-full flex-col overflow-hidden rounded-[22px] transition-[border-color,box-shadow] duration-500 hover:border-accent/40 hover:shadow-[0_0_40px_-12px_var(--accent)]"
      >
        {/* Moving glow on hover */}
        {tilt && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 rounded-[22px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: useTransform(
                [glowX, glowY],
                ([x, y]) => `radial-gradient(400px circle at ${x} ${y}, color-mix(in oklab, var(--accent) 12%, transparent), transparent 65%)`,
              ),
            }}
          />
        )}

        <div className="relative overflow-hidden">
          <ProjectCover
            project={project}
            ratio="16 / 10"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            imgClassName="transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-[1.06]"
            label={project.cover?.kind === "representative" ? "Representative image" : undefined}
          />
          {/* Cinematic gradient over image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="t-meta absolute left-4 top-4 rounded-full bg-black/55 px-2.5 py-1 text-[0.62rem] text-white/90 backdrop-blur-sm">
            {String(index + 1).padStart(2, "0")}
          </span>
          {project.draft && (
            <span className="t-meta absolute right-4 top-4 rounded-full bg-accent px-2.5 py-1 text-[0.62rem] text-black">
              Draft · dev only
            </span>
          )}
        </div>

        <div className="relative flex flex-1 flex-col p-5 sm:p-6 lg:p-7">
          <div className="flex items-center justify-between gap-3">
            <StatusDot status={project.status} />
            <span className="t-meta text-muted">{project.period}</span>
          </div>
          <h3 className="t-h3 mt-4 flex items-start justify-between gap-4">
            <span className="transition-colors duration-300 group-hover:text-accent">{project.title}</span>
            <ArrowUpRight
              aria-hidden="true"
              className="mt-1 size-5 shrink-0 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
            />
          </h3>
          {project.fullTitle && <p className="mt-1 text-sm text-muted">{project.fullTitle}</p>}
          <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:mt-4 sm:text-[0.95rem]">{project.tagline}</p>
          <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
            {project.categories.map((c) => (
              <Tag key={c} tone="tech">{c}</Tag>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
