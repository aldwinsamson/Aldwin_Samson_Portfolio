import { profile, socials } from "@/content/profile";
import { certifications, education, experience, honors } from "@/content/experience";
import { skillGroups } from "@/content/skills";
import { projects as allProjects } from "@/content/projects";
import { knowledgeBase } from "@/content/knowledge";
import type { Project } from "@/content/types";
import { glossary } from "./glossary";
import { FRAMES, type Frames } from "./frames";
import { TL_TEXT } from "@/content/tagalogContent";
import type { Lang } from "@/content/knowledge";

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
  /** The same fact written in Filipino / Taglish (shown when the visitor writes in Tagalog). */
  textTl?: string;
  shortTl?: string;
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

/** Strings that had no Filipino version while the Filipino facts were built (used by the test that reports them). */
const untranslated = new Set<string>();
interface Ctx {
  lang: Lang;
  F: Frames;
  /** Translates one piece of site content (English passes through unchanged). */
  t: (s: string) => string;
}
const makeCtx = (lang: Lang): Ctx => ({
  lang,
  F: FRAMES[lang],
  t: (s) => {
    if (lang === "en" || !/[A-Za-z]/.test(s)) return s;
    if (!(s in TL_TEXT)) untranslated.add(s);
    return TL_TEXT[s] ?? s;
  },
});

/** A project's `linkNote` is often a note to the site owner ("add a link under links: …") — never show those to visitors. */
const isDevNote = (note: string) => /src\/|`|\bREVIEW\b|TODO/.test(note);
const bullets = (items: string[]) => items.map((i) => `• ${i}`).join("\n");
const sentence = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);

function projectFacts(p: Project, c: Ctx): Fact[] {
  const { F, t } = c;
  const group = `proj:${p.slug}`;
  const to = `/projects/${p.slug}`;
  const open = link(`Open the ${p.title} case study`, to);
  const label = p.fullTitle ? `${p.title} (${t(p.fullTitle)})` : p.title;
  const base: Fact[] = [
    {
      id: group,
      kind: "overview",
      group,
      title: p.title,
      text: F.projectOverview({ label, summary: sentence(t(p.summary)), role: t(p.role), status: F.status(p.status), period: p.period, stack: p.stack.join(", ") }),
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
  if (p.objective) base.push(detail("objective", "goal", `${F.goal}${sentence(t(p.objective))}`, undefined, ["objective", "goal", "purpose", "aim"]));
  if (p.problem) base.push(detail("problem", "problem it solves", `${F.problem}${sentence(t(p.problem))}`, undefined, ["problem", "why", "solve"]));
  p.contributions.forEach((x, i) => base.push(detail(`c${i}`, "his contribution", `${F.didJohn}${sentence(t(x))}`, sentence(t(x)), ["contribution", "role", "did", "responsibility", "responsibilities"])));
  (p.architecture ?? []).forEach((a, i) => base.push(detail(`a${i}`, a.label, `${t(a.label)}: ${sentence(t(a.detail))}`, `${t(a.label)}: ${sentence(t(a.detail))}`, ["architecture", "design", "system", "components"])));
  p.implementation.forEach((x, i) => base.push(detail(`i${i}`, "implementation", `${F.howItWorks}${sentence(t(x))}`, sentence(t(x)), ["implementation", "how", "works", "technical"])));
  (p.challenges ?? []).forEach((x, i) => base.push(detail(`ch${i}`, "challenges", `${F.challenge}${sentence(t(x))}`, sentence(t(x)), ["challenge", "difficult", "hard", "difficulty", "obstacle"])));
  p.outcomes.forEach((x, i) => base.push(detail(`o${i}`, "outcome", `${F.outcome}${sentence(t(x))}`, sentence(t(x)), ["outcome", "result", "delivered", "impact", "achieved"])));
  if (p.awards && p.awards.length) {
    base.push(detail("awards", "awards", F.awards(p.awards.join(", ")), undefined, ["award", "awards", "won", "recognition", "achievement"]));
  }
  const ext: GuideLink[] = [];
  if (p.links?.repository) ext.push({ label: p.links.repository.label, to: p.links.repository.href, external: true });
  if (p.links?.demo) ext.push({ label: p.links.demo.label, to: p.links.demo.href, external: true });
  const linkWords = ["link", "links", "github", "repository", "repo", "demo", "source", "code", "live", "website", "url", "public"];
  if (ext.length) {
    base.push({
      ...detail("links", "links", F.whereToSee(ext.map((l) => l.label)), undefined, linkWords),
      links: [open, ...ext],
    });
  } else if (p.linkNote) {
    // Developer notes ("add a link under links: …") become a plain visitor-facing sentence.
    const visitorNote = isDevNote(p.linkNote) ? (p.linkNote.split(";")[0] !== p.linkNote && !isDevNote(p.linkNote.split(";")[0]) ? p.linkNote.split(";")[0] : null) : p.linkNote;
    base.push(detail("links", "source code", visitorNote ? sentence(t(visitorNote)) : F.noPublicLink, undefined, linkWords));
  }
  return base;
}

function buildFacts(lang: Lang): Fact[] {
  const c = makeCtx(lang);
  const { F, t } = c;
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
      text: F.inHisWords(t(p)),
      short: t(p),
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
      text: `${d.title}: ${t(d.detail)}`,
      short: `${d.title}: ${t(d.detail)}`,
      keywords: ["focus", "specialize", "specialise", "specialization", "discipline", "expertise", "area", "strength", "speciality"],
      links: [link("Read the about page", "/about")],
    }),
  );
  facts.push({
    id: "focus-list",
    kind: "list",
    group: "focus",
    title: "What John specializes in",
    text: `${F.focusList}${bullets(profile.disciplines.map((d) => `${d.title} — ${t(d.detail)}`))}`,
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
      text: F.principle(t(v.title), t(v.detail)),
      short: `${t(v.title)}: ${t(v.detail)}`,
      keywords: ["values", "principles", "philosophy", "approach", "style", "mindset", "believe", "culture", "ethic"],
    }),
  );

  /* ---------------------- Availability · location · contact ---------------------- */
  facts.push({
    id: "availability",
    kind: "overview",
    group: "availability",
    title: "Availability and roles",
    text: F.availability({ availability: sentence(t(profile.availability)), location: profile.location }),
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
    text: F.location(profile.location),
    keywords: ["location", "based", "live", "lives", "city", "country", "located", "philippines", "manila", "where", "timezone", "address"],
    boost: 1.2,
  });
  facts.push({
    id: "contact",
    kind: "overview",
    group: "contact",
    title: "How to contact John",
    text: F.contact({ email: profile.email, linkedin: linkedin?.handle ?? "John Aldwin Samson", github: github?.handle ?? "@aldwinsamson" }),
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
      text: F.githubIs(github.handle),
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
      text: F.linkedinIs(linkedin.handle),
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
      text: F.roleAt(e.role, e.organization, `${e.start} – ${e.end}${e.location ? `, ${e.location}` : ""}`, sentence(t(e.summary))),
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
        text: F.atOrg(e.organization, e.role, sentence(t(h))),
        short: sentence(t(h)),
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
    text: `${F.experienceList}${bullets(experience.map((e) => `${e.role} — ${e.organization} (${e.start} – ${e.end})`))}`,
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
      text: F.roleAt(e.role, e.organization, `${e.start} – ${e.end}${e.location ? `, ${e.location}` : ""}`, e.highlights.map((h) => sentence(t(h))).join(" ")),
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
    text: `${F.educationList}${bullets(education.map((e) => `${e.role} — ${e.organization} (${e.start} – ${e.end})`))}`,
    keywords: ["education", "school", "university", "college", "degree", "study", "studied", "graduate", "graduated", "academic", "alma", "mater", "diploma", "bachelor"],
    links: [link("See education and honors", "/experience")],
    boost: 1.25,
    ask: "Where did John study?",
    askTl: "Saan nag-aral si John?",
  });

  /* --------------------- Certifications · honors --------------------- */
  certifications.forEach((x, i) =>
    facts.push({
      id: `cert:${i}`,
      kind: "detail",
      group: "certs",
      title: x.title,
      text: `${x.title}: ${sentence(t(x.detail))}`,
      short: `${x.title} — ${t(x.detail)}`,
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
    text: `${F.certsList}${bullets(certifications.map((x) => `${x.title} — ${t(x.detail)}`))}`,
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
      text: `${h.title}: ${sentence(t(h.detail))}`,
      short: `${h.title} — ${t(h.detail)}`,
      keywords: ["award", "awards", "honor", "honors", "recognition", "achievement", "won", "best", "dean", "deans", "lister"],
      boost: 0.85,
    }),
  );
  facts.push({
    id: "honors-list",
    kind: "list",
    group: "honors",
    title: "Awards and honors",
    text: `${F.honorsList}${bullets(honors.map((h) => `${h.title} — ${t(h.detail)}`))}`,
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
      text: F.skillsOverview({ title: g.title, description: sentence(t(g.description)), items: g.items.map((it) => (it.note ? `${it.name} (${it.note})` : it.name)).join(", ") }),
      keywords: [g.title, ...g.items.map((i) => i.name), "skill", "skills", "technology", "technologies", "stack", "tools", "know", "proficient", "experience"],
      links: [stackLink],
      boost: 1.1,
      ask: `What are John's ${g.title} skills?`,
      askTl: `Ano ang ${g.title} skills ni John?`,
    });
    for (const it of g.items) {
      const label = `${it.name}${it.note ? ` (${it.note})` : ""}`;
      facts.push({
        id: `${group}:${it.name}`,
        kind: "detail",
        group,
        title: it.name,
        text: F.skillDetail(label, g.title),
        short: label,
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
    text: `${F.skillsList}${bullets(skillGroups.map((g) => `${g.title}: ${g.items.map((i) => i.name).join(", ")}`))}`,
    keywords: ["skill", "skills", "technology", "technologies", "tech", "stack", "tools", "languages", "programming", "proficient", "expertise", "competencies", "capabilities", "know", "good", "software", "frameworks"],
    links: [link("View the full tech stack", "/stack")],
    boost: 1.3,
    ask: "What are John's main skills?",
    askTl: "Ano ang mga skills ni John?",
  });

  /* ------------------------------ Projects ------------------------------ */
  for (const p of projects) facts.push(...projectFacts(p, c));
  facts.push({
    id: "projects-list",
    kind: "list",
    group: "projects",
    title: "Projects overview",
    text: `${F.projectsList(projects.length)}${bullets(projects.map((p) => `${p.title} — ${t(p.tagline)} (${F.status(p.status)}, ${p.period})`))}`,
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
      text: lang === "tl" ? (k.answerTl ?? k.answer) : k.answer,
      keywords: k.keywords,
      links: k.link ? [link(k.link.label, k.link.to)] : undefined,
      // curated answers are reached by the shortcuts below / their own keywords; a low weight stops the bio from leading unrelated answers
      boost: 0.8,
      ask: k.question,
      askTl: k.questionTl,
    });
  }

  /* ------------------------------ Glossary ------------------------------ */
  for (const g of glossary) {
    facts.push({
      id: `term:${g.term}`,
      kind: "glossary",
      group: `term:${g.term}`,
      title: `What is ${g.term}?`,
      text: t(g.definition),
      keywords: [g.term, ...(g.aliases ?? []), "what", "meaning", "mean", "explain", "definition", "define"],
      boost: 1.1,
      ask: `What is ${g.term}?`,
      askTl: `Ano ang ${g.term}?`,
      evidence: [g.term, ...(g.aliases ?? []), ...(g.related ?? [])],
    });
  }

  return facts;
}

/** Builds every fact in English, with the Filipino wording attached (`textTl` / `shortTl`) so the assistant can answer in either. */
export function buildCorpus(): Fact[] {
  const tl = new Map(buildFacts("tl").map((f) => [f.id, f]));
  return buildFacts("en").map((f) => {
    const x = tl.get(f.id);
    return x ? { ...f, textTl: x.text, shortTl: x.short } : f;
  });
}

/** English sentences from the site's content that have no Filipino version yet (they are shown in English until you add one). */
export function findUntranslated(): string[] {
  untranslated.clear();
  buildFacts("tl");
  return [...untranslated];
}
