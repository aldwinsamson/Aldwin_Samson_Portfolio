import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";
const STORAGE_KEY = "jas-theme";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readInitial(): Theme {
  if (typeof document === "undefined") return "light";
  // index.html already applied the class before paint — mirror it to avoid a mismatch.
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitial);

  const apply = useCallback((t: Theme, persist: boolean) => {
    const root = document.documentElement;
    root.classList.toggle("dark", t === "dark");
    root.style.colorScheme = t;
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, t);
      } catch {
        /* storage may be unavailable (private mode) — theme still works for the session */
      }
    }
    setThemeState(t);
  }, []);

  // Enable cross-fade transitions only after first paint, so initial load never animates.
  useEffect(() => {
    const id = requestAnimationFrame(() => document.documentElement.classList.add("theme-ready"));
    return () => cancelAnimationFrame(id);
  }, []);

  // Follow OS changes until the visitor makes an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      if (!stored) apply(e.matches ? "dark" : "light", false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [apply]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (t) => apply(t, true),
      toggle: () => apply(theme === "dark" ? "light" : "dark", true),
    }),
    [theme, apply],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
