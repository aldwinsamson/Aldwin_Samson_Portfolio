import { defineProject } from "./_define";

export default defineProject({
  slug: "fault-tolerant-architecture",
  title: "Fault-Tolerant AWS Web Architecture",
  fullTitle: "Three-tier, multi-AZ web architecture on AWS",
  tagline: "A web architecture spread over availability zones, built with Terraform and CloudFormation.",
  summary:
    "A three-tier AWS design built so that losing one availability zone does not take the application down. It has separate public, private and database subnets, load balancers for HTTP and TCP traffic, a multi-AZ database and hardened S3 storage. I built it as my final project at Stratpoint.",
  categories: ["Cloud & DevOps"],
  status: "Completed",
  period: "Jun 2026 – Sep 2026",
  role: "Cloud & DevOps Intern (solo, company task)",
  stack: ["AWS", "Terraform", "CloudFormation", "VPC", "ALB", "NLB", "RDS Multi-AZ", "S3", "KMS"],
  featured: true,
  order: 7,

  cover: {
    src: "/public/images/projects/fault-tolerant-architecture/architecture.webp",
    alt: "Multi-AZ three-tier architecture diagram",
    kind: "authentic",
  },
  gallery: [
    {
      src: "/public/images/projects/fault-tolerant-architecture/architecture.webp",
      alt: "Multi-AZ three-tier architecture diagram",
      caption: "Multi-AZ three-tier architecture diagram",
      kind: "authentic",
    },
  ],

  overview:
    "The goal was a design where each layer survives a failure in another zone, written as code so it can be rebuilt and reviewed.",
  objective: "Design, build and document a resilient web architecture on AWS that follows the Well-Architected Framework.",

  contributions: [
    "Designed the network: separate public, private and database subnets across availability zones, with internet gateways, NAT gateways and route tables.",
    "Set up Application Load Balancers for path-based HTTP and HTTPS routing and Network Load Balancers for TCP traffic to microservices.",
    "Provisioned a multi-AZ Amazon RDS database for the data tier.",
    "Hardened S3 buckets with lifecycle rules, encryption at rest with KMS and cross-region replication.",
    "Wrote the infrastructure as modular Terraform and CloudFormation templates and documented the design.",
  ],

  architecture: [
    { label: "Network", detail: "Public, private and database subnets in each availability zone. NAT gateways give private subnets outbound access." },
    { label: "Traffic", detail: "ALB for path-based HTTP and HTTPS routing. NLB for high-throughput TCP services." },
    { label: "Data", detail: "RDS in a multi-AZ setup, and S3 with lifecycle rules, KMS encryption and cross-region replication." },
  ],

  outcomes: [
    "The whole environment can be created from code, with the design and the steps written down for the next person.",
  ],

    linkNote: "This is an internal company tool, so there is no public link or code.",
});
