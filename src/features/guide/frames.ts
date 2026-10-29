/**
 * The sentence "frames" the assistant wraps around your content: "Role: …", "Built with …", "John's skills by area:".
 * English is the source of truth; the Filipino frames are what a visitor who writes in Tagalog / Taglish sees.
 * The content itself (your summaries, highlights, definitions) is translated in src/content/tagalogContent.ts.
 */

import type { Lang } from "@/content/knowledge";

export interface Frames {
  status: (s: string) => string;
  projectOverview: (o: { label: string; summary: string; role: string; status: string; period: string; stack: string }) => string;
  goal: string;
  problem: string;
  didJohn: string;
  howItWorks: string;
  challenge: string;
  outcome: string;
  awards: (list: string) => string;
  whereToSee: (labels: string[]) => string;
  /** Used instead of a project's `linkNote` when that note is a developer note ("add a link under links: …"). */
  noPublicLink: string;
  inHisWords: (p: string) => string;
  principle: (title: string, detail: string) => string;
  focusList: string;
  availability: (o: { availability: string; location: string }) => string;
  location: (loc: string) => string;
  contact: (o: { email: string; linkedin: string; github: string }) => string;
  githubIs: (h: string) => string;
  linkedinIs: (h: string) => string;
  roleAt: (role: string, org: string, when: string, rest: string) => string;
  atOrg: (org: string, role: string, text: string) => string;
  experienceList: string;
  educationList: string;
  certsList: string;
  honorsList: string;
  skillsOverview: (o: { title: string; description: string; items: string }) => string;
  skillDetail: (name: string, group: string) => string;
  skillsList: string;
  projectsList: (n: number) => string;
  /** Joins two things: "A and B". */
  and: string;
}

const STATUS_TL: Record<string, string> = { Completed: "Tapos na", "In progress": "Ginagawa pa", Concept: "Konsepto" };

export const FRAMES: Record<Lang, Frames> = {
  en: {
    status: (s) => s,
    projectOverview: (o) => `${o.label} — ${o.summary} Role: ${o.role}. Status: ${o.status} (${o.period}). Built with ${o.stack}.`,
    goal: "Goal: ",
    problem: "The problem it solves: ",
    didJohn: "What John did: ",
    howItWorks: "How it works: ",
    challenge: "A challenge: ",
    outcome: "Outcome: ",
    awards: (l) => `Awards: ${l}.`,
    whereToSee: (labels) => `Where to see it: ${labels.join(" and ")}.`,
    noPublicLink: "There isn't a public link for this yet.",
    inHisWords: (p) => `In his own words: “${p}”`,
    principle: (t, d) => `One of his working principles — ${t}: ${d}`,
    focusList: "John's main focus areas:\n",
    availability: (o) => `${o.availability} He is based in ${o.location}. The best way to discuss an opportunity is to contact him directly.`,
    location: (loc) => `John is based in ${loc}.`,
    contact: (o) =>
      `You can email John at ${o.email}, or find him on LinkedIn (${o.linkedin}) and GitHub (${o.github}). The contact page has one-click Gmail compose and copy-email actions.`,
    githubIs: (h) => `John's GitHub is ${h}.`,
    linkedinIs: (h) => `John is on LinkedIn as ${h}.`,
    roleAt: (role, org, when, rest) => `${role} at ${org} (${when}). ${rest}`.trim(),
    atOrg: (org, role, text) => `At ${org} (${role}): ${text}`,
    experienceList: "John's experience:\n",
    educationList: "John's education:\n",
    certsList: "John's certifications and training:\n",
    honorsList: "John's awards and honors:\n",
    skillsOverview: (o) => `${o.title}: ${o.description} It includes ${o.items}.`,
    skillDetail: (name, group) => `${name} is part of John's ${group} skills.`,
    skillsList: "John's skills by area:\n",
    projectsList: (n) => (n === 1 ? "John's project:\n" : `John's ${n} projects:\n`),
    and: "and",
  },
  tl: {
    status: (s) => STATUS_TL[s] ?? s,
    projectOverview: (o) => `${o.label} — ${o.summary} Tungkulin: ${o.role}. Katayuan: ${o.status} (${o.period}). Ginawa gamit ang ${o.stack}.`,
    goal: "Layunin: ",
    problem: "Ang problemang nilulutas nito: ",
    didJohn: "Ang ginawa ni John: ",
    howItWorks: "Paano ito gumagana: ",
    challenge: "Isang challenge: ",
    outcome: "Resulta: ",
    awards: (l) => `Mga parangal: ${l}.`,
    whereToSee: (labels) => `Makikita ito sa: ${labels.join(" at ")}.`,
    noPublicLink: "Wala pang public link para dito.",
    inHisWords: (p) => `Sa sarili niyang mga salita: “${p}”`,
    principle: (t, d) => `Isa sa mga prinsipyo niya sa trabaho — ${t}: ${d}`,
    focusList: "Ang mga pangunahing focus ni John:\n",
    availability: (o) => `${o.availability} Nakabase siya sa ${o.location}. Pinakamainam na makipag-ugnayan nang direkta sa kanya para pag-usapan ang oportunidad.`,
    location: (loc) => `Nakabase si John sa ${loc}.`,
    contact: (o) =>
      `Puwede mong i-email si John sa ${o.email}, o hanapin siya sa LinkedIn (${o.linkedin}) at GitHub (${o.github}). May one-click Gmail compose at copy-email sa contact page.`,
    githubIs: (h) => `Ang GitHub ni John ay ${h}.`,
    linkedinIs: (h) => `Nasa LinkedIn si John bilang ${h}.`,
    roleAt: (role, org, when, rest) => `${role} sa ${org} (${when}). ${rest}`.trim(),
    atOrg: (org, role, text) => `Sa ${org} (${role}): ${text}`,
    experienceList: "Ang karanasan ni John:\n",
    educationList: "Ang edukasyon ni John:\n",
    certsList: "Ang mga sertipikasyon at training ni John:\n",
    honorsList: "Ang mga parangal at karangalan ni John:\n",
    skillsOverview: (o) => `${o.title}: ${o.description} Kasama rito ang ${o.items}.`,
    skillDetail: (name, group) => `Bahagi ang ${name} ng ${group} skills ni John.`,
    skillsList: "Ang mga skills ni John ayon sa larangan:\n",
    projectsList: (n) => (n === 1 ? "Ang proyekto ni John:\n" : `Ang ${n} proyekto ni John:\n`),
    and: "at",
  },
};

const LINK_TL: Record<string, string> = {
  "See the experience timeline": "Tingnan ang experience timeline",
  "See education and honors": "Tingnan ang edukasyon at mga parangal",
  "See certifications": "Tingnan ang mga sertipikasyon",
  "See honors": "Tingnan ang mga parangal",
  "View the full tech stack": "Tingnan ang buong tech stack",
  "Get in touch": "Makipag-ugnayan",
  "Go to the contact page": "Pumunta sa contact page",
  "Go to contact": "Pumunta sa contact page",
  "Email John": "I-email si John",
  "Read the about page": "Basahin ang about page",
  "See all projects": "Tingnan ang lahat ng proyekto",
  "See his experience": "Tingnan ang karanasan niya",
  "Open GitHub": "Buksan ang GitHub",
  "Open LinkedIn": "Buksan ang LinkedIn",
};

/** The text on a link button, in Filipino ("Open the X case study" → "Buksan ang case study ng X"). Unknown labels stay as they are. */
export function linkLabelTl(label: string): string {
  const m = label.match(/^Open the (.+) case study$/);
  return m ? `Buksan ang case study ng ${m[1]}` : LINK_TL[label] ?? label;
}
