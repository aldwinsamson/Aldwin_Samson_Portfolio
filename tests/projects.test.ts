import { describe, expect, it } from "vitest";
import { getProject, projectCategories, projects } from "@/content/projects";
import {
  ALL_CATEGORIES,
  MAX_RING,
  filterProjects,
  findCopiedText,
  isVisible,
  resolveProject,
  selectRingProjects,
  sortProjects,
  usedCategories,
  validateProject,
} from "@/content/projectLogic";
import type { ProjectInput } from "@/content/types";

const minimal = (over: Partial<ProjectInput> = {}): ProjectInput => ({
  slug: "demo",
  title: "Demo",
  tagline: "t",
  summary: "s",
  categories: ["Software"],
  status: "Completed",
  period: "2026",
  role: "Dev",
  stack: ["TS"],
  ...over,
});

describe("filterProjects", () => {
  it("returns everything for All with an empty query", () => {
    expect(filterProjects(projects, "", "All")).toHaveLength(projects.length);
  });

  it("filters by category", () => {
    const hw = filterProjects(projects, "", "Hardware");
    expect(hw.length).toBeGreaterThan(0);
    expect(hw.every((p) => p.categories.includes("Hardware"))).toBe(true);
  });

  it("matches multi-term queries across title and stack (case-insensitive)", () => {
    const res = filterProjects(projects, "esp32 python", "All");
    expect(res.map((p) => p.slug)).toContain("ligtas");
  });

  it("returns an empty list when nothing matches (empty state)", () => {
    expect(filterProjects(projects, "quantum-blockchain-toaster", "All")).toEqual([]);
  });
});

describe("project files (src/content/projects/*.ts)", () => {
  const files = import.meta.glob<{ default: ProjectInput }>(["../src/content/projects/*.ts", "!../src/content/projects/index.ts", "!../src/content/projects/_*.ts"], {
    eager: true,
  });

  it("discovers every project file automatically", () => {
    expect(Object.keys(files).length).toBeGreaterThan(0);
    expect(projects).toHaveLength(Object.keys(files).length);
  });

  it("names every file after its slug", () => {
    for (const [path, mod] of Object.entries(files)) {
      expect(path.endsWith(`/${mod.default.slug}.ts`), `${path} should be named ${mod.default.slug}.ts`).toBe(true);
    }
  });

  it("passes validation (required fields, categories, https links, image alt text)", () => {
    for (const [path, mod] of Object.entries(files)) {
      expect(validateProject(mod.default), path).toEqual([]);
    }
  });

  it("never publishes two projects with the same text (copy-paste mistake)", () => {
    const published = Object.values(files).map((m) => m.default).filter((p) => !p.draft);
    expect(findCopiedText(published)).toEqual([]);
  });

  it("has unique slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves projects by slug", () => {
    expect(getProject("kidverse")?.title).toBe("KidVerse");
    expect(getProject("does-not-exist")).toBeUndefined();
  });

  it("only offers filter chips for categories that have projects", () => {
    expect(projectCategories).toEqual(usedCategories(projects));
    for (const c of projectCategories) expect(projects.some((p) => p.categories.includes(c))).toBe(true);
  });
});

describe("resolveProject / sortProjects", () => {
  it("fills defaults so a minimal project works everywhere", () => {
    const p = resolveProject(minimal());
    expect(p.gallery).toEqual([]);
    expect(p.contributions).toEqual([]);
    expect(p.implementation).toEqual([]);
    expect(p.outcomes).toEqual([]);
    expect(p.featured).toBe(false);
    expect(p.overview).toBe("s"); // falls back to the summary
    expect(p.cover).toBeUndefined();
  });

  it("orders by `order`, then alphabetically by slug", () => {
    const list = [
      resolveProject(minimal({ slug: "b" })),
      resolveProject(minimal({ slug: "a" })),
      resolveProject(minimal({ slug: "z", order: 1 })),
      resolveProject(minimal({ slug: "c", order: 50 })),
    ];
    expect(sortProjects(list).map((p) => p.slug)).toEqual(["z", "c", "a", "b"]);
  });
});

describe("selectRingProjects (homepage wheel)", () => {
  const make = (n: number, featuredIdx: number[] = []) =>
    Array.from({ length: n }, (_, i) => resolveProject(minimal({ slug: `p${i}`, featured: featuredIdx.includes(i) })));

  it("shows every project when there are few — one slot each, no repeats", () => {
    const ring = selectRingProjects(make(3));
    expect(ring.map((p) => p.slug)).toEqual(["p0", "p1", "p2"]);
  });

  it("caps the wheel and lets featured projects win the slots, keeping order", () => {
    const ring = selectRingProjects(make(14, [12, 13]), MAX_RING);
    expect(ring).toHaveLength(MAX_RING);
    expect(ring.map((p) => p.slug)).toContain("p12");
    expect(ring.map((p) => p.slug)).toContain("p13");
    const idx = ring.map((p) => Number(p.slug.slice(1)));
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });
});

describe("validateProject", () => {
  it("accepts a minimal project", () => {
    expect(validateProject(minimal())).toEqual([]);
  });

  it("explains mistakes in plain language", () => {
    const problems = validateProject(minimal({ slug: "Bad Slug!", categories: [], stack: [], links: { repository: { label: "GH", href: "http://x" } } }));
    expect(problems.join(" | ")).toMatch(/slug/);
    expect(problems.join(" | ")).toMatch(/category/);
    expect(problems.join(" | ")).toMatch(/stack/);
    expect(problems.join(" | ")).toMatch(/https/);
  });

  it("rejects unknown categories", () => {
    expect(validateProject(minimal({ categories: ["Nope" as never] })).join()).toMatch(/unknown category/);
    expect(ALL_CATEGORIES.length).toBeGreaterThan(0);
  });
});

describe("drafts and copy-paste detection", () => {
  it("hides drafts in production but shows them in development", () => {
    expect(isVisible({ draft: true }, true)).toBe(false);
    expect(isVisible({ draft: true }, false)).toBe(true);
    expect(isVisible({}, true)).toBe(true);
    expect(isVisible({ draft: false }, true)).toBe(true);
  });

  it("flags two projects that share a summary or tagline", () => {
    const warnings = findCopiedText([
      { slug: "a", summary: "Same text.", tagline: "One" },
      { slug: "b", summary: "same text. ", tagline: "Two" },
      { slug: "c", summary: "Different", tagline: "Three" },
    ]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('"b"');
    expect(warnings[0]).toContain('"a"');
  });

  it("is quiet when every project is unique", () => {
    expect(findCopiedText([{ slug: "a", summary: "x", tagline: "1" }, { slug: "b", summary: "y", tagline: "2" }])).toEqual([]);
  });
});
