/** Typed content models. Add fields here first, then use them in components. */

export type ProjectCategory = "Software" | "Embedded Systems" | "Hardware" | "AI" | "Web Development" | "Cloud & DevOps";

export type ProjectStatus = "Completed" | "In progress" | "Concept";

export interface MediaItem {
  src: string;
  alt: string;
  caption?: string;
  kind: "authentic" | "representative";
  credit?: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectInput {
  slug: string;
  title: string;
  fullTitle?: string;
  tagline: string;
  summary: string;
  categories: ProjectCategory[];
  status: ProjectStatus;
  period: string;
  role: string;
  stack: string[];

  draft?: boolean;
  order?: number;
  featured?: boolean;
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
  links?: { repository?: ProjectLink; demo?: ProjectLink };
  linkNote?: string;
}

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
