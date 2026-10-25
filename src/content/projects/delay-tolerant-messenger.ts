import { defineProject, px } from "./_define";

export default defineProject({
  slug: "Delay-Tolerant Role Aware Messenger",
  title: "Delay-Tolerant Role Aware Messenger",
  fullTitle: "Leakage Identification using Groundwater Testing and AI-Based Sensing",
  tagline: "A remote-controlled flood-detection vessel with live video and AI hazard classification.",
  summary:
    "An amphibious, remote-controlled sensing vehicle built around an ESP32 that measures water conditions and electrical leakage, classifies hazards as “Safe” or “Danger” with a Python ML pipeline, and streams telemetry and live video to a mobile app.",
  categories: ["Embedded Systems", "Hardware", "AI"],
  status: "Completed",
  period: "Aug 2025 — May 2026",
  role: "Thesis Group Leader & Lead Hardware Developer",
  featured: true,
order: 1,
  cover: {
    src: px(39457985),
    alt: "Representative image: a swollen river flowing through a flooded urban park",
    kind: "representative",
    credit: "Engin Akyurt / Pexels",
  },
  gallery: [
    {
      src: px(18734769),
      alt: "Representative image: a hand holding a populated green circuit board",
      caption: "Representative — custom sensing electronics",
      kind: "representative",
      credit: "Arturo A / Pexels",
    },
    {
      src: px(14562092),
      alt: "Representative image: a flooded road with a submerged bridge",
      caption: "Representative — flood environment the vehicle is designed for",
      kind: "representative",
      credit: "Magda Ehlers / Pexels",
    },
  ],
  overview:
    "L.I.G.T.A.S. is my undergraduate thesis: a mobile sensing node that can be driven into flooded areas to assess hazards — including possible electrical leakage in the water — before people enter.",
  objective:
    "Give responders and residents a safer way to evaluate flood water by sending a remotely operated vessel first, and returning a clear, real-time hazard assessment with live visual context.",
  problem:
    "Flood water can hide electrical leakage and other hazards that are invisible to the eye. Assessing it in person exposes people to the very risk being checked.",
  contributions: [
    "Led and coordinated a five-member engineering team across research, hardware prototyping and system testing toward strict engineering milestones.",
    "Prototyped the remote-controlled amphibious vehicle around an ESP32 microcontroller with custom voltage sensor arrays, operating as a distributed mobile node for environmental testing.",
    "Deployed a Python-based machine learning pipeline that analyzes water conditions and classifies live data streams as “Safe” or “Danger” in real time.",
    "Implemented Wi-Fi data transmission to stream telemetry, classification logs and live video to a dedicated mobile application.",
  ],
  architecture: [
    { label: "Vessel node", detail: "ESP32 controller, custom voltage sensor arrays, onboard camera, RC drive." },
    { label: "Wireless link", detail: "Wi-Fi transport for telemetry, classification logs and live video." },
    { label: "Inference", detail: "Python ML pipeline classifying the live sensor stream as Safe / Danger." },
    { label: "Mobile app", detail: "Dedicated user application for telemetry, hazard status and video." },
  ],
  stack: ["ESP32", "C++ / Arduino IDE", "Custom voltage sensors", "Python", "Machine Learning", "Wi-Fi telemetry", "Live video streaming", "Mobile application"],
  implementation: [
    "Sensor interfacing and firmware on the ESP32 to sample voltage-sensor arrays and drive the vehicle remotely.",
    "Telemetry packaged and transmitted over Wi-Fi alongside the camera feed so operators see conditions and classification together.",
    "Classification results surfaced as simple, unambiguous states — “Safe” or “Danger” — to support quick decisions.",
  ],
  challenges: [
    "Integrating sensitive sensing electronics on a vehicle that operates on water.",
    "Keeping telemetry, classification output and live video usable over a single wireless link.",
    "Coordinating hardware, ML and application work in parallel across a five-person team.",
  ],
  outcomes: [
    "Delivered a working prototype integrating remote control, sensing, ML classification and live video.",
    "Recognized with four awards, including Top 2 Best Thesis (listed below).",
  ],
  awards: ["Top 2 Best Thesis", "Best Thesis Paper", "Best Booth", "Best Poster"],
  linkNote: "Source code and thesis documentation are not publicly published.",
});
