import { defineProject, px } from "./_define";

export default defineProject({
  slug: "kidverse",
  title: "KidVerse",
  fullTitle: "Edutainment Learning Management System",
  tagline: "A full-stack learning platform connecting student and faculty portals.",
  summary:
    "A children's edutainment LMS bridging traditional and digital learning — with a MongoDB data layer, Node.js REST API, and responsive interfaces for class management and resource editing.",
  categories: ["Software", "Web Development"],
  status: "Completed",
  period: "Aug 2023 — May 2024",
  role: "Full-Stack Developer",
  featured: true,
order: 2,
  cover: {
    src: px(5745576),
    alt: "Representative image: a schoolchild typing on a laptop during a lesson",
    kind: "representative",
    credit: "Ryutaro Tsukata / Pexels",
  },
  gallery: [
    {
      src: px(5745517),
      alt: "Representative image: a pupil using a laptop in a computer class",
      caption: "Representative — classroom context",
      kind: "representative",
      credit: "Ryutaro Tsukata / Pexels",
    },
  ],
  overview:
    "KidVerse is an educational platform for children that blends learning with play, giving students and faculty dedicated portals connected by a shared backend.",
  objective:
    "Bridge traditional and digital learning by giving faculty simple tools to manage classes and resources, and students an engaging place to learn.",
  problem:
    "Classroom resources and class management often live in disconnected tools, which makes digital learning harder to adopt for young students and their teachers.",
  contributions: [
    "Conceptualized and built the application architecture and web database.",
    "Engineered a MongoDB data layer to manage user accounts, platform configurations and application assets.",
    "Built backend business logic and secure REST API endpoints in Node.js for data flow between student and faculty portals.",
    "Developed a responsive user interface with modern front-end tools for class management and resource editing.",
  ],
  architecture: [
    { label: "Student portal", detail: "Learning-focused interface for young users." },
    { label: "Faculty portal", detail: "Class management and resource editing." },
    { label: "API", detail: "Node.js business logic exposed through REST endpoints." },
    { label: "Data", detail: "MongoDB for accounts, configuration and assets." },
  ],
  stack: ["Node.js", "MongoDB", "REST APIs", "JavaScript", "HTML", "CSS"],
  implementation: [
    "Role-separated portals for students and faculty backed by a single API.",
    "Account and configuration data modelled in MongoDB collections.",
    "Responsive layouts so the platform works across classroom devices.",
  ],
  outcomes: ["Delivered a working full-stack LMS covering student and faculty experiences."],
  linkNote: "Repository visibility is private; screenshots can be added in src/content/projects/kidverse.ts.",
});
