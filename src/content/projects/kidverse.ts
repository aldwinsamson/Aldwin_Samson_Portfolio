import { defineProject } from "./_define";

export default defineProject({
  slug: "kidverse",
  title: "KidVerse",
  fullTitle: "KidVerse: A Magical World Edutainment for Growing Minds",
  tagline: "A learning management system for nursery and kindergarten students, built for Wesleyan College of Manila.",
  summary:
    "KidVerse is a web platform where children aged 5 to 7 take lessons and quizzes, teachers manage classes and grades, and parents help with enrollment. A five-person team built it for CPE Elective 1 at PLM, with Wesleyan College of Manila as the partner school.",
  categories: ["Web Development", "Software"],
  status: "Completed",
  period: "August 2023 – May 2024",
  role: "Full-Stack Developer",
  stack: ["Node.js", "MongoDB", "REST API", "JavaScript", "HTML/CSS"],
  order: 2,

  cover: {
    src: "/public/images/projects/kidverse/cover.webp",
    alt: "The KidVerse student login page",
    kind: "authentic",
  },
  gallery: [
    {
      src: "/public/images/projects/kidverse/cover.webp",
      alt: "The KidVerse student login page",
      caption: "The KidVerse student login page",
      kind: "authentic",
    },
    {
      src: "/public/images/projects/kidverse/homepage.webp",
      alt: "The KidVerse student homepage",
      caption: "The KidVerse student homepage",
      kind: "authentic",
    },
    {
      src: "/public/images/projects/kidverse/team.webp",
      alt: "The KidVerse team of five",
      caption: "The KidVerse team of five",
      kind: "authentic",
    },
  ],

  overview:
    "KidVerse is an educational platform for children that blends learning with play, giving students and faculty dedicated portals for lessons, quizzes, grades and communication. It was built as a team project for CPE Elective 1 at PLM, with Wesleyan College of Manila as the partner school.",
  objective:
    "Put lessons, quizzes and games on one platform that children can use, that teachers can manage without a developer, and that follows learning standards.",
  problem:
    "Young learners lose focus quickly and most online platforms are not designed for their age. Teachers have limited training with digital tools, and parents struggle to guide online classes while working. Many platforms also favor entertainment over actual learning content.",

  contributions: [
    "Full-stack developer in a five-member team. In the project plan I owned the faculty and student dashboards, the frontend and the backend.",
    "Built the Node.js REST API and the MongoDB data layer for accounts, courses, enrollment, grades, resources and chat.",
    "Built the student and faculty portals: enrollment with faculty approval, course and lesson pages, resource upload by link, a calendar for activities and deadlines, grade entry, and teacher-student chat.",
    "Worked with the team on UI design, testing and the research paper.",
  ],

  architecture: [
    { label: "Roles", detail: "Student (with parent access), Faculty and Admin, each with their own homepage." },
    {
      label: "Student side",
      detail: "Enroll in nursery or kindergarten, open lessons and quizzes (Beginner and Advanced levels), play games, chat with teachers and edit a profile.",
    },
    {
      label: "Faculty side",
      detail: "Approve enrollment requests, manage subjects, add resources, set calendar activities, enter grades and chat with students.",
    },
    {
      label: "Process",
      detail: "Built with Feature-Driven Development, an Agile method, in short rounds: UI design, core features, then testing and bug fixing.",
    },
  ],

  implementation: [
    "Sign-up shows the privacy policy and terms of use before an account is created, since the users are children.",
    "Password recovery sends a one-time code to the user's email.",
    "The game page links out to ABCya, so the team did not build its own game engine.",
  ],

  challenges: [
    "Security was the main concern. The system stores children's data and the team had limited cybersecurity experience, which the paper lists as its first limitation.",
    "Keeping the platform an educational tool first. Too much entertainment weakens the lessons, so lessons and quizzes stayed the main path and games stayed secondary.",
  ],

  outcomes: [
    "Delivered working faculty, student and enrollment flows with chat, a calendar, grades, quizzes and games.",
    "The paper recommends next steps: a screen-time limit that notifies parents, a way for teachers to build their own games and quizzes, and stronger real-time chat.",
  ],

  links: {
    repository: { label: "Source code on GitHub", href:  "https://github.com/aldwinsamson/Kidverse" }
  }
});
