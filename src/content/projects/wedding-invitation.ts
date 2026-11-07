import { defineProject } from "./_define";

export default defineProject({
  slug: "wedding-invitation",
  title: "Wedding Invitation",
  fullTitle: "Custom wedding invitation website",
  tagline: "A password-protected wedding invitation with a prenup slideshow, built for phones first.",
  summary:
    "A custom invitation website for a couple's wedding. Guests enter a password, then see the event details, a prenup photo slideshow with a lightbox and a music toggle. It has light and dark modes and a layout tuned for phones.",
  categories: ["Web Development", "Software"],
  status: "Completed",
  period: "Apr 2026 – Jun 2026",
  role: "Solo designer & developer",
  stack: ["React", "Vite", "Vercel"],
  order: 3,

  cover: {
    src: "/public/images/projects/wedding-invitation/cover.webp",
    alt: "The wedding invitation landing screen",
    kind: "authentic",
  },
  gallery: [
    {
      src: "/public/images/projects/wedding-invitation/cover.webp",
      alt: "The wedding invitation landing screen",
      caption: "The wedding invitation landing screen",
      kind: "authentic",
    },
    {
      src: "/public/images/projects/wedding-invitation/prenup-page.webp",
      alt: "The prenup photo slideshow",
      caption: "The prenup photo slideshow",
      kind: "authentic",
    },
  ],

  overview:
    "A full invitation site for one wedding, with a password gate, event details, and a prenup slideshow. It is designed for phones first, since most guests will open it on one.",
  objective: "Give guests one private page with everything they need, in a design that matches the couple's style.",

  contributions: [
    "Designed the site from wireframes and reference sites, and went through several redesigns before the final look.",
    "Added a password gate so only invited guests can open it. It is there for the couple's privacy.",
    "Built the prenup slideshow with a dark lightbox, a music toggle and the page animations.",
    "Made it work in light and dark mode and tuned the layout for phones, since most guests will open it on one.",
    "Deployed it on Vercel.",
  ],

  outcomes: ["Finished and deployed in June 2026, before the wedding."],

  links: {
    demo: { label: "Open the invitation", href: "https://ace-aps-wedding-invitation.vercel.app/" },
  },
  linkNote: "Source code is private.",
});
