/**
 * Builds server/chat/knowledge.generated.txt from the same content files that render the site,
 * so the AI assistant never knows something the site doesn't say.
 *
 *   npm run build:knowledge          writes the file
 *   npm run check:knowledge          exits 1 if the file is out of date (use it in CI)
 *
 * It is run with vite-node (not plain node) because the content uses Vite features such as import.meta.glob.
 * Phone numbers and street addresses are not in the content files, so they cannot end up here.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { profile, socials } from "../src/content/profile";
import { certifications, education, experience, honors } from "../src/content/experience";
import { skillGroups } from "../src/content/skills";
import { projects } from "../src/content/projects";

const OUT = resolve(process.cwd(), "server/chat/knowledge.generated.txt");
const list = (items: readonly string[] | undefined, prefix = "- ") => (items ?? []).map((i) => `${prefix}${i}`).join("\n");

function section(title: string, body: string) {
  return `\n=== ${title} ===\n${body.trim()}\n`;
}

function build(): string {
  const parts: string[] = [];

  parts.push(
    section(
      "ABOUT JOHN",
      [
        `Full name: ${profile.name}. On this site he is called John; close friends call him ${profile.shortName}.`,
        `Based in: ${profile.location}.`,
        `Email: ${profile.email}.`,
        `Availability: ${profile.availability}.`,
        `Headline: ${profile.hero.lead}`,
        "",
        ...profile.about.paragraphs,
        "",
        "Focus areas:",
        list(profile.disciplines.map((d) => `${d.title}: ${d.detail}`)),
        "",
        "Links:",
        list(socials.map((s) => `${s.label}: ${s.href}`)),
      ].join("\n"),
    ),
  );

  parts.push(
    section(
      "EXPERIENCE (newest first)",
      experience
        .map((e) =>
          [
            `${e.role} at ${e.organization} (${e.type}), ${e.start} to ${e.end}${e.location ? `, ${e.location}` : ""}.`,
            e.summary,
            list(e.highlights),
            e.skills.length ? `Skills used: ${e.skills.join(", ")}.` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        )
        .join("\n\n"),
    ),
  );

  parts.push(
    section(
      "EDUCATION",
      education.map((e) => [`${e.role}, ${e.organization}, ${e.start} to ${e.end}. ${e.summary}`, list(e.highlights)].filter(Boolean).join("\n")).join("\n\n"),
    ),
  );

  parts.push(section("CERTIFICATES AND TRAINING", list(certifications.map((c) => `${c.title}: ${c.detail}`))));
  parts.push(section("HONORS AND AWARDS", list(honors.map((h) => `${h.title}: ${h.detail}`))));

  parts.push(
    section(
      "SKILLS",
      skillGroups.map((g) => `${g.title} (${g.description})\n${list(g.items.map((i) => (i.note ? `${i.name}: ${i.note}` : i.name)))}`).join("\n\n"),
    ),
  );

  const published = projects.filter((p) => !p.draft);
  parts.push(
    section(
      `PROJECTS (${published.length})`,
      published
        .map((p) => {
          const lines = [
            `PROJECT: ${p.title}${p.fullTitle && p.fullTitle !== p.title ? ` (${p.fullTitle})` : ""}`,
            `Page: /projects/${p.slug}`,
            `Tagline: ${p.tagline}`,
            `Status: ${p.status}. Period: ${p.period}. John's role: ${p.role}.`,
            `Categories: ${p.categories.join(", ")}.`,
            `Stack: ${p.stack.join(", ")}.`,
            `Summary: ${p.summary}`,
          ];
          const add = (label: string, v?: string) => v && lines.push(`${label}: ${v}`);
          add("Overview", p.overview);
          add("Objective", p.objective);
          add("Problem", p.problem);
          const block = (label: string, items?: readonly string[]) => items?.length && lines.push(`${label}:\n${list(items)}`);
          block("What John did", p.contributions);
          if (p.architecture?.length) lines.push(`How it is built:\n${list(p.architecture.map((a) => `${a.label}: ${a.detail}`))}`);
          block("Implementation notes", p.implementation);
          block("Challenges and limits", p.challenges);
          block("Results", p.outcomes);
          block("Awards", p.awards);
          if (p.links?.demo) lines.push(`Live link: ${p.links.demo.href}`);
          if (p.links?.repository) lines.push(`Code: ${p.links.repository.href}`);
          if (p.linkNote && !/src\/|`|\bREVIEW\b|TODO/.test(p.linkNote)) lines.push(`Note: ${p.linkNote}`);
          return lines.join("\n");
        })
        .join("\n\n---\n\n"),
    ),
  );

  parts.push(
    section(
      "NOT ON THE SITE (say it is not listed, and suggest emailing John)",
      [
        "- Phone number, home address, salary expectations and rates.",
        "- A downloadable CV: John sends the latest version by email on request.",
        "- Professional certifications. The only certificate is the AWS Fundamentals course certificate; the other certificate entries are courses and seminars.",
        "- Production experience beyond what the experience and project sections state.",
      ].join("\n"),
    ),
  );

  return `# Knowledge for the portfolio assistant. GENERATED by scripts/build-knowledge.ts. Do not edit by hand.\n${parts.join("")}`;
}

const text = build();
const check = process.argv.includes("--check");

if (check) {
  const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (current !== text) {
    console.error("server/chat/knowledge.generated.txt is out of date. Run: npm run build:knowledge");
    process.exit(1);
  }
  console.log("knowledge file is up to date");
} else {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, text, "utf8");
  console.log(`Wrote server/chat/knowledge.generated.txt (${text.length} characters, about ${Math.round(text.length / 4)} tokens)`);
}
