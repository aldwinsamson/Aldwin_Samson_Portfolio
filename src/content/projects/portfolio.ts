import { defineProject } from "./_define";

export default defineProject({
  slug: "portfolio",
  title: "This Portfolio",
  fullTitle: "aldwinsamson.com",
  tagline: "My portfolio site: typed content, a 3D hero, and an AI assistant that answers questions about my work.",
  summary:
    "A solo-built React, TypeScript and Vite app where every page is generated from typed content files. It has an adaptive Three.js hero, light and dark themes, reduced-motion support, and an assistant that answers questions in English or Filipino.",
  categories: ["Software", "Web Development"],
  status: "Completed",
  period: "Oct 2026 – Nov 2026",
  role: "Designer & Developer (solo)",
  stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Three.js", "Motion", "Gemini API"],
  order: 4,
  
  cover: {
    src: "/images/projects/portfolio/cover.webp",
    alt: "The portfolio cover screen with a 3D hero and a search bar",
    kind: "authentic",
  },
  gallery: [
    {
      src: "/images/projects/portfolio/cover.webp",
      alt: "The portfolio cover screen with a 3D hero and a search bar",
      caption: "The portfolio cover screen with a 3D hero and a search bar",
      kind: "authentic",
    },
    {
      src: "/images/projects/portfolio/homepage.webp",
      alt: "The portfolio homepage with a list of projects",
      caption: "The portfolio homepage with a list of projects",
      kind: "authentic",
    },
  ],

  overview:
    "A personal portfolio engineered as a small product: content-driven, accessible and built to grow.",
  objective:
    "Show my work as case studies instead of a list of links, and let the site itself show how I build and run software.",
  problem:
    "Template portfolios look alike and say little about how software and hardware work fit together. I also wanted one place that stays accurate when my resume or CV changes.",

  contributions: [
    "Designed the visual system, the motion rules and the responsive layouts.",
    "Built an adaptive Three.js hero that picks a quality level from device signals, lowers it if the frame rate drops, and falls back to a still image.",
    "Moved all content into typed files (profile, experience, skills, one file per project) with checks that catch missing fields and copied text.",
    "Built the assistant: a local search engine over the site content, plus an AI layer for open-ended questions.",
    "Set up the hosting and deployment myself. That part is covered in its own project, Portfolio Infrastructure on AWS.",
  ],

  implementation: [
    "Rendering pauses when the hero is off-screen or the tab is hidden.",
    "Draft projects show only in development, so unfinished work never reaches the live site.",
    "The assistant answers only from published content. When it does not know something, it points to my email instead of guessing.",
    "The AI layer runs on a small serverless function that holds the API key, limits message length and request rate, and falls back to the local search if the service fails.",
  ],

  outcomes: [
    "Live at aldwinsamson.com.",
  ],

  links: {
    demo: { label: "View the portfolio", href: "https://aldwinsamson.com/" },
    repository: { label: "GitHub repository", href: "https://github.com/aldwinsamson/Aldwin_Samson_Portfolio" },
  },
});
