import { defineProject } from "./_define";

/**
 * Split out of "This Portfolio" on purpose, so the cloud work gets its own page.
 * CONFIRM: if you move the hosting off AWS, change `status`/outcomes to say so (for example "Ran on AWS from Oct 2026 to Dec 2026").
 * CONFIRM: the cost figures below come from your infra runbook estimate, not from a bill.
 *
 * IMAGES (add later): an architecture diagram works best.
 *   cover: { src: "/images/projects/portfolio-aws-infrastructure/cover.webp", alt: "Architecture diagram of the portfolio hosting", kind: "authentic" },
 */
export default defineProject({
  slug: "portfolio-aws-infrastructure",
  title: "Portfolio Infrastructure on AWS",
  fullTitle: "Terraform-built hosting and delivery for aldwinsamson.com",
  tagline: "Private S3 behind CloudFront, deploys without stored AWS keys, and a small Kubernetes lab for monitoring.",
  summary:
    "The hosting and delivery setup for this portfolio, written as code. Terraform creates a private S3 bucket served through CloudFront over HTTPS, GitHub Actions deploys it without stored AWS keys, security checks run on every change, and a small k3s cluster runs Argo CD, Prometheus and Grafana as a monitoring lab.",
  categories: ["Cloud & DevOps"],
  status: "Completed",
  period: "Oct 2026 – Nov 2026",
  role: "Solo: design, Terraform, pipeline and runbook",
  stack: ["AWS", "Terraform", "S3", "CloudFront", "ACM", "Route 53", "GitHub Actions", "Checkov", "k3s", "Argo CD", "Prometheus", "Grafana"],
  featured: true,
  order: 9,

  overview:
    "I treated my own site as a production workload. Everything that runs it is in Terraform, the deploy pipeline has no long-lived AWS keys, and the repo has a runbook for deploys, rollbacks and costs.",
  objective: "Host a static site the way I would run a real one: repeatable, private by default, cheap and easy to roll back.",
  problem:
    "A static site does not need a server, but clicking it together in the AWS console would leave nothing repeatable and nothing to review. I wanted the setup to be code that someone else could read and rebuild.",

  contributions: [
    "Wrote the Terraform modules for storage, CDN, certificate, DNS and the deploy role, with one variables file holding everything specific to this project.",
    "Set up GitHub Actions to deploy through OIDC, so no AWS access keys are stored in GitHub. The deploy role is limited to a reviewed production environment.",
    "Added checks to the pipeline: type check, tests, npm audit and Checkov scanning of the Terraform.",
    "Wrote a runbook covering deploys, rollback, costs and troubleshooting.",
    "Built and ran a small k3s cluster with Argo CD, Prometheus and Grafana to practice GitOps and monitoring.",
  ],

  architecture: [
    {
      label: "Hosting",
      detail: "An S3 bucket with public access blocked, served only through CloudFront using origin access control. ACM and Route 53 provide HTTPS on the custom domain.",
    },
    {
      label: "Edge",
      detail: "A CloudFront Function maps clean URLs to index.html for the single-page app, and security headers are set at the edge. The Content Security Policy started in report-only mode.",
    },
    {
      label: "Deploy",
      detail: "GitHub Actions assumes an AWS role through OIDC. Assets upload first and index.html last, then the cache is invalidated and a smoke test runs.",
    },
    {
      label: "Lab",
      detail: "k3s on a small instance with Argo CD, Prometheus and Grafana, kept separate from the production hosting.",
    },
  ],

  implementation: [
    "Rollback is a re-run of the deploy workflow with an older commit SHA.",
    "Controls I chose to skip, such as a web application firewall and bucket-level KMS, are written down in .checkov.yaml with the reason, instead of being ignored silently.",
    "I chose k3s over EKS because the EKS control plane alone costs about $73 a month, which a static site cannot justify.",
  ],

  outcomes: [
    "Estimated running cost is about $3 a month for production, and about $18 to $20 with the lab running.",
    "Adding another environment, such as staging, means adding a variables file instead of new code.",
  ],

  links: {
    repository: { label: "Infrastructure code on GitHub", href: "https://github.com/aldwinsamson/Aldwin_Samson_Portfolio/tree/main/infra" },
  },
});
