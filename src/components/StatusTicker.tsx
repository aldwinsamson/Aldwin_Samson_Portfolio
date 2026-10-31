import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, Clock, Wifi } from "lucide-react";
import { profile } from "@/content/profile";
import { ease } from "@/styles/motion";

/**
 * StatusTicker — a live-feeling ambient bar.
 * Shows local time in Manila, location, and availability.
 * Updates every minute. No API calls — just local Date math.
 *
 *  variant="ticker" (default) → compact, rotates through the items (phones).
 *  variant="readable"         → desktop / landscape: always visible, larger, high-contrast text.
 */
function getManilaTime() {
  const now = new Date();
  const manila = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const hours = manila.getHours();
  const mins = String(manila.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  const isBusinessHours = hours >= 8 && hours < 22;
  return { time: `${h12}:${mins} ${ampm}`, isBusinessHours, hours };
}

export function StatusTicker({ className, variant = "ticker" }: { className?: string; variant?: "ticker" | "readable" }) {
  const [{ time, isBusinessHours }, setTime] = useState(getManilaTime);

  useEffect(() => {
    const id = setInterval(() => setTime(getManilaTime()), 60_000);
    return () => clearInterval(id);
  }, []);

  const items = [
    {
      icon: <MapPin className="size-3" />,
      text: profile.location,
    },
    {
      icon: <Clock className="size-3" />,
      text: `${time} Manila`,
    },
    {
      icon: <Wifi className="size-3" />,
      text: isBusinessHours ? "Likely online" : "Probably offline",
    },
  ];

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (variant === "readable") return; // the pill shows everything at once — no rotation needed
    const id = setInterval(() => setActive((i) => (i + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [items.length, variant]);

  const dot = (size: string) => (
    <span className={`relative flex ${size}`}>
      <span
        className={`absolute inline-flex size-full rounded-full motion-reduce:hidden ${isBusinessHours ? "animate-ping bg-emerald-500/60" : "bg-amber-500/40"}`}
      />
      <span className={`relative inline-flex ${size} rounded-full ${isBusinessHours ? "bg-emerald-500" : "bg-amber-500"}`} />
    </span>
  );

  /* Desktop / landscape — high-contrast and always fully visible (no rotating text).
     Wide screens: two stacked lines in the left corner. Narrower landscape: one centred line above the contact bar. */
  if (variant === "readable") {
    const status = isBusinessHours ? "Likely online" : "Probably offline";
    return (
      <div
        role="status"
        aria-label={`${status}, ${time} Manila time, ${profile.location}`}
        className={`t-meta flex items-center gap-x-3 gap-y-1 rounded-full border border-line bg-bg/55 px-4 py-2 text-[0.78rem] leading-none backdrop-blur-md min-[1320px]:flex-col min-[1320px]:items-start min-[1320px]:gap-y-1.5 min-[1320px]:rounded-2xl min-[1320px]:border-transparent min-[1320px]:bg-transparent min-[1320px]:px-0 min-[1320px]:py-0 min-[1320px]:backdrop-blur-none ${className ?? ""}`}
      >
        <span className="inline-flex items-center gap-2 font-medium text-ink">
          {dot("size-2.5")}
          {status}
        </span>
        <span aria-hidden="true" className="h-3 w-px bg-line-strong min-[1320px]:hidden" />
        <span className="inline-flex items-center gap-1.5 text-ink-soft min-[1320px]:pl-[1.125rem]">
          <Clock className="size-3.5 text-accent" aria-hidden="true" />
          {time} Manila
        </span>
      </div>
    );
  }

  return (
    <div className={`t-meta inline-flex items-center gap-2 text-[0.6rem] text-muted sm:text-[0.66rem] ${className ?? ""}`}>
      {dot("size-2")}

      <AnimatePresence mode="wait">
        <motion.span
          key={active}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.3, ease: ease.lux }}
          className="inline-flex items-center gap-1.5"
        >
          {items[active].icon}
          {items[active].text}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}