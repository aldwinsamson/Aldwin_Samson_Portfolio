import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  CircuitBoard,
  FileText,
  Home,
  Layers,
  Mail,
  Moon,
  Search,
  Sun,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { profile, socials } from "@/content/profile";
import { projects } from "@/content/projects";
import { useTheme } from "@/hooks/useTheme";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { ease } from "@/styles/motion";
import { GitHubIcon, LinkedInIcon } from "./Icons";

/**
 * ⌘K Command Palette — premium quick navigation.
 * Keyboard-driven: ⌘K (Mac) / Ctrl+K (Windows) to open.
 * Fuzzy searches pages, projects, actions and external links.
 */

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: LucideIcon | typeof GitHubIcon;
  action: () => void;
  group: "Navigation" | "Projects" | "Actions" | "External";
  keywords: string[];
}

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.4rem] items-center justify-center rounded-md border border-line bg-bg px-1.5 py-0.5 font-mono text-[0.6rem] leading-none text-ink-soft">
      {children}
    </kbd>
  );
}

const PaletteContext = createContext<{ open: () => void } | null>(null);
export const useCommandPalette = () => useContext(PaletteContext);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <PaletteContext.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {isOpen && <CommandPaletteModal onClose={close} />}
      </AnimatePresence>
    </PaletteContext.Provider>
  );
}

function CommandPaletteModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const { theme, toggle } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Only keyboard moves should auto-scroll the list; mouse hover must never fight the wheel.
  const viaKeyboard = useRef(false);

  const nav = useCallback(
    (to: string) => {
      navigate(to);
      onClose();
    },
    [navigate, onClose],
  );

  const items = useMemo<CommandItem[]>(() => {
    const pageIcons: Record<string, LucideIcon> = {
      "/": Home,
      "/projects": Layers,
      "/experience": Briefcase,
      "/stack": Zap,
      "/about": User,
    };

    const navItems: CommandItem[] = siteConfig.nav.map((n) => ({
      id: `nav-${n.to}`,
      label: n.label,
      sublabel: `Go to ${n.label}`,
      icon: pageIcons[n.to] || FileText,
      action: () => nav(n.to),
      group: "Navigation",
      keywords: [n.label.toLowerCase()],
    }));

    navItems.push({
      id: "nav-contact",
      label: "Contact",
      sublabel: "Get in touch",
      icon: Mail,
      action: () => nav("/contact"),
      group: "Navigation",
      keywords: ["contact", "email", "mail", "reach"],
    });

    const projectItems: CommandItem[] = projects.map((p) => ({
      id: `proj-${p.slug}`,
      label: p.title,
      sublabel: p.tagline,
      icon: CircuitBoard,
      action: () => nav(`/projects/${p.slug}`),
      group: "Projects",
      keywords: [p.title.toLowerCase(), p.slug, ...p.categories.map((c) => c.toLowerCase())],
    }));

    const actionItems: CommandItem[] = [
      {
        id: "theme",
        label: `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
        icon: theme === "dark" ? Sun : Moon,
        action: () => {
          toggle();
          onClose();
        },
        group: "Actions",
        keywords: ["theme", "dark", "light", "mode", "toggle"],
      },
      {
        id: "copy-email",
        label: "Copy email address",
        sublabel: profile.email,
        icon: Mail,
        action: async () => {
          try {
            await navigator.clipboard.writeText(profile.email);
          } catch {
            /* fallback */
          }
          onClose();
        },
        group: "Actions",
        keywords: ["copy", "email", "clipboard"],
      },
    ];

    const externalItems: CommandItem[] = [
      {
        id: "ext-github",
        label: "GitHub",
        sublabel: socials.find((s) => s.id === "github")?.handle ?? "",
        icon: GitHubIcon as unknown as LucideIcon,
        action: () => {
          window.open(socials.find((s) => s.id === "github")?.href, "_blank", "noopener,noreferrer");
          onClose();
        },
        group: "External",
        keywords: ["github", "code", "repository"],
      },
      {
        id: "ext-linkedin",
        label: "LinkedIn",
        sublabel: socials.find((s) => s.id === "linkedin")?.handle ?? "",
        icon: LinkedInIcon as unknown as LucideIcon,
        action: () => {
          window.open(socials.find((s) => s.id === "linkedin")?.href, "_blank", "noopener,noreferrer");
          onClose();
        },
        group: "External",
        keywords: ["linkedin", "profile", "connect"],
      },
    ];

    return [...navItems, ...projectItems, ...actionItems, ...externalItems];
  }, [nav, onClose, theme, toggle]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.sublabel?.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q)),
    );
  }, [items, query]);

  useEffect(() => setActive(0), [query]);

  // Latest state for the single, long-lived key handler (no re-subscribing on every keystroke / hover).
  const live = useRef({ filtered, active });
  live.current = { filtered, active };

  // Focus instantly (before paint) without letting the browser scroll the page behind.
  useLayoutEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { filtered: list, active: cur } = live.current;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        viaKeyboard.current = true;
        setActive((i) => Math.min(i + 1, list.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        viaKeyboard.current = true;
        setActive((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && list[cur]) {
        e.preventDefault();
        list[cur].action();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Keep the keyboard-selected row in view by moving ONLY the list (never the page).
  useEffect(() => {
    if (!viaKeyboard.current) return;
    viaKeyboard.current = false;
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!list || !el) return;
    const pad = 8;
    if (active === 0) list.scrollTop = 0;
    else if (el.offsetTop - pad < list.scrollTop) list.scrollTop = el.offsetTop - pad;
    else if (el.offsetTop + el.offsetHeight + pad > list.scrollTop + list.clientHeight)
      list.scrollTop = el.offsetTop + el.offsetHeight + pad - list.clientHeight;
  }, [active]);

  // Scroll lock: while the palette is open the wheel / touch scrolls the results list, never the page.
  // (Lenis smooth-scroll listens on the whole window, so it is told to ignore this overlay via
  //  data-lenis-prevent, and anything outside the list is blocked here.)
  useEffect(() => {
    const list = listRef.current;
    const canScroll = (dir: "up" | "down") => {
      if (!list) return false;
      const max = list.scrollHeight - list.clientHeight;
      return max > 0 && (dir === "up" ? list.scrollTop > 0 : list.scrollTop < max - 1);
    };
    const inList = (t: EventTarget | null) => !!list && t instanceof Node && list.contains(t);

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch / ctrl+wheel zoom
      if (inList(e.target) && canScroll(e.deltaY < 0 ? "up" : "down")) return; // let the list scroll natively
      e.preventDefault();
    };
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = (e.touches[0]?.clientY ?? 0) - startY; // finger down → list scrolls up
      if (inList(e.target) && canScroll(dy > 0 ? "up" : "down")) return;
      e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
    };
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const g = map.get(item.group) ?? [];
      g.push(item);
      map.set(item.group, g);
    }
    return Array.from(map.entries());
  }, [filtered]);

  let flatIndex = 0;

  return (
    <div data-lenis-prevent className="fixed inset-0 z-[250]">
      {/* Backdrop — plain dim (no blur: a full-screen blur over the live 3D hero is what made it lag) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-black/65"
      />

      {/* Centering layer — the palette is always dead-centre, on every screen size */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          initial={{ opacity: 0, scale: 0.975, y: reduced ? 0 : 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.985, y: reduced ? 0 : 4 }}
          transition={{ duration: 0.18, ease: ease.lux }}
          style={{ willChange: "transform, opacity" }}
          className="pointer-events-auto relative w-full max-w-[640px] transform-gpu overflow-hidden rounded-[1.75rem] border border-line bg-elev shadow-[0_40px_120px_-24px_rgba(0,0,0,0.7)]"
        >
          {/* Accent hairline along the top edge */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent"
          />

          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-line px-5 transition-colors focus-within:border-accent/50">
            <Search className="size-[18px] shrink-0 text-accent" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, projects…"
              aria-label="Search pages, projects and actions"
              // The site-wide :focus-visible ring would draw a box around the field; the header underline shows focus instead.
              style={{ outline: "none" }}
              className="min-h-16 flex-1 bg-transparent text-base text-ink placeholder:text-muted"
              autoComplete="off"
              spellCheck={false}
            />
            <Kbd>ESC</Kbd>
          </div>

          {/* Results — fixed height so the palette never jumps while you type */}
          <div ref={listRef} role="listbox" aria-label="Results" className="relative h-[min(400px,50svh)] overflow-y-auto overscroll-contain px-3 pb-3 pt-1 [contain:content]">
            {groups.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <Search className="size-6 text-muted" aria-hidden="true" />
                <p className="text-sm text-ink-soft">No results for “{query}”</p>
                <p className="text-xs text-muted">Try “projects”, “theme” or “github”.</p>
              </div>
            )}
            {groups.map(([group, groupItems]) => (
              <div key={group}>
                <p className="t-meta flex items-center gap-3 px-3 pb-2 pt-4 text-[0.6rem] text-muted">
                  {group}
                  <span className="h-px flex-1 bg-line" aria-hidden="true" />
                </p>
                {groupItems.map((item) => {
                  const idx = flatIndex++;
                  const isActive = idx === active;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      data-index={idx}
                      onClick={item.action}
                      onMouseMove={() => setActive(idx)}
                      className={`relative flex w-full items-center gap-3.5 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors ${
                        isActive ? "bg-accent/10 text-ink" : "text-ink-soft"
                      }`}
                    >
                      {isActive && (
                        <span aria-hidden="true" className="absolute bottom-2.5 left-0 top-2.5 w-[2px] rounded-full bg-accent" />
                      )}
                      <span
                        className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                          isActive ? "border-accent/50 bg-accent/15 text-accent" : "border-line bg-bg text-ink-soft"
                        }`}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{item.label}</span>
                        {item.sublabel && <span className="block truncate text-xs text-muted">{item.sublabel}</span>}
                      </span>
                      {isActive && (
                        <span className="flex items-center gap-2" aria-hidden="true">
                          <ArrowRight className="size-3.5 text-accent" />
                          <Kbd>↵</Kbd>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-line bg-sunken/40 px-5 py-3 text-[0.68rem] text-muted">
            <div className="hidden items-center gap-4 sm:flex">
              <span className="inline-flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> Navigate</span>
              <span className="inline-flex items-center gap-1.5"><Kbd>↵</Kbd> Select</span>
              <span className="inline-flex items-center gap-1.5"><Kbd>Esc</Kbd> Close</span>
            </div>
            <span className="sm:hidden">Tap a result to open</span>
            <div className="flex items-center gap-3">
              <span>
                {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </span>
              <Kbd>{isMac() ? "⌘K" : "Ctrl K"}</Kbd>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}