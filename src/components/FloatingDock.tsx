import { useRef, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { Briefcase, Home, Layers, Mail, User, Zap } from "lucide-react";
import { useCanHover, useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/utils/cn";

/**
 * FloatingDock — a macOS-style magnifying dock at the bottom of the screen.
 * Icons magnify as the cursor approaches (distance-based scaling).
 * Only visible on larger screens; mobile uses the standard nav.
 */

interface DockItem {
  icon: ReactNode;
  label: string;
  to: string;
}

const items: DockItem[] = [
  { icon: <Home className="size-5" />, label: "Home", to: "/" },
  { icon: <Layers className="size-5" />, label: "Projects", to: "/projects" },
  { icon: <Briefcase className="size-5" />, label: "Experience", to: "/experience" },
  { icon: <Zap className="size-5" />, label: "Stack", to: "/stack" },
  { icon: <User className="size-5" />, label: "About", to: "/about" },
  { icon: <Mail className="size-5" />, label: "Contact", to: "/contact" },
];

export function FloatingDock() {
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const canHover = useCanHover();
  const reduce = useReducedMotion();
  const mouseX = useMotionValue(Infinity);

  if (!isDesktop) return null;

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      aria-label="Quick navigation dock"
      className="fixed inset-x-0 bottom-6 z-[80] flex justify-center"
    >
      <div className="flex items-end gap-2 rounded-2xl border border-line bg-elev/90 px-3 py-2.5 shadow-[var(--shadow)] backdrop-blur-xl">
        {items.map((item) => (
          <DockIcon
            key={item.to}
            item={item}
            mouseX={mouseX}
            active={item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)}
            canHover={canHover && !reduce}
          />
        ))}
      </div>
    </motion.nav>
  );
}

function DockIcon({
  item,
  mouseX,
  active,
  canHover,
}: {
  item: DockItem;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  active: boolean;
  canHover: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const distance = useTransform(mouseX, (val) => {
    if (!ref.current || !canHover) return 150;
    const rect = ref.current.getBoundingClientRect();
    return val - rect.left - rect.width / 2;
  });

  const size = useSpring(
    useTransform(distance, [-120, 0, 120], canHover ? [44, 64, 44] : [44, 44, 44]),
    { stiffness: 250, damping: 20, mass: 0.4 },
  );

  return (
    <Link ref={ref} to={item.to} aria-label={item.label} className="relative" data-cursor="magnetic">
      <motion.div
        style={{ width: size, height: size }}
        className={cn(
          "flex items-center justify-center rounded-xl transition-colors duration-300",
          active
            ? "bg-accent text-accent-ink"
            : "bg-sunken text-ink-soft hover:text-ink",
        )}
      >
        {item.icon}
      </motion.div>
      {active && (
        <motion.span
          layoutId="dock-dot"
          className="absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent"
        />
      )}
    </Link>
  );
}
