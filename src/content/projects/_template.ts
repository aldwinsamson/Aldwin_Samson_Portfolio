import { defineProject } from "./_define";

/**
 * HOW TO ADD A PROJECT
 *  1. Copy this file and rename the copy to your slug, e.g.  aws-three-tier.ts   (keep it in this folder)
 *  2. Change the values below. Delete any optional field you don't need — the page hides empty sections.
 *  3. Save. That's it: it now appears on the homepage wheel, the Projects page, its own
 *     /projects/<slug> page, prev/next links and the ⌘K search.
 *
 * Images: put files in  public/images/projects/<slug>/  and refer to them as
 *  "/images/projects/<slug>/cover.webp"  (no image yet? just remove `cover` — a placeholder is shown).
 *
 * This file starts with "_" so the site ignores it. Don't rename it.
 */
export default defineProject({
  // ───────────── REQUIRED ─────────────
  slug: "my-project", // lowercase-with-dashes; must match the file name (my-project.ts)
  title: "My Project",
  tagline: "One short line that sells the project.",
  summary: "Two or three sentences describing what it is and what it does.",
  categories: ["Cloud & DevOps"], // Cloud & DevOps · Software · Web Development · Embedded Systems · Hardware · AI
  status: "Completed", // "Completed" | "In progress" | "Concept"
  period: "Jan 2026 — Mar 2026",
  role: "Your role on the project",
  stack: ["AWS", "Terraform", "GitLab CI/CD"],

  // ───────────── OPTIONAL (delete what you don't need) ─────────────
  order: 10, // lower = earlier. Leave out to place it after numbered projects.
  featured: false, // only matters if you ever have more than 10 projects (featured ones get the wheel slots)
  fullTitle: "Longer descriptive name",
  cover: {
    src: "/images/projects/my-project/cover.webp",
    alt: "Describe the image for screen readers",
    kind: "authentic", // "authentic" = your own photo/screenshot · "representative" = stock/concept image
  },
  gallery: [
    // { src: "/images/projects/my-project/diagram.webp", alt: "Architecture diagram", caption: "Optional caption", kind: "authentic" },
  ],
  overview: "A short paragraph shown big at the top of the case study. (Defaults to the summary.)",
  objective: "What were you trying to achieve?",
  problem: "What problem did it solve?",
  contributions: ["What you personally built or led.", "Another contribution."],
  architecture: [
    // { label: "Network", detail: "Public / private subnets across two AZs." },
  ],
  implementation: ["How it works, in a few bullet points."],
  challenges: ["What was hard, and how you handled it."],
  outcomes: ["What was delivered — keep it factual, no invented numbers."],
  awards: [],
  links: {
    // repository: { label: "GitHub", href: "https://github.com/aldwinsamson/my-project" }, // https only, public only
    // demo: { label: "Live demo", href: "https://example.com" },
  },
  // linkNote: "Source code is private.",
});
