import { defineProject } from "./_define";

export default defineProject({
  slug: "fluentpro",
  title: "FluentPro",
  fullTitle: "FluentPro: a 365-day English learning platform",
  tagline: "A 365-day English plan with daily progress tracking and an AI coach.",
  summary:
    "A web app built for personal English practice: a structured one-hour-a-day plan with streaks, vocabulary flashcards, a writing journal and an AI coach called Coach Alex. Progress is saved to a database every day.",
  categories: ["Web Development", "Software", "AI"],
  status: "Completed",
  period: "May 2026 – Jun 2026",
  role: "Solo designer & full-stack developer",
  stack: ["React", "TypeScript", "Vite", "MongoDB Atlas", "Groq API", "Vercel", "Render"],
  order: 5,

  cover: {
    src: "/public/images/projects/fluentpro/homepage.webp",
    alt: "The FluentPro homepage",
    kind: "authentic",
  },
  gallery: [
    {
      src: "/public/images/projects/fluentpro/homepage.webp",
      alt: "The FluentPro homepage with the 365-day plan and streaks",
      caption: "The FluentPro homepage with the 365-day plan and streaks",
      kind: "authentic",
    },
    {
      src: "/public/images/projects/fluentpro/task.webp",
      alt: "The FluentPro task view",
      caption: "The FluentPro task view",
      kind: "authentic",
    },
  ],

  overview:
    "I made FluentPro to follow my own plan for improving workplace English: one hour a day, starting from beginner level. It began as a checklist and grew into a full app.",
  objective: "Keep a long study plan on track with a daily routine, visible progress and feedback on my writing.",

  contributions: [
    "Designed and built the 365-day plan, the streak system with pause challenges, vocabulary flashcards and the writing journal.",
    "Added Coach Alex, an AI coach that sticks to the learner's current task and acts as a guide instead of a general chatbot. It runs on the Groq API, which I picked because its free tier fits a personal project.",
    "Built the backend on Render and saved each day's progress in MongoDB Atlas, so streaks and finished days stay the same across devices.",
    "Deployed the frontend on Vercel.",
  ],

  implementation: [
    "The app grew over several rounds of changes: more lesson content, bug fixes, and a rebuilt speaking and writing journal.",
  ],

  outcomes: ["Finished and deployed in June 2026. It is a personal tool, so I am its only user."],

  links: {
    demo: { label: "Open FluentPro", href: "https://fluentpro-english-learning-platform.vercel.app/" },
  },
  linkNote: "Source code is private.",
});
