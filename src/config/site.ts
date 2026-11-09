export type RouterMode = "hash" | "browser";

export const siteConfig = {
  url: "https://aldwinsamson.com",
  title: "John Aldwin R. Samson",
  titleTemplate: (page: string) => `${page} — John Aldwin R. Samson`,
  description:
    "Computer Engineering graduate specializing in cloud infrastructure, DevOps and SRE, with a foundation in embedded systems and hardware design.",

  routerMode: "browser" as RouterMode,

  features: {
    portfolioGuide: true,
    hero3D: true,
    backToTop: true,
    customCursor: false,
    preloader: true,
    smoothScroll: true,
    commandPalette: true,
  },

  nav: [
    { label: "Index", to: "/" },
    { label: "Projects", to: "/projects" },
    { label: "Experience", to: "/experience" },
    { label: "Stack", to: "/stack" },
    { label: "About", to: "/about" },
  ],
} as const;
