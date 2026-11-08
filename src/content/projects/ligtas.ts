import { defineProject } from "./_define";

export default defineProject({
  slug: "ligtas",
  title: "L.I.G.T.A.S.",
  fullTitle: "Leakage Identification using Groundwater Testing and AI-based Sensing",
  tagline: "A remote-controlled amphibious vehicle that checks floodwater for electrical leakage and sends alerts.",
  summary:
    "Floodwater can become energized when power lines fall into it, and flood monitors only track water level. L.I.G.T.A.S. is our thesis prototype: it drives into floodwater, measures voltage, classifies it as Safe or Danger with a Random Forest model (96.54% accuracy on the test set), and alerts responders by SMS and a live dashboard.",
  categories: ["Embedded Systems", "Hardware", "AI"],
  status: "Completed",
  period: "Aug 2025 – May 2026",
  role: "Thesis Group Leader & Lead Hardware Developer",
  stack: ["ESP32", "C/C++", "Python", "Random Forest", "LoRa", "SIM800L GSM", "React", "Spring Boot", "MySQL"],
  featured: true,
  order: 1,

  cover: {
    src: "/images/projects/ligtas/cover.webp",
    alt: "The L.I.G.T.A.S. prototype vehicle",
    kind: "authentic",
  },
  gallery: [
    {
      src: "/images/projects/ligtas/cover.webp",
      alt: "The L.I.G.T.A.S. prototype and controller",
      caption: "The L.I.G.T.A.S. prototype and controller",
      kind: "authentic",
    },
    {
      src: "/images/projects/ligtas/prototype.webp",
      alt: "The L.I.G.T.A.S. prototype vehicle",
      caption: "The L.I.G.T.A.S. prototype vehicle",
      kind: "authentic",
    },
    {
      src: "/images/projects/ligtas/controller.webp",
      alt: "The L.I.G.T.A.S. handheld controller",
      caption: "The L.I.G.T.A.S. handheld controller",
      kind: "authentic",
    },
    {
      src: "/images/projects/ligtas/team.webp",
      alt: "The L.I.G.T.A.S. team",
      caption: "The L.I.G.T.A.S. team",
      kind: "authentic",
    },
  ],

  overview:
    "L.I.G.T.A.S. was our BSCpE thesis at PLM. Five of us built a small amphibious vehicle that can be driven into floodwater, read the voltage in the water, decide whether it is safe, and warn people before they wade in. I led the team and built the hardware and the microcontroller firmware.",
  objective:
    "Detect electrical hazards in floodwater and warn residents and responders in time, using parts a barangay could afford.",
  problem:
    "During floods in the Philippines, damaged power lines can energize the water, which adds an electrocution risk on top of drowning and property damage. Existing flood monitoring tracks water level and rainfall. It does not check for electrical leakage, and it is not mobile.",

  contributions: [
    "Led the five-member team through research, prototyping, testing and the thesis paper, and set the milestones.",
    "Designed and built the vehicle hardware: ESP32 boards, voltage and current sensing, GPS, IMU, a waterproof ultrasonic sensor, motor drivers, LoRa and GSM modules, and the power supply.",
    "Wrote the microcontroller firmware for sensing, motor control and communication on the vehicle and the handheld controller.",
    "Worked with the group on the other parts: the Random Forest model and the web dashboard were built by the team, and my hardware feeds both.",
  ],

  architecture: [
    {
      label: "Vehicle",
      detail:
        "Two ESP32 boards: one for sensing, motion and monitoring, one for communication. Sensors are a ZMPT101B voltage sensor, ACS712 current sensor, JSN-SR04T waterproof ultrasonic sensor, MPU9250 IMU and NEO-6M GPS. Two L298N drivers run the DC motors.",
    },
    {
      label: "Controller",
      detail:
        "A handheld unit with two ESP32 boards, a joystick, tactile switches, a real-time clock, an SD card for logging and a 3.5-inch LCD.",
    },
    {
      label: "Links",
      detail:
        "LoRa (SX1278) carries telemetry and drive commands. A SIM800L GSM module is the backup link and sends SMS alerts. A Wi-Fi camera streams video to a phone.",
    },
    {
      label: "Classifier",
      detail:
        "A Random Forest model using eight features per reading: voltage, voltage squared, a voltage zone, a danger score, a noise estimate, the change since the last reading, a five-reading average and the count of consecutive readings above 30 V.",
    },
  ],

  implementation: [
    "Voltage is sampled every 500 ms. A reading at or above 30 V counts as dangerous, and a three-reading debounce filter keeps a single spike from setting off a false alarm.",
    "The server also marks any reading above 30 V as DANGER before saving it, so a sensor or transmission fault cannot hide a hazard.",
    "The model was trained on 21,095 synthetic voltage samples (6,841 Safe and 14,254 Dangerous) with an 80/20 train and test split.",
    "SMS alerts go to contacts saved on the controller, and phone numbers are masked in the dashboard API.",
  ],

  challenges: [
    "The ZMPT101B reports an averaged (RMS) value, so a few short spikes were missed or misread in testing. The temporal features and the debounce filter reduce this, and the paper lists it as a known limit of the sensor approach.",
    "SMS was the weakest link, with 87.5% of alerts delivered. The paper recommends a backup alert channel.",
    "All testing was done in lab simulations and controlled trials, not in a real flood. The paper names real-flood testing as the next step.",
  ],

  outcomes: [
    "On 4,219 held-out samples the model reached 96.54% accuracy, 97.54% precision, 97.33% recall and a 97.44% F1-score.",
    "End-to-end classification time stayed under 100 ms.",
    "SMS alerts were classified correctly every time and took 5.32 seconds on average from reading to message.",
    "In a survey of 60 residents of flood-prone barangays in Manila, 96.7% found the system useful and 100% would recommend it for community use.",
  ],

  awards: ["Top 2 Best Thesis", "Best Thesis Paper", "Best Booth", "Best Poster"],
});
