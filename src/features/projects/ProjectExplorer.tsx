import { useId, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { RotateCcw, Search, X } from "lucide-react";
import { filterProjects, projectCategories, projects } from "@/content/projects";
import type { ProjectCategory } from "@/content/types";
import { cn } from "@/utils/cn";
import { ease, spring } from "@/styles/motion";
import { ProjectCard } from "./ProjectCard";

type Filter = ProjectCategory | "All";

/** Searchable, filterable project collection. State lives in the URL so filters are shareable. */
export function ProjectExplorer() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const rawCat = params.get("category");
  const category: Filter = (projectCategories as string[]).includes(rawCat ?? "") ? (rawCat as ProjectCategory) : "All";
  const searchId = useId();

  const results = useMemo(() => filterProjects(projects, query, category), [query, category]);

  const update = (next: { q?: string; category?: Filter }) => {
    const p = new URLSearchParams(params);
    if (next.q !== undefined) (next.q ? p.set("q", next.q) : p.delete("q"));
    if (next.category !== undefined) (next.category === "All" ? p.delete("category") : p.set("category", next.category));
    setParams(p, { replace: true });
  };
  const reset = () => setParams(new URLSearchParams(), { replace: true });
  const count = (c: Filter) => (c === "All" ? projects.length : projects.filter((p) => p.categories.includes(c)).length);

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <LayoutGroup id="filters">
          <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
            {(["All", ...projectCategories] as Filter[]).map((c) => {
              const active = c === category;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ category: c })}
                  className={cn(
                    "relative inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition-colors",
                    active ? "border-transparent text-bg" : "border-line text-ink-soft hover:border-line-strong hover:text-ink",
                  )}
                >
                  {active && <motion.span layoutId="filter-pill" transition={spring.layout} className="absolute inset-0 rounded-full bg-ink" />}
                  <span className="relative">{c}</span>
                  <span className={cn("t-meta relative text-[0.62rem]", active ? "text-bg/70" : "text-muted")}>{count(c)}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        <div className="relative w-full lg:w-80">
          <label htmlFor={searchId} className="sr-only">
            Search projects
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id={searchId}
            type="search"
            value={query}
            maxLength={80}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search by name, tech or role…"
            className="min-h-12 w-full rounded-full border border-line bg-elev pl-11 pr-11 text-sm text-ink placeholder:text-muted focus:border-tech focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => update({ q: "" })}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <p className="t-meta mt-6 text-muted" role="status" aria-live="polite">
        {results.length} {results.length === 1 ? "project" : "projects"}
        {category !== "All" && ` in ${category}`}
        {query && ` matching “${query}”`}
      </p>

      <motion.ul layout className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((p, i) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: ease.lux, delay: Math.min(i * 0.05, 0.3) }}
            >
              <ProjectCard project={p} index={projects.indexOf(p)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {results.length === 0 && (
        <div className="surface mt-2 flex flex-col items-center rounded-[22px] px-6 py-16 text-center">
          <p className="t-h3">Nothing here — yet.</p>
          <p className="mt-3 max-w-md text-sm text-muted">
            No projects match the current filters. New work is added regularly; try another category or clear the search.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-sm hover:border-ink"
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
