import type { SocialLink } from "./types";

/**
 * Personal profile content. Facts come from John's CV.
 * Private details (phone number, street address) are intentionally NOT published.
 */
export const profile = {
  name: "John Aldwin R. Samson",
  /** The name shown in the hero + preloader. */
  displayName: "John Aldwin Samson",
  givenNames: "John Aldwin",
  firstName: "John Aldwin R.",
  lastName: "Samson",
  shortName: "Aldwin",
  initials: "JAS",
  location: "Metro Manila, Philippines",
  email: "aldwinsamsonn@gmail.com",
    availability: "Open to Cloud, DevOps, SRE & Embedded roles",

  hero: {
    eyebrow: "Cloud & DevOps · Embedded Systems · Hardware",
    headline: ["Infrastructure that", "ships, scales", "and stays up."],
    /** Index of the headline line rendered in italic champagne. */
    accentLine: 1,
    lead:
      "Computer engineer specializing in AWS infrastructure as code, GitOps delivery and observability — with a hardware and firmware background that lets me reason about reliability from the device to the dashboard.",
    primaryCta: { label: "Explore Projects", to: "/projects" },
    secondaryCta: { label: "Contact Me", to: "/contact" },
    tertiaryLink: { label: "View experience & capabilities", to: "/experience" },
  },

  disciplines: [
    { title: "Cloud & IaC", detail: "Multi-AZ AWS architectures provisioned with Terraform and CloudFormation." },
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
      "As a Cloud & DevOps Engineer Intern at Stratpoint Technologies, I built a multi-AZ, three-tier AWS environment with Terraform and CloudFormation, automated delivery with GitLab CI/CD and ArgoCD, and deployed a Prometheus, Grafana, Loki and Tempo stack for monitoring, alerting and distributed tracing.",
      "Before that, as a Hardware Engineer Intern at USHER Technologies, I designed and tested multi-layer PCBs in KiCAD and wrote ESP32 firmware that sends sensor data to cloud endpoints over MQTT and REST — which is why I think about reliability across the whole system, from device to dashboard.",
      "I led a five-member team as thesis group leader and lead hardware developer of L.I.G.T.A.S., a remote-controlled amphibious sensing vehicle with ML-based hazard classification, recognized with Top 2 Best Thesis, Best Thesis Paper, Best Booth and Best Poster.",
      "I'm now pursuing Cloud, DevOps, SRE and embedded engineering roles where automation, reliability and clear thinking about whole systems matter.",
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
      "I'm open to Cloud, DevOps, SRE and embedded engineering roles. If you're hiring, or want to talk infrastructure, firmware or a project, I'd be glad to hear from you.",
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

/** Opens Gmail compose in a new tab, pre-addressed. */
export const gmailComposeUrl = (subject = "Hello from your portfolio") =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile.email)}&su=${encodeURIComponent(subject)}`;
