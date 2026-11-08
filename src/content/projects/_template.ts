import { defineProject } from "./_define";

export default defineProject({
  // REQUIRED
  slug: "my-project", 
  draft: true, // while true the project shows only in `npm run dev` (with a DRAFT badge). DELETE this line to publish it.
  title: "My Project",
  tagline: "One short line that sells the project.",
  summary: "Two or three sentences describing what it is and what it does.",
  categories: ["Cloud & DevOps"], 
  status: "Completed", 
  period: "Jan 2026 — Mar 2026",
  role: "Your role on the project",
  stack: ["AWS", "Terraform", "GitLab CI/CD"],

  // OPTIONAL (delete what you don't need)
  order: 10, 
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
    // repository: { label: "GitHub", href: "https://github.com/your-name/my-project" }, // https only, public only
    // demo: { label: "Live demo", href: "https://example.com" },
  },
  // linkNote: "Source code is private.",
});
