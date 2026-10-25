import { Briefcase, FlaskConical, GraduationCap } from "lucide-react";
import type { ExperienceEntry } from "@/content/types";
import { Reveal, Tag } from "@/components/ui";

const iconFor = (t: ExperienceEntry["type"]) => (t === "Education" ? GraduationCap : t === "Project" ? FlaskConical : Briefcase);

/** Full vertical timeline — extends automatically as entries are added. */
export function Timeline({ entries }: { entries: ExperienceEntry[] }) {
  return (
    <ol className="relative">
      <span aria-hidden="true" className="absolute bottom-2 left-[19px] top-2 w-px bg-gradient-to-b from-accent via-line-strong to-transparent md:left-[calc(30%+19px)]" />
      {entries.map((e, i) => {
        const Icon = iconFor(e.type);
        return (
          <Reveal as="li" key={e.id} delay={Math.min(i * 0.06, 0.3)} className="relative grid gap-4 pb-14 last:pb-0 md:grid-cols-[30%_1fr] md:gap-0">
            <div className="hidden pr-10 pt-2 text-right md:block">
              <p className="t-meta text-ink-soft">
                {e.start} — {e.end}
              </p>
              {e.location && <p className="t-meta mt-1 text-[0.66rem] text-muted">{e.location}</p>}
            </div>
            <div className="relative pl-14 md:pl-14">
              <span className="absolute left-0 top-0 inline-flex size-10 items-center justify-center rounded-xl border border-line bg-elev text-accent shadow-[var(--shadow-sm)] md:-left-0">
                <Icon className="size-[18px]" aria-hidden="true" />
              </span>
              <p className="t-meta text-muted md:hidden">
                {e.start} — {e.end}
                {e.location && ` · ${e.location}`}
              </p>
              <p className="t-eyebrow mt-1 text-accent md:mt-0">{e.type}</p>
              <h3 className="t-h3 mt-2">{e.role}</h3>
              <p className="mt-1 font-medium text-ink-soft">{e.organization}</p>
              <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">{e.summary}</p>
              {e.highlights.length > 0 && (
                <ul className="mt-4 max-w-2xl space-y-2.5">
                  {e.highlights.map((h) => (
                    <li key={h} className="relative pl-5 text-[0.95rem] leading-relaxed text-muted">
                      <span aria-hidden="true" className="absolute left-0 top-[0.7em] h-px w-2.5 bg-accent" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
              {e.skills.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5" aria-label="Skills applied">
                  {e.skills.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}

/** Compact rows for the homepage (wireframe: Year | Title | Description). */
export function ExperienceRows({ entries }: { entries: ExperienceEntry[] }) {
  return (
    <ul className="border-t border-line">
      {entries.map((e, i) => (
        <Reveal as="li" key={e.id} delay={i * 0.06} className="group grid gap-1.5 border-b border-line py-5 transition-colors sm:gap-2 sm:py-7 md:grid-cols-[180px_1.1fr_1.4fr] md:items-baseline md:gap-8">
          <p className="t-meta text-[0.62rem] text-muted sm:text-[0.72rem]">
            {e.start} — {e.end}
          </p>
          <div>
            <h3 className="font-display text-xl leading-tight transition-colors group-hover:text-accent sm:text-[1.65rem]">{e.role}</h3>
            <p className="mt-0.5 text-sm text-ink-soft sm:mt-1">{e.organization}</p>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted sm:mt-0 sm:text-[0.95rem]">{e.summary}</p>
        </Reveal>
      ))}
    </ul>
  );
}
