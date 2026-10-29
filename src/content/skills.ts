import type { SkillGroup } from "./types";

/**
 * TECH STACK — grouped by discipline, most relevant first (the homepage shows the first six groups).
 * No proficiency percentages by design; `note` adds honest context where useful.
 * Only list tools you can discuss in an interview.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: "cloud",
    title: "Cloud & Architecture",
    description: "Resilient, secure AWS environments designed across availability zones.",
    icon: "layers",
    items: [
      { name: "AWS", note: "EC2, S3, VPC, ALB/NLB, RDS, Route 53, CloudFront, IAM, CloudWatch" },
      { name: "Multi-AZ architecture", note: "Three-tier design" },
      { name: "Network isolation", note: "Public, private and database subnets, NAT, route tables" },
      { name: "Storage security", note: "KMS encryption, lifecycle, replication" },
    ],
  },
  {
    id: "devops",
    title: "DevOps & GitOps",
    description: "Infrastructure as code and automated, declarative delivery.",
    icon: "terminal",
    items: [
      { name: "Terraform", note: "Modular HCL" },
      { name: "AWS CloudFormation" },
      { name: "GitLab CI/CD & GitHub Actions" },
      { name: "ArgoCD", note: "GitOps on Kubernetes" },
      { name: "Docker & Docker Compose" },
      { name: "Kubernetes" },
      { name: "Linux administration", note: "Ubuntu, Debian" },
    ],
  },
  {
    id: "observability",
    title: "Observability & SRE",
    description: "Seeing what systems are doing, and acting before users notice.",
    icon: "spark",
    items: [
      { name: "Prometheus & Alertmanager" },
      { name: "Grafana dashboards", note: "Latency, errors, saturation" },
      { name: "Grafana Loki & Tempo", note: "Log and trace correlation" },
      { name: "OpenTelemetry", note: "Instrumentation and distributed tracing" },
    ],
  },
  {
    id: "languages",
    title: "Languages & Web",
    description: "The languages I reach for across automation, backends, firmware and the web.",
    icon: "code",
    items: [
      { name: "Python", note: "Automation, ML pipelines" },
      { name: "Bash", note: "Scripting and tooling" },
      { name: "JavaScript & TypeScript", note: "Node.js, Express, React" },
      { name: "C / C++", note: "Embedded firmware" },
      { name: "REST APIs" },
    ],
  },
  {
    id: "data-networking",
    title: "Databases & Networking",
    description: "Persisting data reliably and moving it securely.",
    icon: "database",
    items: [
      { name: "PostgreSQL & MySQL" },
      { name: "MongoDB" },
      { name: "TCP/IP & DNS", note: "OSI model, subnetting, NAT" },
      { name: "TLS/SSL", note: "Encrypted transport" },
    ],
  },
  {
    id: "embedded",
    title: "Embedded Systems & IoT",
    description: "Microcontrollers and single-board computers wired into the physical world.",
    icon: "cpu",
    items: [
      { name: "ESP32 & ESP8266" },
      { name: "Raspberry Pi 4 / Zero" },
      { name: "Arduino Nano 33 BLE", note: "Edge Impulse coursework" },
      { name: "I2C, SPI, UART" },
      { name: "MQTT", note: "Device-to-cloud messaging" },
    ],
  },
  {
    id: "hardware",
    title: "Hardware & PCB Design",
    description: "From schematic to assembled, validated board.",
    icon: "circuit",
    items: [
      { name: "KiCAD & Autodesk Eagle" },
      { name: "Multi-layer PCB layout" },
      { name: "SMD soldering & assembly" },
      { name: "Bench validation", note: "Oscilloscope, signal integrity" },
    ],
  },
];
