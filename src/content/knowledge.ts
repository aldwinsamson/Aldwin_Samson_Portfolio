/**
 * PORTFOLIO GUIDE — curated knowledge base.
 * The guide is a LOCAL keyword search over these entries. It does not call any AI
 * service, never sends data anywhere, and only answers from what is written here.
 * Edit / add entries freely; keep answers factual.
 */
export interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  link?: { label: string; to: string };
}

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "who",
    question: "Who is John Aldwin Samson?",
    answer:
      "John Aldwin R. Samson is a Computer Engineering graduate from Pamantasan ng Lungsod ng Maynila specializing in cloud infrastructure, DevOps and site reliability, with a foundation in embedded systems and hardware design.",
    keywords: ["who", "about", "john", "aldwin", "samson", "introduce", "yourself", "background", "bio"],
    link: { label: "Read the about page", to: "/about" },
  },
  {
    id: "roles",
    question: "What roles is he looking for?",
    answer:
      "He's pursuing Cloud, DevOps and SRE roles, as well as embedded systems and hardware engineering roles — with full-stack development and applied AI as connected strengths.",
    keywords: ["role", "job", "looking", "hire", "hiring", "opportunity", "career", "devops", "sre", "position", "available", "open"],
    link: { label: "Get in touch", to: "/contact" },
  },
  {
    id: "ligtas",
    question: "What is L.I.G.T.A.S.?",
    answer:
      "L.I.G.T.A.S. (Leakage Identification using Groundwater Testing and AI-Based Sensing) is his thesis: a remote-controlled amphibious vehicle built around an ESP32 with custom voltage sensors, a Python ML pipeline that classifies water as “Safe” or “Danger”, and Wi-Fi streaming of telemetry and live video to a mobile app. He was thesis group leader and lead hardware developer.",
    keywords: ["ligtas", "thesis", "flood", "boat", "vehicle", "amphibious", "leakage", "water", "hazard", "sensing", "groundwater"],
    link: { label: "Open the L.I.G.T.A.S. case study", to: "/projects/ligtas" },
  },
  {
    id: "awards",
    question: "Has he won any awards?",
    answer:
      "Yes — L.I.G.T.A.S. was recognized as Top 2 Best Thesis and received Best Thesis Paper, Best Booth and Best Poster. Academically, he was on the Dean's List at PLM.",
    keywords: ["award", "awards", "won", "recognition", "achievement", "honor", "honors", "best", "deans", "list"],
  },
  {
    id: "kidverse",
    question: "What is KidVerse?",
    answer:
      "KidVerse is a children's edutainment learning management system. As full-stack developer he built the architecture, a MongoDB data layer, Node.js REST endpoints connecting student and faculty portals, and the responsive UI.",
    keywords: ["kidverse", "lms", "learning", "management", "education", "edutainment", "student", "faculty", "web", "app"],
    link: { label: "Open the KidVerse case study", to: "/projects/kidverse" },
  },
  {
    id: "internship",
    question: "Where did he intern?",
    answer:
      "He completed two internships. At Stratpoint Technologies (June–September 2026, Mandaluyong) he was a Cloud & DevOps Engineer Intern working on multi-AZ AWS infrastructure as code, GitLab CI/CD and ArgoCD delivery, and Prometheus/Grafana/Loki/Tempo observability. At USHER Technologies Inc. (January–March 2026, Makati) he was a Hardware Engineer Intern designing multi-layer PCBs in KiCAD and writing ESP32 and Raspberry Pi firmware.",
    keywords: ["intern", "internship", "stratpoint", "usher", "experience", "work", "company", "job", "makati", "mandaluyong", "employment"],
    link: { label: "See the experience timeline", to: "/experience" },
  },
  {
    id: "cloud",
    question: "What cloud and DevOps experience does he have?",
    answer:
      "During his Cloud & DevOps internship at Stratpoint Technologies he built a three-tier, multi-AZ AWS architecture with Terraform and CloudFormation, set up GitLab CI/CD pipelines, managed ArgoCD on Kubernetes for GitOps delivery, and deployed a Prometheus, Grafana, Loki and Tempo observability stack with alerting.",
    keywords: ["cloud", "aws", "devops", "terraform", "cloudformation", "kubernetes", "argocd", "gitops", "gitlab", "cicd", "pipeline", "docker", "observability", "monitoring", "prometheus", "grafana", "sre", "infrastructure"],
    link: { label: "See the experience timeline", to: "/experience" },
  },
  {
    id: "embedded",
    question: "What embedded and hardware skills does he have?",
    answer:
      "ESP32 and Raspberry Pi firmware in C/C++ over I2C, SPI and UART, multi-layer PCB design in KiCAD, SMD assembly and bench validation, and MQTT/REST device-to-cloud connectivity. He has also completed embedded ML training with Edge Impulse and the Arduino Nano 33 BLE Sense.",
    keywords: ["embedded", "hardware", "esp32", "raspberry", "pi", "arduino", "firmware", "circuit", "schematic", "pcb", "sensor", "iot", "microcontroller"],
    link: { label: "View the full stack", to: "/stack" },
  },
  {
    id: "software",
    question: "What programming languages and software tools does he use?",
    answer:
      "Python, Bash, JavaScript and TypeScript (Node.js, Express, React) and C/C++; PostgreSQL, MySQL and MongoDB for data; and REST APIs for services.",
    keywords: ["language", "languages", "programming", "python", "bash", "javascript", "typescript", "react", "node", "software", "stack", "skills", "tools", "mongodb", "postgres", "git", "code"],
    link: { label: "View the full stack", to: "/stack" },
  },
  {
    id: "education",
    question: "Where did he study?",
    answer:
      "He studied B.S. Computer Engineering at Pamantasan ng Lungsod ng Maynila (PLM), 2022–2026, and was selected for the Dean's List.",
    keywords: ["study", "school", "university", "education", "degree", "college", "plm", "graduate", "pamantasan"],
  },
  {
    id: "contact",
    question: "How can I contact him?",
    answer:
      "Email aldwinsamsonn@gmail.com, or reach him on LinkedIn and GitHub (@aldwinsamson). The contact page has one-click Gmail compose and copy-email actions.",
    keywords: ["contact", "email", "reach", "message", "linkedin", "github", "talk", "connect", "mail"],
    link: { label: "Go to contact", to: "/contact" },
  },
  {
    id: "guide",
    question: "How does this guide work?",
    answer:
      "It's a simple local search: your question is matched against a short, hand-written list of facts in this website's source code. Nothing is sent to a server or an AI model, and if no entry matches, it says so.",
    keywords: ["guide", "bot", "chatbot", "ai", "work", "how", "you", "privacy"],
  },
];

const STOPWORDS = new Set(
  "a an and are as at be by can did do does for from has have he him his how i in is it me my of on or so tell that the this to was what where which who why with you your about".split(" "),
);

/** Lowercase, strip punctuation, drop stopwords, naive singularization. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/(?<=[a-z0-9])[.'’](?=[a-z0-9])/g, "") // "l.i.g.t.a.s" → "ligtas", "what's" → "whats"
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map((t) => (t.length > 4 && t.endsWith("s") ? t.slice(0, -1) : t));
}

export interface GuideResult {
  entry: KnowledgeEntry | null;
  score: number;
  related: KnowledgeEntry[];
}

/** Scores every entry; returns the best match above a minimum confidence, or null. */
export function searchKnowledge(query: string, kb: KnowledgeEntry[] = knowledgeBase): GuideResult {
  const terms = tokenize(query);
  if (terms.length === 0) return { entry: null, score: 0, related: [] };

  const scored = kb
    .map((entry) => {
      const keys = new Set(entry.keywords.flatMap(tokenize));
      const qTokens = new Set(tokenize(entry.question));
      let score = 0;
      for (const t of terms) {
        if (keys.has(t)) score += 2;
        else if (qTokens.has(t)) score += 1;
        else if ([...keys].some((k) => k.length > 3 && (k.startsWith(t) || t.startsWith(k)))) score += 1;
      }
      return { entry, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  const related = scored.slice(1, 4).filter((s) => s.score > 0).map((s) => s.entry);
  if (!best || best.score < 2) return { entry: null, score: best?.score ?? 0, related };
  return { entry: best.entry, score: best.score, related };
}
