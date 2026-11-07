import type { ExperienceEntry } from "./types";

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
      "Designed and documented a three-tier, multi-AZ AWS architecture with modular Terraform and CloudFormation.",
      "Split the network into public, private and database subnets, with internet and NAT gateways and route tables, following the AWS Well-Architected Framework.",
      "Set up Application Load Balancers for path-based HTTP and HTTPS routing, and Network Load Balancers for TCP microservices.",
      "Provisioned multi-AZ Amazon RDS databases and hardened S3 buckets with lifecycle rules, KMS encryption at rest and cross-region replication.",
      "Built GitLab CI/CD pipelines for static analysis, tests, artifact bundling and container image builds.",
      "Installed and ran Argo CD on Kubernetes so the cluster stays in sync with Git, and set up blue/green rollout strategies.",
      "Deployed Loki, Grafana, Tempo and Prometheus with dashboards for CPU, memory, network, p95/p99 latency and error rate. Added Alertmanager webhooks and linked Loki logs to Tempo traces.",
      "Capstone: a three-tier task manager built and published by GitLab CI and deployed to Kubernetes by Argo CD, with a Prometheus metrics endpoint.",
    ],
    skills: ["AWS", "Terraform", "CloudFormation", "GitLab CI/CD", "Argo CD", "Kubernetes", "Prometheus", "Grafana", "Loki", "Tempo"],
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
      "Hardware and firmware work on commercial structural-health and vibration monitoring devices, from PCB layout to getting sensor data to the cloud.",
    highlights: [
      "Designed, routed and bench-tested multi-layer PCBs in KiCAD for real-time structural-health and vibration monitoring devices.",
      "Sourced components, prepared the bill of materials and worked with PCB fabrication houses on production runs.",
      "Soldered SMD parts and validated boards with an oscilloscope, including frequency analysis and signal-integrity checks.",
      "Wrote C/C++ firmware for ESP32 and Raspberry Pi boards that reads sensors over I2C and SPI.",
      "Added on-chip buffering, basic sanity checks on sensor data and packet serialization, and sent the data out over MQTT and REST.",
      "Worked with the software team on the device-to-cloud connection and fixed peripheral driver deadlocks.",
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
      "Led a team of five that built an ESP32-based amphibious vehicle to test floodwater for electrical leakage, with ML classification and SMS alerts.",
    highlights: [
      "Led research, prototyping, testing and the thesis paper for a team of five.",
      "Built the vehicle and controller hardware and wrote the microcontroller firmware.",
      "The Random Forest model reached 96.54% accuracy on 4,219 held-out samples, and classification took under 100 ms.",
      "Won Top 2 Best Thesis, Best Thesis Paper, Best Booth and Best Poster.",
    ],
    skills: ["Team leadership", "ESP32", "C/C++", "Python", "Machine learning", "LoRa", "GSM"],
  },
  {
    id: "kidverse",
    organization: "KidVerse LMS",
    role: "Full-Stack Developer",
    type: "Project",
    start: "Aug 2023",
    end: "May 2024",
    summary:
      "Built the backend, database and portals of a learning platform for nursery and kindergarten students at Wesleyan College of Manila.",
    highlights: [
      "Built the Node.js REST API and the MongoDB data layer for accounts, courses, enrollment, grades and chat.",
      "Built the student and faculty portals: enrollment with faculty approval, lessons and quizzes, a calendar, grade entry and teacher-student chat.",
    ],
    skills: ["Node.js", "MongoDB", "REST APIs", "JavaScript"],
  },
];

export const education: ExperienceEntry[] = [
  {
    id: "plm",
    organization: "Pamantasan ng Lungsod ng Maynila (PLM)",
    role: "Bachelor of Science in Computer Engineering",
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

export const certifications: { title: string; detail: string }[] = [
  { title: "AWS Fundamentals", detail: "Course certificate" },
  { title: "Cloud & DevOps training", detail: "Cloud foundations, server management, network security, Infrastructure as Code, GitOps, and Kubernetes with Argo CD" },
  { title: "Embedded machine learning", detail: "Hands-on course with Edge Impulse and the Arduino Nano 33 BLE Sense" },
  { title: "IoT & embedded systems seminars", detail: "ESP32 integration, sensor arrays and hardware prototyping" },
  { title: "Software development courses", detail: "Full-stack development, RESTful APIs and modern JavaScript frameworks" },
  { title: "Data privacy", detail: "Safeguarding Your Personal Information: Data Privacy and Your Rights" },
  { title: "Leadership & Agile", detail: "Student Leadership and Agile Project Management Masterclass" },
];

export const honors: { title: string; detail: string }[] = [
  { title: "Top 2 Best Thesis", detail: "Project L.I.G.T.A.S., which also won Best Thesis Paper, Best Booth and Best Poster (2026)" },
  { title: "2nd place, school sumo robot competition", detail: "SumoBot, a phone-controlled sumo robot" },
  { title: "Dean's Lister", detail: "College of Engineering and Technology, PLM" },
  { title: "Senior High School High Honors", detail: "STEM strand, Arellano University" },
];
