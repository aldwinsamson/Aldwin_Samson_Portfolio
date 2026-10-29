import { useMemo, useState } from "react";
import { filterProjects, projectCategories, projects } from "@/content/projects";
import type { ProjectCategory } from "@/content/types";
import { cn } from "@/utils/cn";
import { ProjectCard } from "./ProjectCard";

type Filter = ProjectCategory | "All";

/** search box + category chips + card grid for the /projects page. all the filtering lives in projectLogic.ts. */
export function ProjectExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Filter>("All");

  const results = useMemo(() => filterProjects(projects, query, category), [query, category]);
  const chips: Filter[] = ["All", ...projectCategories];
  const filtering = query.trim() !== "" || category !== "All";

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={cn(
                "t-meta rounded-full border px-3.5 py-1.5 text-[0.7rem] transition-colors",
                category === c ? "border-accent/60 text-accent" : "border-line text-ink-soft hover:border-line-strong",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <label className="block w-full lg:max-w-xs">
          <span className="sr-only">Search projects</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, tech or role"
            className="w-full rounded-full border border-line bg-transparent px-4 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent/60"
          />
        </label>
      </div>

      <p className="t-meta mb-6 text-muted" aria-live="polite">
        {results.length} {results.length === 1 ? "project" : "projects"}
        {filtering ? " match" : ""}
      </p>

      {results.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="surface rounded-[22px] p-10 text-center">
          <p className="text-ink-soft">Nothing matches that search.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            className="t-meta mt-4 text-accent underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
