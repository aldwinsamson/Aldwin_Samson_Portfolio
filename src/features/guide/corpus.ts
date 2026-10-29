import { profile, socials } from "@/content/profile";
import { certifications, education, experience, honors } from "@/content/experience";
import { skillGroups } from "@/content/skills";
import { projects as allProjects } from "@/content/projects";
import { knowledgeBase } from "@/content/knowledge";
import type { Project } from "@/content/types";
import { glossary } from "./glossary";

/** The assistant only knows PUBLISHED projects — drafts (`draft: true`) stay private, in dev and on the live site. */
const projects = allProjects.filter((p) => !p.draft);

/**
 * Everything the assistant can talk about, as small self-contained "facts".
 * They are generated from the site's own content files, so the assistant is always in sync:
 * edit your CV data or add a project file and the assistant knows about it.
 */

export interface GuideLink {
  label: string;
  to: string;
  /** Opens outside the app (https://… or mailto:). */
  external?: boolean;
}

export interface Fact {
  id: string;
  /** overview = headline of a topic · detail = one specific point · list = roll-up · curated = hand-written · glossary = definition */
  kind: "overview" | "detail" | "list" | "curated" | "glossary";
  /** Facts of the same topic share a group (used for "tell me more"). */
  group: string;
  title: string;
  /** Standalone answer text. May contain "\n• " bullet lines. */
  text: string;
  /** Short version without context, used when this fact is shown as a bullet. */
  short?: string;
  keywords?: string[];
  links?: GuideLink[];
  /** Search weight (1 = normal). */
  boost?: number;
  /** A question that leads here — offered as a follow-up chip. */
  ask?: string;
  /** The same question in Filipino (used when the visitor writes in Tagalog). */
  askTl?: string;
  /** (glossary) words used to find how John actually used the technology. */
  evidence?: string[];
}

const link = (label: string, to: string): GuideLink => ({ label, to });
const bullets = (items: string[]) => items.map((i) => `• ${i}`).join("\n");
const sentence = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);

function projectFacts(p: Project): Fact[] {
  const group = `proj:${p.slug}`;
  const to = `/projects/${p.slug}`;
  const open = link(`Open the ${p.title} case study`, to);
  const label = p.fullTitle ? `${p.title} (${p.fullTitle})` : p.title;
  const base: Fact[] = [
    {
      id: group,
      kind: "overview",
      group,
      title: p.title,
      text: `${label} — ${sentence(p.summary)} Role: ${p.role}. Status: ${p.status} (${p.period}). Built with ${p.stack.join(", ")}.`,
      keywords: [p.slug, p.title, p.fullTitle ?? "", ...p.categories, ...p.stack, "project", "built", "made"],
      links: [open],
      boost: 1.15,
      ask: `Tell me about ${p.title}`,
      askTl: `Ikuwento mo ang ${p.title}`,
    },
  ];
  const detail = (suffix: string, title: string, text: string, short?: string, extraKeywords: string[] = []): Fact => ({
    id: `${group}:${suffix}`,
    kind: "detail",
    group,
    title: `${p.title} — ${title}`,
    text: `${p.title} — ${text}`,
    short: short ?? text,
    keywords: [p.slug, p.title, ...p.stack, ...extraKeywords],
    links: [open],
  });
  if (p.objective) base.push(detail("objective", "goal", `Goal: ${sentence(p.objective)}`, undefined, ["objective", "goal", "purpose", "aim"]));
  if (p.problem) base.push(detail("problem", "problem it solves", `The problem it solves: ${sentence(p.problem)}`, undefined, ["problem", "why", "solve"]));
  p.contributions.forEach((c, i) => base.push(detail(`c${i}`, "his contribution", `What John did: ${sentence(c)}`, sentence(c), ["contribution", "role", "did", "responsibility", "responsibilities"])));
  (p.architecture ?? []).forEach((a, i) => base.push(detail(`a${i}`, a.label, `${a.label}: ${sentence(a.detail)}`, `${a.label}: ${sentence(a.detail)}`, ["architecture", "design", "system", "components"])));
  p.implementation.forEach((c, i) => base.push(detail(`i${i}`, "implementation", `How it works: ${sentence(c)}`, sentence(c), ["implementation", "how", "works", "technical"])));
  (p.challenges ?? []).forEach((c, i) => base.push(detail(`ch${i}`, "challenges", `A challenge: ${sentence(c)}`, sentence(c), ["challenge", "difficult", "hard", "difficulty", "obstacle"])));
  p.outcomes.forEach((c, i) => base.push(detail(`o${i}`, "outcome", `Outcome: ${sentence(c)}`, sentence(c), ["outcome", "result", "delivered", "impact", "achieved"])));
  if (p.awards && p.awards.length) {
    base.push(detail("awards", "awards", `Awards: ${p.awards.join(", ")}.`, undefined, ["award", "awards", "won", "recognition", "achievement"]));
  }
  const ext: GuideLink[] = [];
  if (p.links?.repository) ext.push({ label: p.links.repository.label, to: p.links.repository.href, external: true });
  if (p.links?.demo) ext.push({ label: p.links.demo.label, to: p.links.demo.href, external: true });
  if (ext.length) {
    base.push({
      ...detail("links", "links", `Where to see it: ${ext.map((l) => l.label).join(" and ")}.`, undefined, ["link", "links", "github", "repository", "repo", "demo", "source", "code", "live", "website", "url"]),
      links: [open, ...ext],
    });
  } else if (p.linkNote) {
    base.push(detail("links", "source code", sentence(p.linkNote), undefined, ["link", "links", "github", "repository", "repo", "demo", "source", "code", "live", "url", "public"]));
  }
  return base;
}

export function buildCorpus(): Fact[] {
  const facts: Fact[] = [];
  const github = socials.find((s) => s.id === "github");
  const linkedin = socials.find((s) => s.id === "linkedin");

  /* ------------------------------ About ------------------------------ */
  profile.about.paragraphs.forEach((p, i) =>
    facts.push({
      id: `about:p${i}`,
      kind: "detail",
      group: "about",
      title: "About John — in his own words",
      text: `In his own words: “${p}”`,
      short: p,
      keywords: ["about", "background", "story", "journey", "bio"],
      links: [link("Read the about page", "/about")],
    }),
  );
  profile.disciplines.forEach((d, i) =>
    facts.push({
      id: `focus:${i}`,
      kind: "detail",
      group: "focus",
      title: d.title,
      text: `${d.title}: ${d.detail}`,
      short: `${d.title}: ${d.detail}`,
      keywords: ["focus", "specialize", "specialise", "specialization", "discipline", "expertise", "area", "strength", "speciality"],
      links: [link("Read the about page", "/about")],
    }),
  );
  facts.push({
    id: "focus-list",
    kind: "list",
    group: "focus",
    title: "What John specializes in",
    text: `John's main focus areas:\n${bullets(profile.disciplines.map((d) => `${d.title} — ${d.detail}`))}`,
    keywords: ["focus", "specialize", "specialise", "specialization", "discipline", "expertise", "areas", "strengths", "does", "speciality", "field", "domain"],
    links: [link("Read the about page", "/about")],
    boost: 1.2,
    ask: "What does John specialize in?",
    askTl: "Ano ang specialty ni John?",
  });
  profile.about.values.forEach((v, i) =>
    facts.push({
      id: `value:${i}`,
      kind: "detail",
      group: "values",
      title: v.title,
      text: `One of his working principles — ${v.title}: ${v.detail}`,
      short: `${v.title}: ${v.detail}`,
      keywords: ["values", "principles", "philosophy", "approach", "style", "mindset", "believe", "culture", "ethic"],
    }),
  );

  /* ---------------------- Availability · location · contact ---------------------- */
  facts.push({
    id: "availability",
    kind: "overview",
    group: "availability",
    title: "Availability and roles",
    text: `${sentence(profile.availability)} He is based in ${profile.location}. The best way to discuss an opportunity is to contact him directly.`,
    keywords: ["available", "availability", "open", "hire", "hiring", "looking", "role", "roles", "job", "position", "opportunity", "opportunities", "employment", "work", "vacancy", "recruit", "recruiter", "employed", "seeking", "career"],
    links: [link("Get in touch", "/contact")],
    boost: 1.3,
    ask: "Is John open to work?",
    askTl: "Bukas ba si John sa trabaho?",
  });
  facts.push({
    id: "location",
    kind: "overview",
    group: "availability",
    title: "Location",
    text: `John is based in ${profile.location}.`,
    keywords: ["location", "based", "live", "lives", "city", "country", "located", "philippines", "manila", "where", "timezone", "address"],
    boost: 1.2,
  });
  facts.push({
    id: "contact",
    kind: "overview",
    group: "contact",
    title: "How to contact John",
    text: `You can email John at ${profile.email}, or find him on LinkedIn (${linkedin?.handle ?? "John Aldwin Samson"}) and GitHub (${github?.handle ?? "@aldwinsamson"}). The contact page has one-click Gmail compose and copy-email actions.`,
    keywords: ["contact", "email", "mail", "reach", "message", "touch", "connect", "talk", "linkedin", "github", "social", "socials", "write", "inquiry", "enquiry"],
    links: [
      link("Go to the contact page", "/contact"),
      { label: "Email John", to: `mailto:${profile.email}`, external: true },
    ],
    boost: 1.3,
    ask: "How can I contact John?",
    askTl: "Paano ko siya makokontak?",
  });
  if (github) {
    facts.push({
      id: "github",
      kind: "detail",
      group: "contact",
      title: "GitHub",
      text: `John's GitHub is ${github.handle}.`,
      keywords: ["github", "code", "repository", "repositories", "repos", "open", "source"],
      links: [{ label: "Open GitHub", to: github.href, external: true }],
    });
  }
  if (linkedin) {
    facts.push({
      id: "linkedin",
      kind: "detail",
      group: "contact",
      title: "LinkedIn",
      text: `John is on LinkedIn as ${linkedin.handle}.`,
      keywords: ["linkedin", "professional", "network", "profile"],
      links: [{ label: "Open LinkedIn", to: linkedin.href, external: true }],
    });
  }

  /* ----------------------------- Experience ----------------------------- */
  for (const e of experience) {
    const group = `exp:${e.id}`;
    const to = link("See the experience timeline", "/experience");
    facts.push({
      id: group,
      kind: "overview",
      group,
      title: `${e.role} — ${e.organization}`,
      text: `${e.role} at ${e.organization} (${e.start} – ${e.end}${e.location ? `, ${e.location}` : ""}). ${sentence(e.summary)}`,
      keywords: [e.organization, e.role, e.type, e.start, e.end, ...e.skills, "experience", "work", "role", "position", "title", e.type === "Internship" ? "internship intern" : ""],
      links: [to],
      boost: 1.15,
      ask: e.type === "Project" ? `Tell me about ${e.organization.replace(/ — Thesis$/, "")}` : `What did John do at ${e.organization}?`,
      askTl: e.type === "Project" ? `Ikuwento mo ang ${e.organization.replace(/ — Thesis$/, "")}` : `Ano ang ginawa ni John sa ${e.organization}?`,
    });
    e.highlights.forEach((h, i) =>
      facts.push({
        id: `${group}:h${i}`,
        kind: "detail",
        group,
        title: `${e.organization} — ${e.role}`,
        text: `At ${e.organization} (${e.role}): ${sentence(h)}`,
        short: sentence(h),
        keywords: [...e.skills, e.organization],
        links: [to],
      }),
    );
  }
  facts.push({
    id: "experience-list",
    kind: "list",
    group: "experience",
    title: "Work experience overview",
    text: `John's experience:\n${bullets(experience.map((e) => `${e.role} — ${e.organization} (${e.start} – ${e.end})`))}`,
    keywords: ["experience", "work", "history", "career", "internships", "intern", "jobs", "timeline", "employment", "worked", "companies", "company", "background", "resume"],
    links: [link("See the experience timeline", "/experience")],
    boost: 1.25,
    ask: "What is John's work experience?",
    askTl: "Ano ang work experience ni John?",
  });

  /* ----------------------------- Education ----------------------------- */
  for (const e of education) {
    const group = `edu:${e.id}`;
    facts.push({
      id: group,
      kind: "overview",
      group,
      title: `${e.role} — ${e.organization}`,
      text: `${e.role} at ${e.organization} (${e.start} – ${e.end}${e.location ? `, ${e.location}` : ""}). ${e.highlights.map(sentence).join(" ")}`.trim(),
      keywords: [e.organization, e.role, "education", "school", "university", "college", "degree", "study", "studied", "graduate", "graduated", "course", "major", e.organization.includes("Pamantasan") ? "plm" : ""],
      links: [link("See education and honors", "/experience")],
      boost: 1.15,
    });
  }
  facts.push({
    id: "education-list",
    kind: "list",
    group: "education",
    title: "Education overview",
    text: `John's education:\n${bullets(education.map((e) => `${e.role} — ${e.organization} (${e.start} – ${e.end})`))}`,
    keywords: ["education", "school", "university", "college", "degree", "study", "studied", "graduate", "graduated", "academic", "alma", "mater", "diploma", "bachelor"],
    links: [link("See education and honors", "/experience")],
    boost: 1.25,
    ask: "Where did John study?",
    askTl: "Saan nag-aral si John?",
  });

  /* --------------------- Certifications · honors --------------------- */
  certifications.forEach((c, i) =>
    facts.push({
      id: `cert:${i}`,
      kind: "detail",
      group: "certs",
      title: c.title,
      text: `${c.title}: ${sentence(c.detail)}`,
      short: `${c.title} — ${c.detail}`,
      keywords: ["certification", "certifications", "certificate", "training", "course", "seminar", "credential", "learned", "learning"],
      links: [link("See certifications", "/experience")],
      boost: 0.8,
    }),
  );
  facts.push({
    id: "certs-list",
    kind: "list",
    group: "certs",
    title: "Certifications and training",
    text: `John's certifications and training:\n${bullets(certifications.map((c) => `${c.title} — ${c.detail}`))}`,
    keywords: ["certification", "certifications", "certificate", "certificates", "training", "course", "courses", "seminar", "credential", "credentials", "licenses", "learned", "masterclass"],
    links: [link("See certifications", "/experience")],
    boost: 1.25,
    ask: "What certifications does John have?",
    askTl: "Anong mga sertipikasyon ang mayroon siya?",
  });
  honors.forEach((h, i) =>
    facts.push({
      id: `honor:${i}`,
      kind: "detail",
      group: "honors",
      title: h.title,
      text: `${h.title}: ${sentence(h.detail)}`,
      short: `${h.title} — ${h.detail}`,
      keywords: ["award", "awards", "honor", "honors", "recognition", "achievement", "won", "best", "dean", "deans", "lister"],
      boost: 0.85,
    }),
  );
  facts.push({
    id: "honors-list",
    kind: "list",
    group: "honors",
    title: "Awards and honors",
    text: `John's awards and honors:\n${bullets(honors.map((h) => `${h.title} — ${h.detail}`))}`,
    keywords: ["award", "awards", "honor", "honors", "recognition", "recognitions", "achievement", "achievements", "won", "win", "prize", "accomplishments", "dean", "deans", "lister", "list", "best", "recognized"],
    links: [link("See honors", "/experience")],
    boost: 1.3,
    ask: "What awards has John won?",
    askTl: "Anong mga parangal ang napanalunan niya?",
  });

  /* ------------------------------ Skills ------------------------------ */
  for (const g of skillGroups) {
    const group = `skills:${g.id}`;
    const stackLink = link("View the full tech stack", "/stack");
    facts.push({
      id: group,
      kind: "overview",
      group,
      title: g.title,
      text: `${g.title}: ${sentence(g.description)} It includes ${g.items.map((it) => (it.note ? `${it.name} (${it.note})` : it.name)).join(", ")}.`,
      keywords: [g.title, ...g.items.map((i) => i.name), "skill", "skills", "technology", "technologies", "stack", "tools", "know", "proficient", "experience"],
      links: [stackLink],
      boost: 1.1,
      ask: `What are John's ${g.title} skills?`,
      askTl: `Ano ang ${g.title} skills ni John?`,
    });
    for (const it of g.items) {
      facts.push({
        id: `${group}:${it.name}`,
        kind: "detail",
        group,
        title: it.name,
        text: `${it.name}${it.note ? ` (${it.note})` : ""} is part of John's ${g.title} skills.`,
        short: `${it.name}${it.note ? ` (${it.note})` : ""}`,
        keywords: [g.title, "skill", "skills", "know", "proficient", "use", "uses", "experience"],
        links: [stackLink],
      });
    }
  }
  facts.push({
    id: "skills-list",
    kind: "list",
    group: "skills",
    title: "Skills overview",
    text: `John's skills by area:\n${bullets(skillGroups.map((g) => `${g.title}: ${g.items.map((i) => i.name).join(", ")}`))}`,
    keywords: ["skill", "skills", "technology", "technologies", "tech", "stack", "tools", "languages", "programming", "proficient", "expertise", "competencies", "capabilities", "know", "good", "software", "frameworks"],
    links: [link("View the full tech stack", "/stack")],
    boost: 1.3,
    ask: "What are John's main skills?",
    askTl: "Ano ang mga skills ni John?",
  });

  /* ------------------------------ Projects ------------------------------ */
  for (const p of projects) facts.push(...projectFacts(p));
  facts.push({
    id: "projects-list",
    kind: "list",
    group: "projects",
    title: "Projects overview",
    text: `${projects.length === 1 ? "John's project" : `John's ${projects.length} projects`}:\n${bullets(projects.map((p) => `${p.title} — ${p.tagline} (${p.status}, ${p.period})`))}`,
    keywords: ["project", "projects", "built", "build", "made", "portfolio", "work", "samples", "case", "studies", "developed", "created", "apps", "applications", "show", "showcase", "list"],
    links: [link("See all projects", "/projects")],
    boost: 1.3,
    ask: "What projects has John built?",
    askTl: "Anu-ano ang mga proyekto ni John?",
  });

  /* ------------------------- Hand-written Q&A ------------------------- */
  for (const k of knowledgeBase) {
    facts.push({
      id: `faq:${k.id}`,
      kind: "curated",
      group: `faq:${k.id}`,
      title: k.question,
      text: k.answer,
      keywords: k.keywords,
      links: k.link ? [link(k.link.label, k.link.to)] : undefined,
      boost: 1.15,
      ask: k.question,
    });
  }

  /* ------------------------------ Glossary ------------------------------ */
  for (const g of glossary) {
    facts.push({
      id: `term:${g.term}`,
      kind: "glossary",
      group: `term:${g.term}`,
      title: `What is ${g.term}?`,
      text: g.definition,
      keywords: [g.term, ...(g.aliases ?? []), "what", "meaning", "mean", "explain", "definition", "define"],
      boost: 1.1,
      ask: `What is ${g.term}?`,
      askTl: `Ano ang ${g.term}?`,
      evidence: [g.term, ...(g.aliases ?? []), ...(g.related ?? [])],
    });
  }

  return facts;
}
