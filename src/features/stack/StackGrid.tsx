import type { SkillGroup } from "@/content/types";
import { skillIcons } from "@/components/Icons";
import { Reveal } from "@/components/ui";
import { cn } from "@/utils/cn";

/** Skill groups in a hairline grid. `compact` = homepage summary (names only). */
export function StackGrid({ groups, compact = false }: { groups: SkillGroup[]; compact?: boolean }) {
  return (
    <div className="grid overflow-hidden rounded-2xl border border-line bg-line [gap:1px] sm:rounded-[24px] sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g, i) => {
        const Icon = skillIcons[g.icon];
        return (
          <Reveal
            key={g.id}
            delay={Math.min(i * 0.05, 0.3)}
            className={cn("group relative bg-bg p-5 transition-colors duration-500 hover:bg-elev sm:p-7 lg:p-8", compact && "p-4 sm:p-6 lg:p-7")}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex size-11 items-center justify-center rounded-xl border border-line text-accent transition-colors group-hover:border-accent/50">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="t-meta text-muted">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="mt-4 font-display text-xl leading-tight sm:mt-6 sm:text-[1.6rem]">{g.title}</h3>
            {!compact && <p className="mt-2 text-sm leading-relaxed text-muted">{g.description}</p>}
            <ul className={cn("mt-5 flex flex-wrap gap-1.5", !compact && "flex-col gap-0 divide-y divide-line border-t border-line")}>
              {g.items.map((it) =>
                compact ? (
                  <li key={it.name} className="t-meta rounded-full border border-line px-2.5 py-1 text-[0.66rem] text-ink-soft">
                    {it.name}
                  </li>
                ) : (
                  <li key={it.name} className="flex items-baseline justify-between gap-4 py-2.5">
                    <span className="text-[0.95rem] text-ink">{it.name}</span>
                    {it.note && <span className="t-meta text-right text-[0.64rem] text-muted">{it.note}</span>}
                  </li>
                ),
              )}
            </ul>
            <span aria-hidden="true" className="absolute inset-x-8 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-accent to-tech transition-transform duration-700 group-hover:scale-x-100" />
          </Reveal>
        );
      })}
    </div>
  );
}
