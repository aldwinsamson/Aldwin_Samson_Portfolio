import type { ProjectInput } from "../types";

/** Wrap every project in this — it gives you autocomplete and tells you immediately if a field is wrong. */
export const defineProject = (project: ProjectInput): ProjectInput => project;

/** Pexels stock-photo helper (only used for temporary "representative" images). */
export const px = (id: number, w = 1400, h = 900) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;
