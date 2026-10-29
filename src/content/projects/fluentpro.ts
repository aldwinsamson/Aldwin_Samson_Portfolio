import { defineProject } from "./_define";

/**
 * FluentPro — written from what you've told me about the app. Please check the lines marked REVIEW.
 * No screenshots yet, so a placeholder cover is shown. To add one: save it as
 * public/images/projects/fluentpro/cover.webp and add a `cover: { src, alt, kind: "authentic" }` block.
 */
export default defineProject({
  slug: "fluentpro",
  title: "FluentPro",
  fullTitle: "FluentPro — 365-day English learning platform",
  tagline: "A 365-day English learning platform for business professionals, with an AI tutor.",
  summary:
    "A structured, one-hour-a-day English fluency programme for workplace and business English, built as a deployable web app with streaks, vocabulary flashcards, a writing journal and an AI chatbot tutor called “Coach Alex”.",
  categories: ["Web Development", "Software", "AI"],
  status: "In progress", // REVIEW: change to "Completed" when you consider it finished
  period: "2026", // REVIEW: add your real start/end months, e.g. "Aug 2026 — Present"
  role: "Designer & Full-Stack Developer", // REVIEW
  stack: ["React", "TypeScript", "Vite", "MongoDB Atlas", "GROQ API", "Vercel", "Render"],
  order: 4,

  overview:
    "FluentPro started as my own structured English fluency plan — beginner level, workplace focus, one hour a day — and grew into a full web app that other learners can use too.",
  contributions: [
    "Designed and built the learning experience: a 365-day plan, a streak system with pause challenges, vocabulary flashcards and a writing journal.",
    "Integrated an AI chatbot tutor (“Coach Alex”) that gives learners feedback through the GROQ API.",
    "Deployed the frontend on Vercel and the backend on Render, with MongoDB Atlas keeping progress in sync across devices.",
  ],
  implementation: [
    "Grew iteratively over many sessions — adding features, expanding the lesson content and fixing bugs before settling on the final design.",
    "Rebuilt the speaking and writing journal experience as the app matured.",
  ],
  linkNote: "Add a live link under `links: { demo: … }` when you are ready to share the app publicly.",
});
