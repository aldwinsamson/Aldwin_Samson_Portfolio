import type { SocialLink } from "./types";

export const profile = {
  name: "John Aldwin R. Samson",
  displayName: "John Aldwin Samson",
  givenNames: "John Aldwin",
  firstName: "John Aldwin R.",
  lastName: "Samson",
  shortName: "Aldwin",
  initials: "JAS",
  location: "Metro Manila, Philippines",
  email: "aldwinsamsonn@gmail.com",
  availability: "Open to Cloud, DevOps, SRE & Embedded roles · Hybrid or onsite in Metro Manila · Remote where eligible",

  hero: {
    eyebrow: "Cloud & DevOps · Embedded Systems · Hardware",
    headline: ["Infrastructure that", "ships, scales", "and stays up."],
    accentLine: 1,
    lead:
      "Computer engineer specializing in AWS infrastructure as code, GitOps delivery and observability — with a hardware and firmware background that lets me reason about reliability from the device to the dashboard.",
    primaryCta: { label: "Explore Projects", to: "/projects" },
    secondaryCta: { label: "Contact Me", to: "/contact" },
    tertiaryLink: { label: "View experience & capabilities", to: "/experience" },
  },

  disciplines: [
    { title: "Cloud & IaC", detail: "Multi-AZ AWS architectures built with Terraform and CloudFormation." },
    { title: "CI/CD & GitOps", detail: "GitLab CI/CD pipelines and ArgoCD-driven delivery on Kubernetes." },
    { title: "Observability & SRE", detail: "Prometheus, Grafana, Loki and Tempo for metrics, logs, traces and alerting." },
    { title: "Embedded & IoT", detail: "ESP32 and Raspberry Pi firmware in C/C++ with MQTT and REST connectivity." },
    { title: "Hardware & PCB", detail: "Multi-layer PCB design in KiCAD, SMD assembly and bench validation." },
  ],

  about: {
    short:
      "A cloud and DevOps engineer with a hardware foundation — I build infrastructure that is automated, observable and reliable, from the device to the cloud.",
    paragraphs: [
      "I'm a Computer Engineering graduate of Pamantasan ng Lungsod ng Maynila (PLM) specializing in cloud infrastructure, DevOps and site reliability, with a strong foundation in embedded systems and hardware design.",
      "At Stratpoint Technologies I built a three-tier AWS environment across availability zones with Terraform and CloudFormation, set up GitLab CI/CD and Argo CD for delivery, and ran Prometheus, Grafana, Loki and Tempo for monitoring and tracing. My capstone there was a task manager app that deploys to Kubernetes through Argo CD.",
      "Before that, at USHER Technologies, I designed circuit boards in KiCAD and wrote ESP32 firmware that sends sensor data to the cloud over MQTT and REST.",
      "For my thesis, L.I.G.T.A.S., I led a team of five and built the hardware for a vehicle that tests floodwater for electrical leakage. It won Top 2 Best Thesis, Best Thesis Paper, Best Booth and Best Poster.",
      "I learn by building and running things myself. This site, its hosting setup and the assistant you can chat with are all things I set up. I'm looking for Cloud, DevOps, SRE or embedded roles: hybrid or onsite in Metro Manila, or remote from anywhere I'm eligible to work.",
    ],
    values: [
      { title: "Infrastructure as code", detail: "Repeatable, reviewable, version-controlled environments instead of manual configuration." },
      { title: "Observable by design", detail: "Metrics, logs and traces built in, so problems are found before users find them." },
      { title: "Systems thinking", detail: "Treating the device, the network and the cloud as one system with one reliability story." },
    ],
  },

  contact: {
    heading: "Let's build systems that hold up in the real world.",
    body:
      "I'm open to Cloud, DevOps, SRE and embedded engineering roles, hybrid or onsite in Metro Manila or remote. If you're hiring, or want to talk infrastructure, firmware or a project, send me an email.",
  },
} as const;

export const socials: SocialLink[] = [
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/aldwinsamson",
    handle: "@aldwinsamson",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/john-aldwin-samson-4578a5372/",
    handle: "John Aldwin Samson",
  },
  {
    id: "email",
    label: "Email",
    href: "mailto:aldwinsamsonn@gmail.com",
    handle: "aldwinsamsonn@gmail.com",
  },
];

export const gmailComposeUrl = (subject = "Hello from your portfolio") =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile.email)}&su=${encodeURIComponent(subject)}`;
