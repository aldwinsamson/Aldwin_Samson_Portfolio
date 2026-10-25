import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { spring } from "@/styles/motion";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      transition={spring.ui}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="relative inline-flex size-10 items-center justify-center overflow-hidden rounded-full text-ink-soft transition-colors hover:bg-sunken/70 hover:text-ink sm:size-11"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, opacity: 0, rotate: -40 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 40 }}
          transition={{ duration: 0.3 }}
          className="inline-flex"
        >
          {theme === "dark" ? <Moon className="size-[18px]" aria-hidden="true" /> : <Sun className="size-[18px]" aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
