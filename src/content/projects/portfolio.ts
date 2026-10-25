import { defineProject, px } from "./_define";

export default defineProject({
  slug: "portfolio",
  title: "This Portfolio",
  fullTitle: "Interactive engineering portfolio",
  tagline: "A typed, content-driven React site with an adaptive WebGL hero.",
  summary:
    "The site you're on: React, TypeScript and Three.js with adaptive 3D quality, reduced-motion support, light/dark themes and a local, offline FAQ guide.",
  categories: ["Software", "Web Development"],
  status: "In progress",
  period: "2026",
  role: "Designer & Developer",
  featured: false,
order: 3,
  cover: {
    src: px(34212896),
    alt: "Representative image: a workspace with monitors showing code",
    kind: "representative",
    credit: "Jakub Zerdzicki / Pexels",
  },
  gallery: [],
  overview: "A personal portfolio engineered as a small product: content-driven, accessible and built to grow.",
  objective: "Present projects as case studies while demonstrating front-end engineering and design discipline.",
  problem: "Generic templates don't communicate how software and hardware work fits together.",
  contributions: [
    "Designed the visual system, motion tokens and responsive layouts.",
    "Built an adaptive Three.js particle hero with capability detection and static fallbacks.",
    "Structured all content as typed data so new work can be added without touching layouts.",
  ],
  stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Three.js", "Motion"],
  implementation: [
    "Quality tiers chosen from device signals, then lowered further if frame rate drops.",
    "Rendering pauses when the hero is off-screen or the tab is hidden.",
  ],
  outcomes: ["Built as a typed, content-driven site with tested pure-logic modules; deployment details will be documented once it is live."],
});
