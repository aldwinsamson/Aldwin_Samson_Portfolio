#!/usr/bin/env node
/**
 * Creates a new project file from the template with a VALID slug — the usual mistake (typing the
 * display name, e.g. "SumoBot", as the slug) can't happen.
 *
 *   npm run new:project -- my-project "My Project"
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../src/content/projects");
const [slugArg, ...titleParts] = process.argv.slice(2);

const toSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
if (!slugArg) {
  console.error('Usage: npm run new:project -- <slug> ["Display Title"]\nExample: npm run new:project -- aws-three-tier "AWS Three-Tier App"');
  process.exit(1);
}
const slug = toSlug(slugArg);
const title = titleParts.join(" ").trim() || slugArg.trim();
const target = join(dir, `${slug}.ts`);
if (existsSync(target)) {
  console.error(`✗ ${slug}.ts already exists — open it and edit it instead.`);
  process.exit(1);
}

let text = readFileSync(join(dir, "_template.ts"), "utf8").replace(/\r\n/g, "\n");
text = text
  .replaceAll("my-project", slug)
  .replace('title: "My Project"', `title: ${JSON.stringify(title)}`);
writeFileSync(target, text);
console.log(`✓ Created src/content/projects/${slug}.ts${slug !== slugArg ? `   (slug cleaned up from "${slugArg}")` : ""}`);
console.log("  1. Fill it in (every TODO), 2. run `npm run dev` to see it (draft projects show a DRAFT badge),");
console.log("  3. delete the `draft: true` line when it is ready for the live site.");
