/**
 * Plain-English explanations of the technologies mentioned on the site.
 * When a visitor asks "What is GitOps?", the assistant gives this definition and then adds
 * how John actually used it (found automatically from his experience and projects).
 * Add a term any time — `aliases` are other words people might type.
 */
export interface GlossaryTerm {
  term: string;
  aliases?: string[];
  definition: string;
  /** Other words used to find how John actually used it (e.g. GitOps → ArgoCD). */
  related?: string[];
}

export const glossary: GlossaryTerm[] = [
  { term: "AWS", aliases: ["Amazon Web Services", "amazon"], definition: "Amazon Web Services — Amazon's cloud platform, offering on-demand computing, storage, networking and database services." },
  { term: "Terraform", aliases: ["HCL"], definition: "An open-source Infrastructure as Code tool: you describe cloud resources in declarative configuration files and Terraform creates and updates them repeatably." },
  { term: "CloudFormation", aliases: ["AWS CloudFormation"], definition: "AWS's native Infrastructure as Code service — you describe resources in templates and AWS builds and updates them together as a stack." },
  { term: "Infrastructure as Code", related: ["Terraform", "CloudFormation"], aliases: ["IaC"], definition: "Managing servers, networks and cloud resources through version-controlled code instead of manual clicking, so environments are repeatable, reviewable and consistent." },
  { term: "CI/CD", aliases: ["CICD", "continuous integration", "continuous delivery", "continuous deployment", "pipeline"], definition: "Continuous Integration / Continuous Delivery — automatically building, testing and releasing code every time it changes." },
  { term: "GitLab CI/CD", aliases: ["GitLab"], definition: "GitLab's built-in automation for building, testing and deploying code through pipelines defined in the repository." },
  { term: "GitHub Actions", aliases: ["actions"], definition: "GitHub's built-in automation for running workflows — such as tests and deployments — when code changes." },
  { term: "ArgoCD", aliases: ["Argo CD", "Argo"], definition: "A GitOps tool for Kubernetes that continuously syncs the cluster to whatever is declared in a Git repository." },
  { term: "GitOps", related: ["ArgoCD", "declarative"], definition: "An operating model where Git is the single source of truth for infrastructure and application state, and automation keeps the live system matching it." },
  { term: "Kubernetes", related: ["ArgoCD"], aliases: ["K8s"], definition: "An open-source platform that runs, scales and heals containerized applications across a cluster of machines." },
  { term: "Docker", aliases: ["container", "containers", "containerization"], definition: "A tool for packaging an application and its dependencies into portable containers that run the same everywhere." },
  { term: "Prometheus", definition: "An open-source monitoring system that collects time-series metrics and drives alerting." },
  { term: "Grafana", definition: "A dashboarding tool for visualizing metrics, logs and traces in one place." },
  { term: "Loki", aliases: ["Grafana Loki"], definition: "Grafana Loki — a log aggregation system that indexes labels rather than full text, which keeps it light and cost-efficient." },
  { term: "Tempo", aliases: ["Grafana Tempo"], definition: "Grafana Tempo — a distributed tracing backend that stores traces so you can follow a request across services." },
  { term: "Alertmanager", definition: "The Prometheus component that groups, de-duplicates and routes alerts to destinations such as webhooks or chat." },
  { term: "OpenTelemetry", aliases: ["OTel"], definition: "A vendor-neutral standard and toolkit for generating metrics, logs and traces from applications." },
  { term: "Observability", related: ["Prometheus", "Grafana", "Loki", "Tempo"], aliases: ["monitoring"], definition: "The ability to understand what a system is doing from its outputs — mainly metrics, logs and traces — so problems are found quickly." },
  { term: "SRE", related: ["observability", "Prometheus", "alerting"], aliases: ["Site Reliability Engineering", "site reliability"], definition: "Site Reliability Engineering — applying software-engineering practices to keep services reliable, scalable and observable." },
  { term: "DevOps", related: ["CI/CD", "Terraform", "pipelines"], definition: "A culture and set of practices that bring development and operations together so software ships faster and more reliably." },
  { term: "Multi-AZ", aliases: ["availability zone", "availability zones", "high availability"], definition: "Running resources across several AWS Availability Zones (separate data centres) so one failure doesn't take the service down." },
  { term: "Load balancer", aliases: ["ALB", "NLB", "application load balancer", "network load balancer"], definition: "Spreads traffic across servers. An ALB routes HTTP/HTTPS by rules such as URL path; an NLB routes TCP traffic at the network layer." },
  { term: "VPC", aliases: ["virtual private cloud", "subnet", "subnets"], definition: "Amazon Virtual Private Cloud — your own logically isolated network in AWS, divided into public and private subnets." },
  { term: "S3", aliases: ["Amazon S3"], definition: "Amazon S3 — scalable object storage, often used for files, backups and static websites." },
  { term: "RDS", aliases: ["Amazon RDS"], definition: "Amazon RDS — managed relational databases on AWS, with automated backups, patching and failover." },
  { term: "KMS", aliases: ["key management service", "encryption"], definition: "AWS Key Management Service — create and control the encryption keys used to protect data." },
  { term: "ESP32", definition: "A low-cost Wi-Fi and Bluetooth microcontroller, very popular for IoT and embedded projects." },
  { term: "Raspberry Pi", aliases: ["raspberry"], definition: "A small, affordable single-board computer that runs Linux — handy for prototyping, edge devices and gateways." },
  { term: "Arduino", aliases: ["Arduino IDE"], definition: "An open-source electronics platform and IDE for programming microcontroller boards." },
  { term: "MQTT", related: ["telemetry", "REST"], definition: "A lightweight publish/subscribe messaging protocol widely used to move sensor data from IoT devices to the cloud." },
  { term: "I2C", definition: "A two-wire serial bus for connecting sensors and other peripherals to a microcontroller." },
  { term: "SPI", definition: "A fast four-wire serial interface used for peripherals such as sensors, displays and memory." },
  { term: "UART", definition: "A simple asynchronous serial interface used for device-to-device communication." },
  { term: "PCB", aliases: ["printed circuit board", "circuit board"], definition: "Printed Circuit Board — the board that mechanically supports and electrically connects a circuit's components." },
  { term: "KiCAD", aliases: ["Eagle", "Autodesk Eagle"], definition: "A free, open-source suite for schematic capture and PCB layout." },
  { term: "SMD", aliases: ["surface mount", "SMD soldering"], definition: "Surface-mount devices — components soldered directly onto the surface of a PCB, rather than through holes." },
  { term: "Firmware", related: ["ESP32", "C/C++", "Raspberry Pi"], definition: "Low-level software that runs directly on a microcontroller or device and controls its hardware." },
  { term: "IoT", related: ["ESP32", "MQTT", "telemetry"], aliases: ["Internet of Things"], definition: "Internet of Things — physical devices with sensors that connect to a network and exchange data." },
  { term: "REST API", aliases: ["REST", "API", "endpoint", "endpoints"], definition: "An API style where clients use standard HTTP methods on resource URLs to read and change data." },
  { term: "MongoDB", aliases: ["NoSQL"], definition: "A document-oriented NoSQL database that stores flexible, JSON-like documents." },
  { term: "PostgreSQL", aliases: ["Postgres", "SQL"], definition: "A powerful open-source relational (SQL) database." },
  { term: "React", aliases: ["ReactJS"], definition: "A JavaScript library for building user interfaces out of reusable components." },
  { term: "TypeScript", definition: "JavaScript with static types, which catches many mistakes before the code ever runs." },
  { term: "Node.js", aliases: ["node", "nodejs", "express"], definition: "A runtime that lets JavaScript run on servers; Express is a popular web framework on top of it." },
  { term: "Python", definition: "A versatile, readable programming language widely used for automation, data work and machine learning." },
  { term: "Three.js", aliases: ["WebGL", "3D"], definition: "A JavaScript library for rendering 3D graphics in the browser using WebGL." },
  { term: "Machine learning", related: ["classification", "Python"], aliases: ["ML", "AI", "artificial intelligence"], definition: "Training models from data so they can make predictions or classifications on new data." },
  { term: "Edge Impulse", aliases: ["TinyML", "embedded ML"], definition: "A platform for building and deploying machine-learning models on small embedded devices." },
];
