import { describe, expect, it } from "vitest";
import { filterProjects, getProject, projects } from "@/content/projects";

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

describe("project content integrity", () => {
  it("has unique slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("only uses https links for resources", () => {
    for (const p of projects) {
      for (const link of [p.links?.repository, p.links?.demo]) {
        if (link) expect(link.href.startsWith("https://")).toBe(true);
      }
    }
  });

  it("resolves projects by slug", () => {
    expect(getProject("kidverse")?.title).toBe("KidVerse");
    expect(getProject("does-not-exist")).toBeUndefined();
  });
});
