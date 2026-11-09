import type { Lang } from "@/content/knowledge";

export interface Frames {
  status: (s: string) => string;
  projectOverview: (o: { label: string; summary: string; role: string; status: string; period: string; stack: string }) => string;
  goal: string;
  problem: string;
  didAldwin: string;
  howItWorks: string;
  challenge: string;
  outcome: string;
  awards: (list: string) => string;
  whereToSee: (labels: string[]) => string;
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
  and: string;
}

const STATUS_TL: Record<string, string> = { Completed: "Tapos na", "In progress": "Ginagawa pa", Concept: "Konsepto" };

export const FRAMES: Record<Lang, Frames> = {
  en: {
    status: (s) => s,
    projectOverview: (o) => `${o.label} — ${o.summary} Role: ${o.role}. Status: ${o.status} (${o.period}). Built with ${o.stack}.`,
    goal: "Goal: ",
    problem: "The problem it solves: ",
    didAldwin: "What Aldwin did: ",
    howItWorks: "How it works: ",
    challenge: "A challenge: ",
    outcome: "Outcome: ",
    awards: (l) => `Awards: ${l}.`,
    whereToSee: (labels) => `Where to see it: ${labels.join(" and ")}.`,
    noPublicLink: "There isn't a public link for this yet.",
    inHisWords: (p) => `In his own words: “${p}”`,
    principle: (t, d) => `One of his working principles — ${t}: ${d}`,
    focusList: "Aldwin's main focus areas:\n",
    availability: (o) => `${o.availability} He is based in ${o.location}. The best way to discuss an opportunity is to contact him directly.`,
    location: (loc) => `Aldwin is based in ${loc}.`,
    contact: (o) =>
      `You can email Aldwin at ${o.email}, or find him on LinkedIn (${o.linkedin}) and GitHub (${o.github}). The contact page has one-click Gmail compose and copy-email actions.`,
    githubIs: (h) => `Aldwin's GitHub is ${h}.`,
    linkedinIs: (h) => `Aldwin is on LinkedIn as ${h}.`,
    roleAt: (role, org, when, rest) => `${role} at ${org} (${when}). ${rest}`.trim(),
    atOrg: (org, role, text) => `At ${org} (${role}): ${text}`,
    experienceList: "Aldwin's experience:\n",
    educationList: "Aldwin's education:\n",
    certsList: "Aldwin's certifications and training:\n",
    honorsList: "Aldwin's awards and honors:\n",
    skillsOverview: (o) => `${o.title}: ${o.description} It includes ${o.items}.`,
    skillDetail: (name, group) => `${name} is part of Aldwin's ${group} skills.`,
    skillsList: "Aldwin's skills by area:\n",
    projectsList: (n) => (n === 1 ? "Aldwin's project:\n" : `Aldwin's ${n} projects:\n`),
    and: "and",
  },
  tl: {
    status: (s) => STATUS_TL[s] ?? s,
    projectOverview: (o) => `${o.label} — ${o.summary} Tungkulin: ${o.role}. Katayuan: ${o.status} (${o.period}). Ginawa gamit ang ${o.stack}.`,
    goal: "Layunin: ",
    problem: "Ang problemang nilulutas nito: ",
    didAldwin: "Ang ginawa ni Aldwin: ",
    howItWorks: "Paano ito gumagana: ",
    challenge: "Isang challenge: ",
    outcome: "Resulta: ",
    awards: (l) => `Mga parangal: ${l}.`,
    whereToSee: (labels) => `Makikita ito sa: ${labels.join(" at ")}.`,
    noPublicLink: "Wala pang public link para dito.",
    inHisWords: (p) => `Sa sarili niyang mga salita: “${p}”`,
    principle: (t, d) => `Isa sa mga prinsipyo niya sa trabaho — ${t}: ${d}`,
    focusList: "Ang mga pangunahing focus ni Aldwin:\n",
    availability: (o) => `${o.availability} Nakabase siya sa ${o.location}. Pinakamainam na makipag-ugnayan nang direkta sa kanya para pag-usapan ang oportunidad.`,
    location: (loc) => `Nakabase si Aldwin sa ${loc}.`,
    contact: (o) =>
      `Puwede mong i-email si Aldwin sa ${o.email}, o hanapin siya sa LinkedIn (${o.linkedin}) at GitHub (${o.github}). May one-click Gmail compose at copy-email sa contact page.`,
    githubIs: (h) => `Ang GitHub ni Aldwin ay ${h}.`,
    linkedinIs: (h) => `Nasa LinkedIn si Aldwin bilang ${h}.`,
    roleAt: (role, org, when, rest) => `${role} sa ${org} (${when}). ${rest}`.trim(),
    atOrg: (org, role, text) => `Sa ${org} (${role}): ${text}`,
    experienceList: "Ang karanasan ni Aldwin:\n",
    educationList: "Ang edukasyon ni Aldwin:\n",
    certsList: "Ang mga sertipikasyon at training ni Aldwin:\n",
    honorsList: "Ang mga parangal at karangalan ni Aldwin:\n",
    skillsOverview: (o) => `${o.title}: ${o.description} Kasama rito ang ${o.items}.`,
    skillDetail: (name, group) => `Bahagi ang ${name} ng ${group} skills ni Aldwin.`,
    skillsList: "Ang mga skills ni Aldwin ayon sa larangan:\n",
    projectsList: (n) => (n === 1 ? "Ang proyekto ni Aldwin:\n" : `Ang ${n} proyekto ni Aldwin:\n`),
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
  "Email Aldwin": "I-email si Aldwin",
  "Read the about page": "Basahin ang about page",
  "See all projects": "Tingnan ang lahat ng proyekto",
  "See his experience": "Tingnan ang karanasan niya",
  "Open GitHub": "Buksan ang GitHub",
  "Open LinkedIn": "Buksan ang LinkedIn",
};

export function linkLabelTl(label: string): string {
  const m = label.match(/^Open the (.+) case study$/);
  return m ? `Buksan ang case study ng ${m[1]}` : LINK_TL[label] ?? label;
}
