/**
 * PORTFOLIO ASSISTANT — your own words.
 *
 * Most of what the assistant knows is READ AUTOMATICALLY from the rest of the site:
 * profile, experience, education, certifications, awards, skills and every file in
 * src/content/projects/. Add a project or edit your CV data and it can answer about it.
 *
 * This file holds the things that are NOT in those files:
 *   1) GUIDE / STRINGS — the chat window text and every sentence the assistant says itself, in English and Filipino
 *   2) knowledgeBase — hand-written Q&A. When a visitor asks something the assistant could not answer,
 *                      add the answer here once and it will be able to answer it from then on.
 *
 * Keep answers factual — the assistant repeats them as written.
 */

export type Lang = "en" | "tl";

/** Every sentence the assistant itself says, in English and Filipino. (Facts from the site stay in English.) */
export interface GuideStrings {
  greeting: string;
  fallback: string;
  privacy: string;
  offTopic: string;
  thanks: string;
  bye: string;
  identity: string;
  help: string;
  empty: string;
  yes: string;
  found: string;
  inWork: string;
  /** Said before the facts when the visitor asks for a judgement ("is he good at AWS?"). */
  evalNote: string;
  /** Lead-ins for the "latest / current / how many / compare" questions. */
  latestProject: string;
  ongoingProject: string;
  latestRole: string;
  compareIntro: string;
  count: (n: number, what: "projects" | "certifications" | "awards" | "internships") => string;
  moreIntro: string;
  moreEnd: string;
  moreHint: string;
  moreHintAgain: string;
  notFound: (words: string[]) => string;
  emailLabel: string;
  contactLabel: string;
  linkedinLabel: string;
  emailBody: (question: string) => string;
  /** Suggestion chips. */
  starters: (firstProject?: string) => string[];
}

export const STRINGS: Record<Lang, GuideStrings> = {
  en: {
    greeting:
      "Hi! I'm John's portfolio assistant. Ask me about his projects, experience, skills, certifications or how to get in touch — I answer from the information on this site. You can ask in English, Tagalog or Taglish.",
    /** Shown when the assistant cannot answer a question. */
    fallback:
      "I couldn't find an answer to that on John's portfolio, and I'd rather not guess. For this one, please contact John personally — he'll be glad to help.",
    /** Shown for personal/private topics (salary, phone number, age, …). */
    privacy:
      "That's something John prefers to share personally rather than publish on his site. Please contact him directly and he'll be happy to talk about it.",
    /** Shown for questions that have nothing to do with John or his work. */
    offTopic:
      "I'm here to answer questions about John and his work, so that one is outside what I can help with. If you'd like to ask him something directly, please contact John personally.",
    thanks: "You're welcome! If you'd like to know anything else about John, just ask — or contact him personally for anything I can't answer.",
    bye: "Thanks for stopping by! Feel free to come back any time — and if you'd like to talk to John directly, you can reach him from the contact page.",
    identity:
      "I'm John's portfolio assistant — not a person. I search the information on this website (his experience, projects, skills, certifications and more) and put an answer together. I don't make things up: if I can't find it, I'll point you to John.",
    help: "Here's what I can help with:\n• His projects and how they were built\n• Work experience, internships and education\n• Skills, tools and technologies (I can also explain them in plain English)\n• Certifications and awards\n• Availability and how to contact him\n\nAnything else, I'll point you to John personally.",
    empty: "Ask me anything about John's projects, experience, skills or how to reach him.",
    yes: "Yes!",
    found: "Here's what I found:",
    inWork: "In John's work —",
    evalNote: "I can't judge his skill level, but here's what his portfolio says:",
    latestProject: "His most recent project on this portfolio:",
    ongoingProject: "Here's what he is working on at the moment:",
    latestRole: "His most recent role:",
    compareIntro: "Here's what his portfolio says about each:",
    count: (n, what) =>
      ({
        projects: `John has ${n} published ${n === 1 ? "project" : "projects"} on this portfolio.`,
        certifications: `John lists ${n} ${n === 1 ? "certification or training" : "certifications and trainings"}.`,
        awards: `John lists ${n} ${n === 1 ? "award" : "awards"}.`,
        internships: `John has done ${n} ${n === 1 ? "internship" : "internships"}.`,
      })[what],
    moreIntro: "More details:",
    moreEnd: "That's everything I have on that topic. Is there anything else you'd like to know?",
    moreHint: "(Say “tell me more” for additional details.)",
    moreHintAgain: "(Say “tell me more” again for the rest.)",
    notFound: (w) => `I couldn't find “${w.slice(0, 3).join("”, “")}” mentioned anywhere on this site.`,
    emailLabel: "Email John",
    contactLabel: "Open the contact page",
    linkedinLabel: "Message on LinkedIn",
    emailBody: (q) =>
      `Hi John,\n\nI was using your portfolio assistant and asked:\n"${q}"\n\nIt couldn't answer, so I'm reaching out personally.\n\nThanks!`,
    starters: (p) => [
      "What does John specialize in?",
      p ? `Tell me about ${p}` : "What projects has John built?",
      "What cloud and DevOps experience does he have?",
      "Is John open to work?",
      "What awards has he won?",
      "How can I contact him?",
    ],
  },
  tl: {
    greeting:
      "Kumusta! Ako ang portfolio assistant ni John. Magtanong ka tungkol sa kanyang mga proyekto, karanasan, skills, sertipikasyon, o kung paano siya makokontak — sasagot ako batay sa impormasyon sa site na ito. Puwede kang magtanong sa English, Tagalog o Taglish.",
    fallback:
      "Wala akong makitang sagot diyan sa portfolio ni John, at ayokong manghula. Para sa tanong na ito, mangyaring makipag-ugnayan kay John nang personal — matutuwa siyang tumulong.",
    privacy:
      "Mas gusto ni John na siya mismo ang magbahagi ng bagay na iyan kaysa ilathala sa site niya. Mangyaring makipag-ugnayan sa kanya nang direkta at masaya siyang makipag-usap tungkol dito.",
    offTopic:
      "Narito ako para sagutin ang mga tanong tungkol kay John at sa kanyang trabaho, kaya hindi ko matutulungan ang tanong na iyan. Kung may gusto kang itanong sa kanya, mangyaring makipag-ugnayan kay John nang personal.",
    thanks: "Walang anuman! Kung may iba ka pang gustong malaman tungkol kay John, magtanong lang — o makipag-ugnayan nang direkta kay John para sa mga hindi ko masasagot.",
    bye: "Salamat sa pagbisita! Bumalik ka anumang oras — at kung gusto mong makausap si John nang direkta, puwede mo siyang abutin sa contact page.",
    identity:
      "Ako ang portfolio assistant ni John — hindi ako tao. Hinahanap ko sa impormasyon ng website na ito (karanasan, proyekto, skills, sertipikasyon at iba pa) ang sagot at binubuo ko ito. Hindi ako gumagawa ng sagot na wala sa site: kung wala akong makita, ituturo kita kay John.",
    help: "Narito ang matutulungan ko:\n• Ang mga proyekto niya at kung paano ginawa ang mga ito\n• Karanasan sa trabaho, internship at edukasyon\n• Skills, tools at teknolohiya (maipapaliwanag ko rin sa simpleng paraan)\n• Mga sertipikasyon at parangal\n• Availability at kung paano siya makokontak\n\nPara sa iba pa, ituturo kita kay John mismo.",
    empty: "Magtanong ka tungkol sa mga proyekto, karanasan, skills ni John, o kung paano siya makokontak.",
    yes: "Opo!",
    found: "Heto ang nakita ko:",
    inWork: "Sa trabaho ni John —",
    evalNote: "Hindi ko masusukat ang antas ng kanyang galing, pero heto ang nakasaad sa portfolio niya:",
    latestProject: "Ang pinakabago niyang proyekto sa portfolio na ito:",
    ongoingProject: "Heto ang kasalukuyan niyang ginagawa:",
    latestRole: "Ang pinakahuli niyang tungkulin:",
    compareIntro: "Heto ang nakasaad sa portfolio niya tungkol sa bawat isa:",
    count: (n, what) =>
      ({
        projects: `May ${n} proyekto si John sa portfolio na ito.`,
        certifications: `May ${n} sertipikasyon at training si John.`,
        awards: `May ${n} parangal si John.`,
        internships: `${n} internship ang natapos ni John.`,
      })[what],
    moreIntro: "Karagdagang detalye:",
    moreEnd: "Iyan na ang lahat ng alam ko tungkol sa paksang iyan. May iba ka pa bang gustong malaman?",
    moreHint: "(Sabihin ang “dagdag pa” para sa karagdagang detalye.)",
    moreHintAgain: "(Sabihin muli ang “dagdag pa” para sa natitira.)",
    notFound: (w) => `Hindi ko makita ang “${w.slice(0, 3).join("”, “")}” saanman sa site na ito.`,
    emailLabel: "I-email si John",
    contactLabel: "Buksan ang contact page",
    linkedinLabel: "Mag-message sa LinkedIn",
    emailBody: (q) =>
      `Hello John,\n\nGumamit ako ng portfolio assistant mo at tinanong ko:\n"${q}"\n\nHindi ito nasagot, kaya direkta akong nagme-message sa iyo.\n\nSalamat!`,
    starters: (p) => [
      "Ano ang specialty ni John?",
      p ? `Ikuwento mo ang ${p}` : "Anu-ano ang mga proyekto ni John?",
      "Ano ang cloud at DevOps experience niya?",
      "Bukas ba si John sa trabaho?",
      "Anong mga parangal ang napanalunan niya?",
      "Paano ko siya makokontak?",
    ],
  },
};

/** Fixed text for the chat window. */
export const GUIDE = {
  title: "Ask about John",
  subtitle: "From this portfolio · runs in your browser",
  /** First message in a new chat. */
  welcome: STRINGS.en.greeting,
  placeholder: "Ask anything · Magtanong lang",
  /** Prefilled into the email that the "Email John" button opens. */
  emailSubject: "A question from your portfolio",
} as const;

export interface KnowledgeEntry {
  id: string;
  /** How the question would be phrased (also shown as a suggestion chip). */
  question: string;
  answer: string;
  /** Extra words that should lead to this answer. */
  keywords: string[];
  link?: { label: string; to: string };
}

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "who",
    question: "Who is John Aldwin Samson?",
    answer:
      "John Aldwin R. Samson is a Computer Engineering graduate of Pamantasan ng Lungsod ng Maynila (PLM) specializing in cloud infrastructure, DevOps and site reliability, with a strong foundation in embedded systems and hardware design.",
    keywords: ["who", "introduce", "bio", "background", "profile", "summary", "person", "yourself"],
    link: { label: "Read the about page", to: "/about" },
  },
  {
    id: "why-hire",
    question: "Why should we hire John?",
    answer:
      "He pairs hands-on cloud and DevOps experience — a multi-AZ AWS environment as code with Terraform and CloudFormation, GitLab CI/CD and ArgoCD GitOps delivery, and a Prometheus, Grafana, Loki and Tempo observability stack — with a real hardware and firmware background in multi-layer PCBs, ESP32 and device-to-cloud telemetry. He also led a five-member thesis team to four awards, so he's used to owning outcomes and working with others.",
    keywords: ["hire", "hiring", "why", "strength", "strengths", "choose", "unique", "different", "advantage", "candidate"],
    link: { label: "See his experience", to: "/experience" },
  },
  {
    id: "resume",
    question: "Can I get John's CV or resume?",
    answer:
      "His CV isn't downloadable from this site. Please contact John personally and he'll send you the latest version.",
    keywords: ["cv", "resume", "curriculum", "vitae", "download", "pdf", "document"],
    link: { label: "Go to contact", to: "/contact" },
  },
  {
    id: "assistant",
    question: "How does this assistant work?",
    answer:
      "It's a smart search that runs entirely in your browser. It reads the information on this site — his experience, projects, skills, certifications and more — finds the most relevant parts of it and puts an answer together. Nothing you type is sent anywhere, and it never makes things up: if it can't find the answer, it tells you to contact John personally.",
    keywords: ["assistant", "bot", "chatbot", "chatgpt", "gpt", "privacy", "private"],
  },
];
