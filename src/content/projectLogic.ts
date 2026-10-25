import type { Project, ProjectCategory, ProjectInput } from "./types";

/**
 * Pure project helpers (no file-system magic here, so they are easy to unit-test).
 * The auto-discovery of project files lives in `./projects/index.ts`.
 */

export const ALL_CATEGORIES: ProjectCategory[] = [
  "Cloud & DevOps",
  "Software",
  "Web Development",
  "Embedded Systems",
  "Hardware",
  "AI",
];

export const DEFAULT_ORDER = 100;
/** The homepage wheel never shows more than this many projects (the rest live on /projects). */
export const MAX_RING = 10;

/** Fills in defaults so components never have to null-check lists. */
export function resolveProject(input: ProjectInput): Project {
  return {
    ...input,
    featured: input.featured ?? false,
    order: input.order ?? DEFAULT_ORDER,
    gallery: input.gallery ?? [],
    overview: input.overview ?? input.summary,
    contributions: input.contributions ?? [],
    implementation: input.implementation ?? [],
    outcomes: input.outcomes ?? [],
  };
}

/** Lower `order` first; ties are broken alphabetically by slug so the result is always predictable. */
export function sortProjects<T extends { order: number; slug: string }>(list: readonly T[]): T[] {
  return [...list].sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

/** Categories that actually have at least one project (so empty filter chips never appear). */
export function usedCategories(list: readonly Project[]): ProjectCategory[] {
  return ALL_CATEGORIES.filter((c) => list.some((p) => p.categories.includes(c)));
}

/**
 * Picks the projects for the homepage wheel. Everything fits up to `max`; beyond that, featured
 * projects win the slots and the original order is preserved.
 */
export function selectRingProjects<T extends { featured: boolean }>(list: readonly T[], max = MAX_RING): T[] {
  if (list.length <= max) return [...list];
  const picked = new Set<T>();
  for (const p of list) if (p.featured && picked.size < max) picked.add(p);
  for (const p of list) if (picked.size < max) picked.add(p);
  return list.filter((p) => picked.has(p));
}

/** Pure filter used by the Projects page (unit-tested in tests/). */
export function filterProjects(list: Project[], query: string, category: ProjectCategory | "All"): Project[] {
  const q = query.trim().toLowerCase();
  return list.filter((p) => {
    const inCategory = category === "All" || p.categories.includes(category);
    if (!inCategory) return false;
    if (!q) return true;
    const haystack = [p.title, p.fullTitle, p.tagline, p.summary, p.role, ...p.stack, ...p.categories]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return q.split(/\s+/).every((term) => haystack.includes(term));
  });
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STATUSES = ["Completed", "In progress", "Concept"];

/** Returns human-readable problems with a project file (empty array = all good). */
export function validateProject(p: ProjectInput): string[] {
  const problems: string[] = [];
  const need = (key: keyof ProjectInput) => {
    const v = p[key];
    if (typeof v !== "string" || !v.trim()) problems.push(`"${key}" is required`);
  };
  (["slug", "title", "tagline", "summary", "period", "role"] as const).forEach(need);
  if (p.slug && !SLUG.test(p.slug)) problems.push(`slug "${p.slug}" must be lowercase letters, numbers and dashes only`);
  if (!STATUSES.includes(p.status)) problems.push(`status must be one of: ${STATUSES.join(", ")}`);
  if (!Array.isArray(p.categories) || p.categories.length === 0) problems.push("add at least one category");
  else for (const c of p.categories) if (!ALL_CATEGORIES.includes(c)) problems.push(`unknown category "${c}"`);
  if (!Array.isArray(p.stack) || p.stack.length === 0) problems.push("add at least one item to stack");
  for (const link of [p.links?.repository, p.links?.demo]) {
    if (link && !link.href.startsWith("https://")) problems.push(`link "${link.label}" must start with https://`);
  }
  for (const m of [p.cover, ...(p.gallery ?? [])]) {
    if (m && (!m.src || !m.alt)) problems.push("every image needs both src and alt text");
  }
  return problems;
}
