import { defineProject } from "./_define";

/**
 * DRAFT — this file used to be a copy of another project's text, so the details are blanked out
 * rather than showing wrong information. Replace every TODO with the real facts, then DELETE the
 * `draft: true` line to publish it (see README.md in this folder).
 */
export default defineProject({
  slug: "sumobot", // must equal the file name — lowercase-with-dashes (the display name goes in `title`)
  draft: true,
  title: "SumoBot",
  fullTitle: "Sumobot: A Remote-Controlled Flood Detection Vessel", // REVIEW: kept from your file — is this right for SumoBot?
  tagline: "TODO — one short line that sells this project.",
  summary: "TODO — two or three sentences about what SumoBot is and what it does.",
  categories: ["Embedded Systems", "Hardware"], // REVIEW: guessed from the title — change if wrong
  status: "Completed", // "Completed" | "In progress" | "Concept"
  period: "TODO — e.g. Jan 2026 — Mar 2026",
  role: "TODO — your role",
  stack: ["TODO"],
  order: 10,
});
