import { defineProject } from "./_define";

export default defineProject({
  slug: "uw-management-system",
  title: "UW Management System",
  fullTitle: "Inventory, purchase request and purchase order system",
  tagline: "An internal web system for inventory control, purchase requests and purchase orders.",
  summary:
    "A management system built for a company to track inventory and handle purchase requests and purchase orders across several modules: USHER, WEHLO, USHERETTE, HOCLOMAC and an ALL view. The aim was more accurate stock records and fewer entry errors. Built by a team, with the frontend as my part.",
  categories: ["Software", "Web Development"],
  status: "Completed",
  period: "Jan 2026 – Mar 2026",
  role: "Frontend developer (team, company task)",
  stack: ["Web frontend"],
  order: 6,

  cover: {
    src: "/images/projects/uw-management-system/cover.webp",
    alt: "The UW Management System interface",
    kind: "authentic",
  },
  gallery: [
    {
      src: "/images/projects/uw-management-system/cover.webp",
      alt: "The UW Management System interface",
      caption: "The UW Management System interface",
      kind: "authentic",
    },
    {
      src: "/images/projects/uw-management-system/homepage.webp",
      alt: "The UW Management System inventory screen",
      caption: "The UW Management System inventory screen",
      kind: "authentic",
    },
  ],

  overview:
    "Inventory, purchase requests and purchase orders were handled separately for each business module. The system brings them into one place so the same item is not entered, counted or ordered twice.",
  objective: "Make inventory control and purchasing more accurate and cut down on manual entry mistakes.",

  contributions: [
    "Worked in a team on a company task, as a frontend developer.",
    "Built the screens users work in for inventory, purchase requests and purchase orders.",
    "Followed the planning document the team wrote first: purpose, modules and workflow before any screens.",
  ],

  architecture: [
    { label: "Modules", detail: "USHER, WEHLO, USHERETTE, HOCLOMAC, and an ALL view across them." },
    { label: "Functions", detail: "Inventory control, purchase requests and purchase orders." },
  ],

  linkNote: "This is an internal company tool, so there is no public link or code.",
});
