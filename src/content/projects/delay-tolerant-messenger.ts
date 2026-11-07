import { defineProject } from "./_define";

export default defineProject({
  slug: "delay-tolerant-messenger",
  title: "Delay-Tolerant Role-Aware Messenger",
  fullTitle: "DTRM: a LoRa field messenger that stores and forwards messages",
  tagline: "A battery-powered LoRa messenger that keeps messages until someone is in range.",
  summary:
    "DTRM is a field messenger built on an Arduino Uno and a LoRa module. A user presses a button to send one of four preset messages. If a receiver is in range it shows right away, and if not, the message is saved and sent when another device or gateway appears. We built it for the Armed Forces of the Philippines as the intended user.",
  categories: ["Embedded Systems", "Hardware"],
  status: "Completed",
  period: "October 2025",
  role: "Hardware engineer & firmware developer (team of 8)",
  stack: ["Arduino Uno R3", "LoRa 433 MHz", "SD card module", "C/C++"],
  order: 10,

  cover: {
    src: "/public/images/projects/delay-tolerant-messenger/prototype.webp",
    alt: "The DTRM unit in its clear case with a 433 MHz antenna",
    kind: "authentic",
  },
  gallery: [
    {
      src: "/public/images/projects/delay-tolerant-messenger/prototype.webp",
      alt: "The DTRM unit in its clear case with a 433 MHz antenna",
      caption: "The DTRM unit in its clear case with a 433 MHz antenna",
      kind: "authentic",
    },
    {
      src: "/public/images/projects/delay-tolerant-messenger/team.webp",
      alt: "The DTRM team of eight, with our prototype",
      caption: "The DTRM team of eight, with our prototype",
      kind: "authentic",
    },
  ],

  overview:
    "Field teams often work where there is no mobile signal or internet. DTRM is a small unit that sends short, predefined messages over LoRa and does not lose them when nobody is in range.",
  objective: "Keep vital messages moving in areas with limited or unstable connectivity, using affordable parts that are easy to buy locally.",
  problem:
    "Normal messaging fails without a stable network. In field and emergency work a message such as SAFE or SEND HELP still has to arrive, even if it arrives late.",

  contributions: [
    "Part of Group, a team of eight. I handled the hardware engineering and the microcontroller firmware.",
    "Assembled the hardware: an Arduino Uno R3, a LoRa module with a 433 MHz antenna, tactile buttons, an SD card module and a battery, in a clear case.",
    "Wrote the firmware that encodes a button press, sends it over LoRa, and keeps the message in storage when no receiver answers.",
  ],

  architecture: [
    { label: "Messages", detail: "Four preset messages: SAFE, SEND HELP, ENEMY SPOTTED and AFFIRMATIVE." },
    { label: "Modes", detail: "Real-time delivery when a receiver is in range, and delay-tolerant store-and-forward when it is not." },
    { label: "Priority", detail: "Messages are prioritized by the sender's role." },
    { label: "Hardware", detail: "Arduino Uno R3, LoRa module, 433 MHz antenna and cable, tactile buttons, SD card module, battery and case." },
  ],

  implementation: [
    "A message that cannot be delivered is stored. When another device or a gateway is detected, it is forwarded automatically.",
    "No internet or mobile network is needed. LoRa handles the radio link between nearby units.",
  ],

  outcomes: [
    "Delivered a working prototype that combines real-time and delay-tolerant messaging in one low-cost unit.",
  ],
});
