/** Typed content models. Add fields here first, then use them in components. */

export type ProjectCategory = "Software" | "Embedded Systems" | "Hardware" | "AI" | "Web Development";

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

export interface Project {
  slug: string;
  title: string;
  /** Optional expanded name (e.g. acronyms). */
  fullTitle?: string;
  tagline: string;
  summary: string;
  categories: ProjectCategory[];
  /** Used for the Software / Hardware tabs on the homepage. */
  domain: "software" | "hardware";
  status: ProjectStatus;
  period: string;
  role: string;
  featured: boolean;
  cover: MediaItem;
  gallery: MediaItem[];
  overview: string;
  objective: string;
  problem: string;
  contributions: string[];
  architecture?: { label: string; detail: string }[];
  stack: string[];
  implementation: string[];
  challenges?: string[];
  outcomes: string[];
  awards?: string[];
  /** Only add links that are valid AND approved for publication. */
  links?: { repository?: ProjectLink; demo?: ProjectLink };
  /** Shown when a resource exists but cannot be published (e.g. private repo). */
  linkNote?: string;
}

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
