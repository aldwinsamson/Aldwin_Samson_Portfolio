import { defineProject } from "./_define";

/**
 * Wedding invitation — written from what you've told me about the build (no couple names, no date).
 * Please check the lines marked REVIEW. Add real screenshots later:
 * public/images/projects/wedding-invitation/cover.webp + a `cover: { … kind: "authentic" }` block.
 */
export default defineProject({
  slug: "wedding-invitation",
  title: "Wedding Invitation",
  fullTitle: "Custom wedding invitation website",
  tagline: "A cinematic, password-protected wedding invitation website with a prenup slideshow.",
  summary:
    "A custom React and Vite wedding invitation site with a luxury dark theme, cinematic animations, a password gate, a prenup photo slideshow with lightbox, a music toggle, light/dark mode and a mobile-optimised layout.",
  categories: ["Web Development", "Software"],
  status: "Completed",
  period: "2026", // REVIEW: add the months, e.g. "Jun 2026 — Aug 2026"
  role: "Designer & Developer", // REVIEW
  stack: ["React", "Vite"], // REVIEW: add TypeScript / animation libraries if you used them
  order: 5,

  overview:
    "A full invitation website built for a couple's wedding — designed around a luxury palette of midnight navy, French blue, soft gold and warm ivory.",
  contributions: [
    "Designed and built the whole site from wireframes and reference sites, through several redesigns to the final look.",
    "Added cinematic animations, a password gate for guests, a prenup slideshow with a dark lightbox and a music toggle.",
    "Made it work in light and dark mode and optimised the layout for phones.",
  ],
});
