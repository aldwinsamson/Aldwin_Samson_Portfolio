import type { Project, ProjectCategory } from "./types";

/**
 * PROJECTS
 * --------
 * To add a project: copy the TEMPLATE at the bottom of this file, fill it in, and add it
 * to the `projects` array. Cards, filters, the homepage showcase and the detail page
 * (/projects/<slug>) are all generated automatically.
 *
 * Honesty rules used here:
 *  - Facts come from the CV / project documentation. No invented metrics.
 *  - Stock imagery is marked `kind: "representative"` and labelled in the UI.
 *  - Repository / demo links are only included when public and approved.
 */

const px = (id: number, w = 1400, h = 900) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export const projectCategories: ProjectCategory[] = [
  "Software",
  "Embedded Systems",
  "Hardware",
  "AI",
  "Web Development",
];

export const projects: Project[] = [
  {
    slug: "ligtas",
    title: "L.I.G.T.A.S.",
    fullTitle: "Leakage Identification using Groundwater Testing and AI-Based Sensing",
    tagline: "A remote-controlled flood-detection vessel with live video and AI hazard classification.",
    summary:
      "An amphibious, remote-controlled sensing vehicle built around an ESP32 that measures water conditions and electrical leakage, classifies hazards as “Safe” or “Danger” with a Python ML pipeline, and streams telemetry and live video to a mobile app.",
    categories: ["Embedded Systems", "Hardware", "AI"],
    domain: "hardware",
    status: "Completed",
    period: "Aug 2025 — May 2026",
    role: "Thesis Group Leader & Lead Hardware Developer",
    featured: true,
    cover: {
      src: px(39457985),
      alt: "Representative image: a swollen river flowing through a flooded urban park",
      kind: "representative",
      credit: "Engin Akyurt / Pexels",
    },
    gallery: [
      {
        src: px(18734769),
        alt: "Representative image: a hand holding a populated green circuit board",
        caption: "Representative — custom sensing electronics",
        kind: "representative",
        credit: "Arturo A / Pexels",
      },
      {
        src: px(14562092),
        alt: "Representative image: a flooded road with a submerged bridge",
        caption: "Representative — flood environment the vehicle is designed for",
        kind: "representative",
        credit: "Magda Ehlers / Pexels",
      },
    ],
    overview:
      "L.I.G.T.A.S. is my undergraduate thesis: a mobile sensing node that can be driven into flooded areas to assess hazards — including possible electrical leakage in the water — before people enter.",
    objective:
      "Give responders and residents a safer way to evaluate flood water by sending a remotely operated vessel first, and returning a clear, real-time hazard assessment with live visual context.",
    problem:
      "Flood water can hide electrical leakage and other hazards that are invisible to the eye. Assessing it in person exposes people to the very risk being checked.",
    contributions: [
      "Led and coordinated a five-member engineering team across research, hardware prototyping and system testing toward strict engineering milestones.",
      "Prototyped the remote-controlled amphibious vehicle around an ESP32 microcontroller with custom voltage sensor arrays, operating as a distributed mobile node for environmental testing.",
      "Deployed a Python-based machine learning pipeline that analyzes water conditions and classifies live data streams as “Safe” or “Danger” in real time.",
      "Implemented Wi-Fi data transmission to stream telemetry, classification logs and live video to a dedicated mobile application.",
    ],
    architecture: [
      { label: "Vessel node", detail: "ESP32 controller, custom voltage sensor arrays, onboard camera, RC drive." },
      { label: "Wireless link", detail: "Wi-Fi transport for telemetry, classification logs and live video." },
      { label: "Inference", detail: "Python ML pipeline classifying the live sensor stream as Safe / Danger." },
      { label: "Mobile app", detail: "Dedicated user application for telemetry, hazard status and video." },
    ],
    stack: ["ESP32", "C++ / Arduino IDE", "Custom voltage sensors", "Python", "Machine Learning", "Wi-Fi telemetry", "Live video streaming", "Mobile application"],
    implementation: [
      "Sensor interfacing and firmware on the ESP32 to sample voltage-sensor arrays and drive the vehicle remotely.",
      "Telemetry packaged and transmitted over Wi-Fi alongside the camera feed so operators see conditions and classification together.",
      "Classification results surfaced as simple, unambiguous states — “Safe” or “Danger” — to support quick decisions.",
    ],
    challenges: [
      "Integrating sensitive sensing electronics on a vehicle that operates on water.",
      "Keeping telemetry, classification output and live video usable over a single wireless link.",
      "Coordinating hardware, ML and application work in parallel across a five-person team.",
    ],
    outcomes: [
      "Delivered a working prototype integrating remote control, sensing, ML classification and live video.",
      "Recognized with four awards, including Top 2 Best Thesis (listed below).",
    ],
    awards: ["Top 2 Best Thesis", "Best Thesis Paper", "Best Booth", "Best Poster"],
    linkNote: "Source code and thesis documentation are not publicly published.",
  },
  {
    slug: "kidverse",
    title: "KidVerse",
    fullTitle: "Edutainment Learning Management System",
    tagline: "A full-stack learning platform connecting student and faculty portals.",
    summary:
      "A children's edutainment LMS bridging traditional and digital learning — with a MongoDB data layer, Node.js REST API, and responsive interfaces for class management and resource editing.",
    categories: ["Software", "Web Development"],
    domain: "software",
    status: "Completed",
    period: "Aug 2023 — May 2024",
    role: "Full-Stack Developer",
    featured: true,
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
    linkNote: "Repository visibility is private; screenshots can be added in src/content/projects.ts.",
  },
  {
    slug: "portfolio",
    title: "This Portfolio",
    fullTitle: "Interactive engineering portfolio",
    tagline: "A typed, content-driven React site with an adaptive WebGL hero.",
    summary:
      "The site you're on: React, TypeScript and Three.js with adaptive 3D quality, reduced-motion support, light/dark themes and a local, offline FAQ guide.",
    categories: ["Software", "Web Development"],
    domain: "software",
    status: "In progress",
    period: "2026",
    role: "Designer & Developer",
    featured: false,
    cover: {
      src: px(34212896),
      alt: "Representative image: a workspace with monitors showing code",
      kind: "representative",
      credit: "Jakub Zerdzicki / Pexels",
    },
    gallery: [],
    overview: "A personal portfolio engineered as a small product: content-driven, accessible and built to grow.",
    objective: "Present projects as case studies while demonstrating front-end engineering and design discipline.",
    problem: "Generic templates don't communicate how software and hardware work fits together.",
    contributions: [
      "Designed the visual system, motion tokens and responsive layouts.",
      "Built an adaptive Three.js particle hero with capability detection and static fallbacks.",
      "Structured all content as typed data so new work can be added without touching layouts.",
    ],
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Three.js", "Motion"],
    implementation: [
      "Quality tiers chosen from device signals, then lowered further if frame rate drops.",
      "Rendering pauses when the hero is off-screen or the tab is hidden.",
    ],
    outcomes: ["Built as a typed, content-driven site with tested pure-logic modules; deployment details will be documented once it is live."],
  },
];

/*
 * TEMPLATE — copy into the array above.
 * {
 *   slug: "my-project",
 *   title: "Project Name",
 *   tagline: "One-line description.",
 *   summary: "Two-sentence summary for cards.",
 *   categories: ["Embedded Systems"],
 *   domain: "hardware",
 *   status: "Concept",
 *   period: "2026",
 *   role: "Your role",
 *   featured: false,
 *   cover: { src: "/images/my-project.jpg", alt: "…", kind: "authentic" },
 *   gallery: [],
 *   overview: "…", objective: "…", problem: "…",
 *   contributions: ["…"], stack: ["…"], implementation: ["…"], outcomes: ["…"],
 *   links: { repository: { label: "GitHub", href: "https://github.com/aldwinsamson/…" } },
 * },
 */

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

/** Pure filter used by the Projects page (unit-tested in tests/). */
export function filterProjects(list: Project[], query: string, category: ProjectCategory | "All"): Project[] {
  const q = query.trim().toLowerCase();
  return list.filter((p) => {
    const inCategory = category === "All" || p.categories.includes(category);
    if (!inCategory) return false;
    if (!q) return true;
    const haystack = [p.title, p.fullTitle, p.tagline, p.summary, p.role, ...p.stack, ...p.categories]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return q.split(/\s+/).every((term) => haystack.includes(term));
  });
}
