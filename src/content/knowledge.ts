export type Lang = "en" | "tl";

/** Every sentence the assistant itself says, in English and Filipino.*/
export interface GuideStrings {
  greeting: string;
  fallback: string;
  privacy: string;
  offTopic: string;
  complex: string;
  partial: string;
  thanks: string;
  bye: string;
  identity: string;
  help: string;
  empty: string;
  yes: string;
  found: string;
  inWork: string;
  evalNote: string;
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
      "Hi! I'm Aldwin's portfolio assistant. Ask me about his projects, experience, skills, certifications or how to get in touch — I answer from the information on this site. You can ask in English, Tagalog or Taglish.",
    fallback:
      "I couldn't find an answer to that on Aldwin's portfolio, and I'd rather not guess. For this one, please contact Aldwin personally — he'll be glad to help.",
    privacy:
      "That's something Aldwin prefers to share personally rather than publish on his site. Please contact him directly and he'll be happy to talk about it.",
    offTopic:
      "I'm here to answer questions about Aldwin and his work, so that one is outside what I can help with. If you'd like to ask him something directly, please contact Aldwin personally.",
    complex:
      "That's a bigger question than I can answer reliably from his portfolio — it really needs Aldwin's own words. Please message him directly and he'll be glad to talk it through.",
    partial: "I couldn't answer the other part from his portfolio — please contact Aldwin for that one.",
    thanks: "You're welcome! If you'd like to know anything else about Aldwin, just ask — or contact him personally for anything I can't answer.",
    bye: "Thanks for stopping by! Feel free to come back any time — and if you'd like to talk to Aldwin directly, you can reach him from the contact page.",
    identity:
      "I'm Aldwin's portfolio assistant — not a person. I search the information on this website (his experience, projects, skills, certifications and more) and put an answer together. I don't make things up: if I can't find it, I'll point you to Aldwin.",
    help: "Here's what I can help with:\n• His projects and how they were built\n• Work experience, internships and education\n• Skills, tools and technologies (I can also explain them in plain English)\n• Certifications and awards\n• Availability and how to contact him\n\nAnything else, I'll point you to Aldwin personally.",
    empty: "Ask me anything about Aldwin's projects, experience, skills or how to reach him.",
    yes: "Yes!",
    found: "Here's what I found:",
    inWork: "In Aldwin's work —",
    evalNote: "I can't judge his skill level, but here's what his portfolio says:",
    latestProject: "His most recent project on this portfolio:",
    ongoingProject: "Here's what he is working on at the moment:",
    latestRole: "His most recent role:",
    compareIntro: "Here's what his portfolio says about each:",
    count: (n, what) =>
      ({
        projects: `Aldwin has ${n} published ${n === 1 ? "project" : "projects"} on this portfolio.`,
        certifications: `Aldwin lists ${n} ${n === 1 ? "certification or training" : "certifications and trainings"}.`,
        awards: `Aldwin lists ${n} ${n === 1 ? "award" : "awards"}.`,
        internships: `Aldwin has done ${n} ${n === 1 ? "internship" : "internships"}.`,
      })[what],
    moreIntro: "More details:",
    moreEnd: "That's everything I have on that topic. Is there anything else you'd like to know?",
    moreHint: "(Say “tell me more” for additional details.)",
    moreHintAgain: "(Say “tell me more” again for the rest.)",
    notFound: (w) => `I couldn't find “${w.slice(0, 3).join("”, “")}” mentioned anywhere on this site.`,
    emailLabel: "Email Aldwin",
    contactLabel: "Open the contact page",
    linkedinLabel: "Message on LinkedIn",
    emailBody: (q) =>
      `Hi Aldwin,\n\nI was using your portfolio assistant and asked:\n"${q}"\n\nIt couldn't answer, so I'm reaching out personally.\n\nThanks!`,
    starters: (p) => [
      "What does Aldwin specialize in?",
      p ? `Tell me about ${p}` : "What projects has Aldwin built?",
      "What cloud and DevOps experience does he have?",
      "Is Aldwin open to work?",
      "What awards has he won?",
      "How can I contact him?",
    ],
  },
  tl: {
    greeting:
      "Kumusta! Ako ang portfolio assistant ni Aldwin. Magtanong ka tungkol sa kanyang mga proyekto, karanasan, skills, sertipikasyon, o kung paano siya makokontak — sasagot ako batay sa impormasyon sa site na ito. Puwede kang magtanong sa English, Tagalog o Taglish.",
    fallback:
      "Wala akong makitang sagot diyan sa portfolio ni Aldwin, at ayokong manghula. Para sa tanong na ito, mangyaring makipag-ugnayan kay Aldwin nang personal — matutuwa siyang tumulong.",
    privacy:
      "Mas gusto ni Aldwin na siya mismo ang magbahagi ng bagay na iyan kaysa ilathala sa site niya. Mangyaring makipag-ugnayan sa kanya nang direkta at masaya siyang makipag-usap tungkol dito.",
    offTopic:
      "Narito ako para sagutin ang mga tanong tungkol kay Aldwin at sa kanyang trabaho, kaya hindi ko matutulungan ang tanong na iyan. Kung may gusto kang itanong sa kanya, mangyaring makipag-ugnayan kay Aldwin nang personal.",
    complex:
      "Mas malaking tanong iyan kaysa kaya kong sagutin nang tama mula sa portfolio niya — mas mainam na si Aldwin mismo ang sumagot. Mangyaring mag-message nang direkta sa kanya at matutuwa siyang pag-usapan ito.",
    partial: "Hindi ko nasagot ang isa pang bahagi mula sa portfolio niya — mangyaring makipag-ugnayan kay Aldwin tungkol doon.",
    thanks: "Walang anuman! Kung may iba ka pang gustong malaman tungkol kay Aldwin, magtanong lang — o makipag-ugnayan nang direkta kay Aldwin para sa mga hindi ko masasagot.",
    bye: "Salamat sa pagbisita! Bumalik ka anumang oras — at kung gusto mong makausap si Aldwin nang direkta, puwede mo siyang abutin sa contact page.",
    identity:
      "Ako ang portfolio assistant ni Aldwin — hindi ako tao. Hinahanap ko sa impormasyon ng website na ito (karanasan, proyekto, skills, sertipikasyon at iba pa) ang sagot at binubuo ko ito. Hindi ako gumagawa ng sagot na wala sa site: kung wala akong makita, ituturo kita kay Aldwin.",
    help: "Narito ang matutulungan ko:\n• Ang mga proyekto niya at kung paano ginawa ang mga ito\n• Karanasan sa trabaho, internship at edukasyon\n• Skills, tools at teknolohiya (maipapaliwanag ko rin sa simpleng paraan)\n• Mga sertipikasyon at parangal\n• Availability at kung paano siya makokontak\n\nPara sa iba pa, ituturo kita kay Aldwin mismo.",
    empty: "Magtanong ka tungkol sa mga proyekto, karanasan, skills ni Aldwin, o kung paano siya makokontak.",
    yes: "Opo!",
    found: "Heto ang nakita ko:",
    inWork: "Sa trabaho ni Aldwin —",
    evalNote: "Hindi ko masusukat ang antas ng kanyang galing, pero heto ang nakasaad sa portfolio niya:",
    latestProject: "Ang pinakabago niyang proyekto sa portfolio na ito:",
    ongoingProject: "Heto ang kasalukuyan niyang ginagawa:",
    latestRole: "Ang pinakahuli niyang tungkulin:",
    compareIntro: "Heto ang nakasaad sa portfolio niya tungkol sa bawat isa:",
    count: (n, what) =>
      ({
        projects: `May ${n} proyekto si Aldwin sa portfolio na ito.`,
        certifications: `May ${n} sertipikasyon at training si Aldwin.`,
        awards: `May ${n} parangal si Aldwin.`,
        internships: `${n} internship ang natapos ni Aldwin.`,
      })[what],
    moreIntro: "Karagdagang detalye:",
    moreEnd: "Iyan na ang lahat ng alam ko tungkol sa paksang iyan. May iba ka pa bang gustong malaman?",
    moreHint: "(Sabihin ang “dagdag pa” para sa karagdagang detalye.)",
    moreHintAgain: "(Sabihin muli ang “dagdag pa” para sa natitira.)",
    notFound: (w) => `Hindi ko makita ang “${w.slice(0, 3).join("”, “")}” saanman sa site na ito.`,
    emailLabel: "I-email si Aldwin",
    contactLabel: "Buksan ang contact page",
    linkedinLabel: "Mag-message sa LinkedIn",
    emailBody: (q) =>
      `Hello Aldwin,\n\nGumamit ako ng portfolio assistant mo at tinanong ko:\n"${q}"\n\nHindi ito nasagot, kaya direkta akong nagme-message sa iyo.\n\nSalamat!`,
    starters: (p) => [
      "Ano ang specialty ni Aldwin?",
      p ? `Ikuwento mo ang ${p}` : "Anu-ano ang mga proyekto ni Aldwin?",
      "Ano ang cloud at DevOps experience niya?",
      "Bukas ba si Aldwin sa trabaho?",
      "Anong mga parangal ang napanalunan niya?",
      "Paano ko siya makokontak?",
    ],
  },
};

export const GUIDE = {
  title: "Ask about Aldwin",
  subtitle: "AI assistant · answers from this portfolio",
  subtitleOffline: "From this portfolio · offline search",
  privacyNote: "Questions are sent to an AI service to write the answer. Please don't share personal information.",
  welcome: STRINGS.en.greeting,
  placeholder: "Ask anything about Aldwin…",
  emailSubject: "A question from your portfolio",
} as const;

export interface KnowledgeEntry {
  id: string;
  question: string;
  questionTl?: string;
  answer: string;
  answerTl?: string;
  keywords: string[];
  link?: { label: string; to: string };
}

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "who",
    question: "Who is John Aldwin Samson?",
    questionTl: "Sino si John Aldwin Samson?",
    answer:
      "John Aldwin R. Samson is a Computer Engineering graduate of Pamantasan ng Lungsod ng Maynila (PLM) specializing in cloud infrastructure, DevOps and site reliability, with a strong foundation in embedded systems and hardware design.",
    answerTl:
      "Si John Aldwin R. Samson ay nagtapos ng Computer Engineering sa Pamantasan ng Lungsod ng Maynila (PLM) na nakatuon sa cloud infrastructure, DevOps at site reliability, na may matibay na pundasyon sa embedded systems at hardware design.",
    keywords: ["who", "introduce", "bio", "background", "profile", "summary", "person", "yourself"],
    link: { label: "Read the about page", to: "/about" },
  },
  {
    id: "why-hire",
    question: "Why should we hire Aldwin?",
    questionTl: "Bakit dapat i-hire si Aldwin?",
    answer:
      "He pairs hands-on cloud and DevOps experience — a multi-AZ AWS environment as code with Terraform and CloudFormation, GitLab CI/CD and ArgoCD GitOps delivery, and a Prometheus, Grafana, Loki and Tempo observability stack — with a real hardware and firmware background in multi-layer PCBs, ESP32 and device-to-cloud telemetry. He also led a five-member thesis team to four awards, so he's used to owning outcomes and working with others.",
    answerTl:
      "Pinagsasama niya ang hands-on na karanasan sa cloud at DevOps — isang multi-AZ na AWS environment as code gamit ang Terraform at CloudFormation, GitLab CI/CD at ArgoCD GitOps delivery, at Prometheus, Grafana, Loki at Tempo observability stack — kasama ang tunay na background sa hardware at firmware sa multi-layer PCBs, ESP32 at device-to-cloud telemetry. Pinangunahan din niya ang limang-miyembrong thesis team hanggang sa apat na parangal, kaya sanay siyang managot sa resulta at makipagtulungan sa iba.",
    keywords: ["hire", "hiring", "why", "strength", "strengths", "choose", "unique", "different", "advantage", "candidate"],
    link: { label: "See his experience", to: "/experience" },
  },
  {
    id: "resume",
    question: "Can I get Aldwin's CV or resume?",
    questionTl: "Puwede ko bang makuha ang CV o resume ni Aldwin?",
    answer:
      "His CV isn't downloadable from this site. Please contact Aldwin personally and he'll send you the latest version.",
    answerTl:
      "Hindi mada-download ang CV niya sa site na ito. Mangyaring makipag-ugnayan kay Aldwin nang personal at ipapadala niya ang pinakabagong bersyon.",
    keywords: ["cv", "resume", "curriculum", "vitae", "download", "pdf", "document"],
    link: { label: "Go to contact", to: "/contact" },
  },
  {
    id: "assistant",
    question: "How does this assistant work?",
    questionTl: "Paano gumagana ang assistant na ito?",
    answer:
      "It is an AI assistant that only knows what is published on this site: Aldwin's experience, projects, skills and certifications. Your question and the recent messages are sent to an AI service, which writes the answer from that content. If the answer is not on the site, it says so and points you to Aldwin's email instead of guessing. If the AI service is unreachable, a built-in search that runs in your browser answers instead.",
    answerTl:
      "Isa itong AI assistant na ang alam lang ay ang nakalathala sa site na ito: ang karanasan, proyekto, skills at sertipikasyon ni Aldwin. Ipinapadala ang tanong mo at ang mga huling mensahe sa isang AI service, na bumubuo ng sagot mula sa nilalamang iyon. Kapag wala sa site ang sagot, sasabihin nito iyon at ituturo ka sa email ni Aldwin sa halip na manghula. Kapag hindi maabot ang AI service, sasagot ang built-in na search na tumatakbo sa browser mo.",
    keywords: ["assistant", "bot", "chatbot", "chatgpt", "gpt", "privacy", "private"],
  },
];
