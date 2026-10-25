/**
 * Global site configuration.
 * Everything that is "about the website" rather than "about John" lives here.
 */

export type RouterMode = "hash" | "browser";

export const siteConfig = {
  /** Production URL (used for canonical/OG). */
  url: "https://aldwinsamson.com",
  title: "John Aldwin R. Samson",
  titleTemplate: (page: string) => `${page} — John Aldwin R. Samson`,
  description:
    "Cloud, DevOps and SRE engineering with an embedded and hardware foundation. AWS, Terraform, GitOps, observability, IoT and PCB design.",

  /**
   * Router mode.
   *  - "hash"    → URLs like /#/projects. Works on any static host with zero server config.
   *  - "browser" → Clean URLs like /projects (indexable, matches sitemap.xml). Requires the host to
   *                fall back to /index.html — handled by the CloudFront Function in
   *                infra/terraform/modules/static-site/functions/router.js and by docker/nginx.conf.
   */
  routerMode: "browser" as RouterMode,

  /** Feature flags — disabling a feature removes it cleanly from the UI. */
  features: {
    /** Local, offline FAQ search over src/content/knowledge.ts (no external AI). */
    portfolioGuide: true,
    /** Interactive WebGL layer in the hero. Image parallax still works when false. */
    hero3D: true,
    backToTop: true,
    /** Custom dot+ring cursor with magnetic, text and hover modes (fine pointers only). */
    customCursor: true,
    /** Cinematic preloader animation (plays once per session). */
    preloader: true,
    /** Lenis smooth scroll (buttery feel on fine pointer devices). */
    smoothScroll: true,
    /** ⌘K / Ctrl+K command palette for quick navigation. */
    commandPalette: true,
    /** Horizontal scroll gallery for featured projects on homepage. */
    horizontalGallery: true,
  },

  /** Primary navigation (order matters). */
  nav: [
    { label: "Index", to: "/" },
    { label: "Projects", to: "/projects" },
    { label: "Experience", to: "/experience" },
    { label: "Stack", to: "/stack" },
    { label: "About", to: "/about" },
  ],
} as const;
