/** Typed content models. Add fields here first, then use them in components. */

export type ProjectCategory = "Software" | "Embedded Systems" | "Hardware" | "AI" | "Web Development" | "Cloud & DevOps";

export type ProjectStatus = "Completed" | "In progress" | "Concept";

export interface MediaItem {
  src: string;
  alt: string;
  caption?: string;
  /** "authentic" = real screenshot/photo of the project. "representative" = stock/concept imagery. */
  kind: "authentic" | "representative";
  credit?: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

/**
 * What you write in `src/content/projects/<slug>.ts`.
 * Only the fields without a `?` are required — everything else is optional and the site simply
 * hides the sections you leave out.
 */
export interface ProjectInput {
  /** URL id, lowercase-with-dashes. Must match the file name, e.g. "my-project" → /projects/my-project */
  slug: string;
  title: string;
  /** Optional expanded name (e.g. acronyms). */
  fullTitle?: string;
  /** One short line — shown on cards and the homepage wheel. */
  tagline: string;
  /** Two or three sentences — used for search engines and cards. */
  summary: string;
  categories: ProjectCategory[];
  status: ProjectStatus;
  period: string;
  role: string;
  /** Main technologies (shown as tags). */
  stack: string[];

  /**
   * Work in progress. While `draft: true` the project is visible ONLY in `npm run dev` (with a DRAFT badge)
   * and is left out of the live site, the sitemap and the assistant. Delete the line to publish it.
   */
  draft?: boolean;
  /** Lower number = shown first on the wheel and the projects page. Leave out to go after the numbered ones. */
  order?: number;
  /** If you ever have more projects than fit on the homepage wheel, featured ones are shown first. */
  featured?: boolean;
  /** Cover image. Optional — a tasteful placeholder is shown until you add one. */
  cover?: MediaItem;
  gallery?: MediaItem[];

  overview?: string;
  objective?: string;
  problem?: string;
  contributions?: string[];
  architecture?: { label: string; detail: string }[];
  implementation?: string[];
  challenges?: string[];
  outcomes?: string[];
  awards?: string[];
  /** Only add links that are valid AND approved for publication. */
  links?: { repository?: ProjectLink; demo?: ProjectLink };
  /** Shown when a resource exists but cannot be published (e.g. private repo). */
  linkNote?: string;
}

/** A project after defaults are filled in — this is what the pages and components receive. */
export type Project = ProjectInput & {
  featured: boolean;
  order: number;
  gallery: MediaItem[];
  overview: string;
  contributions: string[];
  implementation: string[];
  outcomes: string[];
};

export interface ExperienceEntry {
  id: string;
  organization: string;
  role: string;
  type: "Internship" | "Project" | "Education" | "Role";
  location?: string;
  start: string;
  end: string;
  summary: string;
  highlights: string[];
  skills: string[];
}

export interface SkillGroup {
  id: string;
  title: string;
  description: string;
  icon: "code" | "layers" | "database" | "cpu" | "circuit" | "terminal" | "spark";
  items: { name: string; note?: string }[];
}

export interface SocialLink {
  id: "github" | "linkedin" | "email";
  label: string;
  href: string;
  handle: string;
}
