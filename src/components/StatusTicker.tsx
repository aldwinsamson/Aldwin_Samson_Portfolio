import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, Clock, Wifi } from "lucide-react";
import { profile } from "@/content/profile";
import { ease } from "@/styles/motion";

/**
 * StatusTicker — a live-feeling ambient bar.
 * Shows local time in Manila, location, and availability.
 * Updates every minute. No API calls — just local Date math.
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

export function StatusTicker({ className }: { className?: string }) {
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
    const id = setInterval(() => setActive((i) => (i + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [items.length]);

  return (
    <div className={`t-meta inline-flex items-center gap-2 text-[0.6rem] text-muted sm:text-[0.66rem] ${className ?? ""}`}>
      <span className="relative flex size-2">
        <span
          className={`absolute inline-flex size-full rounded-full motion-reduce:hidden ${isBusinessHours ? "animate-ping bg-emerald-500/60" : "bg-amber-500/40"}`}
        />
        <span className={`relative inline-flex size-2 rounded-full ${isBusinessHours ? "bg-emerald-500" : "bg-amber-500"}`} />
      </span>

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
