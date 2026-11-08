import { defineProject } from "./_define";

export default defineProject({
  slug: "3-tier-app",
  title: "3-Tier App with GitOps Delivery",
  fullTitle: "Task Manager: React, Node.js and PostgreSQL delivered by GitLab CI and Argo CD",
  tagline: "A three-tier task manager that GitLab CI builds and Argo CD deploys to Kubernetes.",
  summary:
    "My capstone for the Stratpoint DevOps internship. A task manager in three tiers, packaged with Docker, built and published by a GitLab CI pipeline, and deployed to Kubernetes by Argo CD from a separate manifest repository. The backend exposes Prometheus metrics.",
  categories: ["Cloud & DevOps", "Software"],
  status: "Completed",
  period: "Jun 2026 – Sep 2026",
  role: "Cloud & DevOps Intern (solo, company task)",
  stack: ["React", "Node.js", "Express", "PostgreSQL", "Docker", "GitLab CI", "Helm", "Argo CD", "Kubernetes", "Prometheus"],
  featured: true,
  order: 8,

  cover: {
    src: "/images/projects/3-tier-app/architecture.webp",
    alt: "The 3-tier app running in a Kubernetes cluster, with the GitLab CI pipeline and Argo CD dashboard in the background",
    kind: "authentic",
  },
  gallery: [
    {
      src: "/images/projects/3-tier-app/architecture.webp",
      alt: "Architecture diagram of the 3-tier app and its GitOps delivery",
      caption: "The 3-tier app and its GitOps delivery.",
      kind: "authentic",
    },
    {
      src: "/images/projects/3-tier-app/website.webp",
      alt: "The 3-tier app running in a Kubernetes cluster.",
      caption: "The 3-tier app running in a Kubernetes cluster.",
      kind: "authentic",
    },
  ],

  overview:
    "The app itself is simple on purpose. The work is in the delivery: a push to main produces versioned container images and an updated deployment config, and the cluster picks it up without anyone running kubectl or helm by hand.",
  objective: "Build a complete path from a code change to a running Kubernetes deployment, with every step automated and traceable.",
  problem:
    "Deploying by hand makes it hard to say what is running or which code produced it. I wanted every deployed image to point back to an exact commit, and I wanted the app repository to have no access to the cluster.",

  contributions: [
    "Wrote a Dockerfile for the frontend and the backend, plus a docker-compose file that runs the full stack locally with one command.",
    "Built the GitLab CI pipeline: two parallel jobs build and push the images, tagged with the commit SHA, then a second stage updates the image tags in the manifest repository.",
    "Kept the Helm chart and Kubernetes config in a separate manifest repository that Argo CD watches, so the app repository never touches the cluster.",
    "Added a /metrics endpoint to the Express backend with prom-client, for Prometheus.",
    "Stored the database password in a Kubernetes Secret, and kept the SSH key for the manifest push in a masked CI variable.",
  ],

  architecture: [
    { label: "Frontend", detail: "React task list UI, in its own container." },
    { label: "Backend", detail: "Node.js and Express REST API with a Prometheus metrics endpoint." },
    { label: "Database", detail: "PostgreSQL 17, with the schema and seed data in init.sql." },
    {
      label: "Delivery",
      detail: "GitLab CI builds and pushes images to the GitLab Container Registry, then commits new tags to the manifest repo. Argo CD syncs the cluster to that repo.",
    },
  ],

  implementation: [
    "Images are tagged with the short commit SHA instead of latest, so any running image can be traced to the code that built it.",
    "The manifest update commit carries, so it does not start a second pipeline.",
    "The pipeline pushes to the manifest repo with an SSH key. A password in a CI script would end up in job logs, and a key can be revoked without changing the pipeline.",
  ],

  challenges: [
    "The first runner was a shell executor, and the build jobs failed with permission denied on the Docker socket. I switched to a Docker-executor runner and wrote that requirement into the README.",
    "The frontend container still runs the React development server. A production build would be the next improvement.",
  ],

  outcomes: [
    "Every push to main produces images tagged with the commit SHA and an updated manifest, and Argo CD deploys the change without manual kubectl or helm commands.",
  ],

    linkNote: "This is an internal company tool, so there is no public link or code.",
});
