import { defineProject } from "./_define";

/**
 * Split out of "This Portfolio" on purpose, so the cloud work gets its own page.
 * Written for the situation "the site is served by Vercel, the AWS setup stays in the repo as a dormant, switchable option".
 *
 * CONFIRM before you publish this wording:
 *  1. Only say the site "moved to Vercel" after the DNS switch is really done (docs/switch-hosting.md, part B).
 *  2. The "one setting points the domain to AWS or Vercel" sentence is true only once you have done one real switch.
 *  3. The cost figures are the runbook's ESTIMATES. Replace them with your real number (AWS Billing > Cost Explorer, last full month).
 *  4. The lab line says the cluster was built; keep "ran" only if Argo CD and Grafana actually came up for you.
 *  After editing this file run `npm run build:knowledge` (the assistant's knowledge file must match; CI checks it).
 *
 * IMAGES (add later): an architecture diagram works best.
 *   cover: { src: "/images/projects/portfolio-aws-infrastructure/cover.webp", alt: "Architecture diagram of the portfolio hosting", kind: "authentic" },
 */
export default defineProject({
  slug: "portfolio-aws-infrastructure",
  title: "Portfolio Infrastructure on AWS",
  fullTitle: "Terraform-built hosting and delivery for aldwinsamson.com",
  tagline: "Terraform-built S3 and CloudFront hosting with keyless deploys and monitoring. It ran this site and now stays in the repo as a switchable option.",
  summary:
    "The hosting and delivery setup this portfolio ran on first, written as code. Terraform created a private S3 bucket served through CloudFront over HTTPS, GitHub Actions deployed it without stored AWS keys, security checks ran on every change, and a small k3s cluster ran Argo CD, Prometheus and Grafana as a monitoring lab. The site now runs on Vercel's free plan, and the AWS setup stays in the repository so the domain can be pointed back at it.",
  categories: ["Cloud & DevOps"],
  status: "Completed",
  period: "Oct 2026 – Nov 2026",
  role: "Solo: design, Terraform, pipeline and runbook",
  stack: ["AWS", "Terraform", "S3", "CloudFront", "ACM", "Route 53", "CloudWatch", "GitHub Actions", "Checkov", "k3s", "Argo CD", "Prometheus", "Grafana"],
  featured: true,
  order: 9,

  overview:
    "I treated my own site as a production workload. Everything that ran it is in Terraform, the deploy pipeline had no long-lived AWS keys, and the repo has a runbook for deploys, rollbacks, costs and switching hosts.",
  objective: "Host a static site the way I would run a real one: repeatable, private by default, cheap and easy to roll back.",
  problem:
    "A static site does not need a server, but clicking it together in the AWS console would leave nothing repeatable and nothing to review. I wanted the setup to be code that someone else could read and rebuild.",

  contributions: [
    "Wrote the Terraform modules for storage, CDN with security headers, certificate and DNS, monitoring and the GitHub deploy roles, with one environment file holding the project name, domain, region and e-mail.",
    "Set up GitHub Actions to deploy through OIDC, so no AWS access keys are stored in GitHub. Infrastructure changes need my approval in a protected GitHub environment, and the site deploy role can only write one bucket and clear one CloudFront cache.",
    "Added checks to the pipeline: type check, tests, npm audit and Checkov scanning of the Terraform, with every skipped check explained in .checkov.yaml.",
    "Added production monitoring: a health check from six regions, CloudWatch alarms with e-mail alerts, and a monthly budget alert.",
    "Built a small k3s cluster with Argo CD, Prometheus and Grafana to practice GitOps and monitoring.",
    "Wrote a runbook covering deploys, rollback, costs, troubleshooting and switching the domain between AWS and Vercel.",
  ],

  architecture: [
    {
      label: "Hosting",
      detail: "An S3 bucket with public access blocked, served only through CloudFront using origin access control. ACM and Route 53 provide HTTPS on the custom domain.",
    },
    {
      label: "Edge",
      detail: "A CloudFront Function maps clean URLs to index.html for the single-page app, and security headers are set at the edge. The Content Security Policy started in report-only mode and was enforced after I checked the browser console on every page.",
    },
    {
      label: "Deploy",
      detail: "GitHub Actions assumes an AWS role through OIDC. Assets upload first and index.html last, then the cache is invalidated and a smoke test runs.",
    },
    {
      label: "Lab",
      detail: "k3s on a small instance with Argo CD, Prometheus and Grafana, reachable only through AWS Systems Manager and kept separate from the production hosting.",
    },
  ],

  implementation: [
    "Rollback is a re-run of the deploy workflow with an older commit SHA.",
    "Controls I chose to skip, such as a web application firewall and bucket-level KMS, are written down in .checkov.yaml with the reason, instead of being ignored silently.",
    "I chose k3s over EKS because the EKS control plane alone lists at about $73 a month, which a static site cannot justify.",
    "One Terraform setting points the domain at AWS or at Vercel, so the AWS copy can stay deployed but idle.",
  ],

  outcomes: [
    "Ran the live site on this setup from launch until I moved it to Vercel's free plan to cut the monthly bill.",
    "The runbook estimated about $3 a month for production hosting, and about $18 to $20 with the lab running. These were estimates, not a bill.",
    "Moving to Vercel needed a vercel.json for the redirect rules and security headers, a small serverless function for the chatbot, and a DNS change. The site code itself has no AWS-specific parts.",
    "The modules are written so another environment, such as staging, needs a new environment folder and variables file but no module changes. I have not used that yet.",
  ],

  links: {
    repository: { label: "Infrastructure code on GitHub", href: "https://github.com/aldwinsamson/Aldwin_Samson_Portfolio/tree/main/infra" },
  },
});
