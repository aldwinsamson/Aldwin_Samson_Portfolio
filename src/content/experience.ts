import type { ExperienceEntry } from "./types";

/**
 * EXPERIENCE & EDUCATION — newest first.
 * Add an entry by appending an object; the timeline renders it automatically.
 * Keep this file in sync with the CV.
 */
export const experience: ExperienceEntry[] = [
  {
    id: "stratpoint-intern",
    organization: "Stratpoint Technologies",
    role: "Cloud & DevOps Engineer Intern",
    type: "Internship",
    location: "Mandaluyong, Philippines",
    start: "Jun 2026",
    end: "Sep 2026",
    summary:
      "Built and documented AWS infrastructure as code, GitOps delivery pipelines and an observability stack for staging and production environments.",
    highlights: [
      "Designed and documented a three-tier, multi-AZ AWS architecture using modular Terraform and CloudFormation.",
      "Segmented the network into public, private and database subnets with Internet and NAT gateways and route tables, following the AWS Well-Architected Framework.",
      "Configured Application Load Balancers for path-based HTTP/HTTPS routing and Network Load Balancers for TCP-layer microservices.",
      "Provisioned multi-AZ Amazon RDS databases and hardened S3 buckets with lifecycle rules, KMS encryption at rest and cross-region replication.",
      "Built GitLab CI/CD pipelines for static analysis, automated testing, artifact bundling and container image builds.",
      "Installed and managed ArgoCD on Kubernetes for declarative Git-to-cluster synchronization, including blue/green rollout strategies.",
      "Deployed a Loki, Grafana, Tempo and Prometheus stack with dashboards for CPU, memory, network, p95/p99 latency and error rates; configured Alertmanager webhooks and correlated Loki logs with Tempo traces.",
    ],
    skills: ["AWS", "Terraform", "CloudFormation", "GitLab CI/CD", "ArgoCD", "Kubernetes", "Prometheus", "Grafana", "Loki", "Tempo"],
  },
  {
    id: "usher-intern",
    organization: "USHER Technologies Inc.",
    role: "Hardware Engineer Intern",
    type: "Internship",
    location: "Makati, Philippines",
    start: "Jan 2026",
    end: "Mar 2026",
    summary:
      "Hardware and firmware work on commercial structural-health and vibration monitoring devices, from PCB layout to device-to-cloud connectivity.",
    highlights: [
      "Designed, routed and bench-tested multi-layer PCBs in KiCAD for real-time structural-health and vibration monitoring devices.",
      "Sourced components, prepared the bill of materials and coordinated with PCB fabrication houses for manufacturing runs.",
      "Performed SMD soldering, hardware validation, oscilloscope frequency analysis and signal-integrity testing.",
      "Wrote C/C++ firmware for ESP32 and Raspberry Pi boards to collect sensor telemetry over I2C and SPI.",
      "Implemented on-chip buffering, edge sanity checks and packet serialization to send metrics over MQTT and REST.",
      "Worked with the software team on hardware-to-cloud integration, resolved peripheral driver deadlocks and improved board power efficiency by 22%.",
    ],
    skills: ["KiCAD", "PCB design", "ESP32", "Raspberry Pi", "C/C++", "I2C / SPI", "MQTT"],
  },
  {
    id: "ligtas-thesis",
    organization: "Project L.I.G.T.A.S. — Thesis",
    role: "Thesis Group Leader & Lead Hardware Developer",
    type: "Project",
    start: "Aug 2025",
    end: "May 2026",
    summary:
      "Led a five-member team building an ESP32-based amphibious sensing vehicle with ML hazard classification and live mobile telemetry.",
    highlights: [
      "Recognized with Top 2 Best Thesis, Best Thesis Paper, Best Booth and Best Poster awards.",
      "Coordinated research, hardware prototyping and system testing milestones across a five-member team.",
    ],
    skills: ["Team leadership", "ESP32", "Python", "Machine learning", "Wi-Fi telemetry"],
  },
  {
    id: "kidverse",
    organization: "KidVerse LMS",
    role: "Full-Stack Developer",
    type: "Project",
    start: "Aug 2023",
    end: "May 2024",
    summary: "Built the architecture, MongoDB data layer, Node.js REST API and responsive UI for a children's edutainment LMS.",
    highlights: ["Student and faculty portals connected through secure REST endpoints."],
    skills: ["Node.js", "MongoDB", "REST APIs", "JavaScript"],
  },
];

export const education: ExperienceEntry[] = [
  {
    id: "plm",
    organization: "Pamantasan ng Lungsod ng Maynila (PLM)",
    role: "B.S. Computer Engineering",
    type: "Education",
    location: "Manila, Philippines",
    start: "Aug 2022",
    end: "Aug 2026",
    summary: "Bachelor of Science in Computer Engineering (BSCpE).",
    highlights: ["Dean's Lister, College of Engineering and Technology."],
    skills: [],
  },
  {
    id: "au",
    organization: "Arellano University (AU)",
    role: "Senior High School — STEM Strand",
    type: "Education",
    location: "Manila, Philippines",
    start: "Jul 2020",
    end: "Aug 2022",
    summary: "Science, Technology, Engineering and Mathematics strand.",
    highlights: ["Graduated With High Honors."],
    skills: [],
  },
];

/**
 * Certifications & training. Only list credentials you can be asked about.
 * When you earn a named certification (e.g. AWS Cloud Practitioner), add it FIRST in this list.
 */
export const certifications: { title: string; detail: string }[] = [
  { title: "Cloud & DevOps", detail: "Training in cloud foundations, server management, network security, Infrastructure as Code, GitOps, and Kubernetes with ArgoCD" },
  { title: "Embedded Machine Learning", detail: "A Hands-on Guide with Edge Impulse and Arduino Nano 33 BLE Sense" },
  { title: "IoT & Embedded Systems", detail: "Technical seminars on ESP32 integration, sensor arrays and hardware prototyping" },
  { title: "Software Development", detail: "Tracks covering full-stack development, RESTful APIs and modern JavaScript frameworks" },
  { title: "Data Security & Privacy", detail: "Safeguarding Your Personal Information: Data Privacy and Your Rights" },
  { title: "Leadership & Agile", detail: "Student Leadership and Agile Project Management Masterclass" },
];

export const honors: { title: string; detail: string }[] = [
  { title: "Top 2 Best Thesis", detail: "Project L.I.G.T.A.S. — plus Best Thesis Paper, Best Booth and Best Poster (2026)" },
  { title: "Dean's Lister", detail: "College of Engineering and Technology, PLM" },
  { title: "Senior High School High Honors", detail: "STEM strand, Arellano University" },
];