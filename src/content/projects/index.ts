import type { Project, ProjectInput } from "../types";
import { resolveProject, sortProjects, usedCategories, validateProject } from "../projectLogic";

/**
 * PROJECT REGISTRY — you never edit this file.
 * Every `*.ts` file in this folder (except ones starting with "_" and this index) is a project.
 * Add a file → it automatically appears on the homepage wheel, the Projects page, its own
 * /projects/<slug> page, prev/next links and the ⌘K search. See README.md in this folder.
 */
const modules = import.meta.glob<{ default: ProjectInput }>(["./*.ts", "!./index.ts", "!./_*.ts"], { eager: true });

const seen = new Set<string>();
const loaded: Project[] = [];
for (const [file, mod] of Object.entries(modules)) {
  const input = mod.default;
  if (!input) {
    if (import.meta.env.DEV) console.warn(`[projects] ${file} has no default export — use "export default defineProject({...})".`);
    continue;
  }
  if (import.meta.env.DEV) {
    for (const problem of validateProject(input)) console.warn(`[projects] ${file}: ${problem}`);
    if (file !== `./${input.slug}.ts`) console.warn(`[projects] ${file}: file name should match the slug "${input.slug}".`);
  }
  if (seen.has(input.slug)) {
    if (import.meta.env.DEV) console.warn(`[projects] ${file}: duplicate slug "${input.slug}" ignored.`);
    continue;
  }
  seen.add(input.slug);
  loaded.push(resolveProject(input));
}

/** Every project, in display order. */
export const projects: Project[] = sortProjects(loaded);

/** Filter chips: only categories that have at least one project. */
export const projectCategories = usedCategories(projects);

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export { filterProjects } from "../projectLogic";
