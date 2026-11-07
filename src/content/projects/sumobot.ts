import { defineProject } from "./_define";

export default defineProject({
  slug: "sumobot",
  title: "SumoBot",
  fullTitle: "Bluetooth-controlled sumo robot",
  tagline: "A phone-controlled sumo robot that took 2nd place in a school competition.",
  summary:
    "A sumo-fighting robot our team built and drove in our school's competition. An ESP32 runs two DC motors through an L298 motor driver and takes commands from a phone app over Bluetooth. It won 2nd place.",
  categories: ["Embedded Systems", "Hardware"],
  status: "Completed",
  period: "September 2025",
  role: "Hardware engineer & firmware developer (team)",
  stack: ["ESP32", "L298 motor driver", "DC motors", "Bluetooth", "C/C++"],
  order: 11,

  cover: {
    src: "/public/images/projects/sumobot/prototype.webp",
    alt: "The SumoBot robot",
    kind: "authentic",
  },
  gallery: [
    {
      src: "/public/images/projects/sumobot/prototype.webp",
      alt: "The SumoBot robot",
      caption: "The SumoBot robot",
      kind: "authentic",
    },
  ],

  overview:
    "A small robot built to push another robot out of a ring. A person drives it from a phone, so the work was in the hardware, the motor control and a reliable Bluetooth link.",

  contributions: [
    "Part of a team. I handled the hardware engineering and the microcontroller firmware.",
    "Wired the ESP32, the L298 driver and two DC motors, and wrote the code that turns phone commands into motor movement.",
    "Set up the mobile app connection to the robot over Bluetooth.",
  ],

  architecture: [
    { label: "Controller", detail: "ESP32 microcontroller." },
    { label: "Drive", detail: "L298 motor driver and two DC motors." },
    { label: "Control", detail: "A mobile app connected to the robot over Bluetooth." },
  ],

  outcomes: ["Won 2nd place in our school's sumo robot competition."],
  awards: ["2nd place, school sumo robot competition"],
});
