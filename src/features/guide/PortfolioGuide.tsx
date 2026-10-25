import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, CornerDownLeft, Lock, MessageCircle, X } from "lucide-react";
import { knowledgeBase, searchKnowledge, type KnowledgeEntry } from "@/content/knowledge";
import { siteConfig } from "@/config/site";
import { ease, spring } from "@/styles/motion";
import { cn } from "@/utils/cn";

/**
 * Portfolio Guide — a LOCAL FAQ search, honestly labelled.
 * Matches questions against src/content/knowledge.ts. No network calls, no AI model,
 * no data stored. Disable with siteConfig.features.portfolioGuide = false.
 */

interface Message {
  id: number;
  from: "user" | "guide";
  text: string;
  entry?: KnowledgeEntry | null;
  related?: KnowledgeEntry[];
}

const GuideContext = createContext<{ open: (q?: string) => void } | null>(null);
export const useGuide = () => useContext(GuideContext);

const SUGGESTED = ["ligtas", "internship", "embedded", "roles"]
  .map((id) => knowledgeBase.find((k) => k.id === id))
  .filter(Boolean) as KnowledgeEntry[];

export function GuideProvider({ children }: { children: ReactNode }) {
  const enabled = siteConfig.features.portfolioGuide;
  const [isOpen, setOpen] = useState(false);
  const [pending, setPending] = useState<string | undefined>();
  const open = useCallback((q?: string) => {
    setPending(q);
    setOpen(true);
  }, []);
  if (!enabled) return <GuideContext.Provider value={null}>{children}</GuideContext.Provider>;
  return (
    <GuideContext.Provider value={{ open }}>
      {children}
      <GuideLauncher onOpen={() => open()} hidden={isOpen} />
      <AnimatePresence>{isOpen && <GuidePanel initialQuery={pending} onClose={() => setOpen(false)} />}</AnimatePresence>
    </GuideContext.Provider>
  );
}

function GuideLauncher({ onOpen, hidden }: { onOpen: () => void; hidden: boolean }) {
  return (
    <AnimatePresence>
      {!hidden && (
        <motion.button
          type="button"
          onClick={onOpen}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 1.8 } }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileTap={{ scale: 0.92 }}
          transition={spring.ui}
          aria-label="Open portfolio guide (local FAQ search)"
          data-cursor="magnetic"
          className="fixed bottom-5 right-4 z-[70] inline-flex size-12 items-center justify-center rounded-full bg-ink text-bg shadow-[var(--shadow-sm)] transition-colors hover:bg-accent hover:text-accent-ink sm:bottom-6 sm:right-5 sm:size-14"
        >
          <MessageCircle className="size-6" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function GuidePanel({ onClose, initialQuery }: { onClose: () => void; initialQuery?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      from: "guide",
      text: "Hi — I'm a simple, offline guide to this portfolio. Ask about projects, experience, skills or how to get in touch. I only answer from facts written into this site.",
    },
  ]);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const counter = useRef(1);
  const titleId = useId();

  const ask = useCallback((q: string) => {
    const text = q.trim().slice(0, 200);
    if (!text) return;
    const res = searchKnowledge(text);
    setMessages((m) => [
      ...m,
      { id: counter.current++, from: "user", text },
      res.entry
        ? { id: counter.current++, from: "guide", text: res.entry.answer, entry: res.entry, related: res.related }
        : {
            id: counter.current++,
            from: "guide",
            text: "I don't have a written answer for that. I can only respond from a short list of facts — try one of these topics, or contact John directly.",
            entry: null,
            related: res.related.length ? res.related : SUGGESTED,
          },
    ]);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
    if (initialQuery) ask(initialQuery);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ask, initialQuery, onClose]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(value);
    setValue("");
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ duration: 0.4, ease: ease.lux }}
      className="surface fixed inset-x-3 bottom-3 z-[80] flex max-h-[min(640px,calc(100svh-1.5rem))] flex-col overflow-hidden rounded-[24px] sm:inset-x-auto sm:bottom-6 sm:right-5 sm:w-[400px]"
    >
      <header className="flex items-start justify-between gap-4 border-b border-line p-5">
        <div>
          <p id={titleId} className="font-display text-2xl">Portfolio Guide</p>
          <p className="t-meta mt-1 inline-flex items-center gap-1.5 text-[0.62rem] text-muted">
            <Lock className="size-3" aria-hidden="true" /> Local FAQ search · no AI · nothing sent anywhere
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close guide" className="inline-flex size-10 items-center justify-center rounded-full border border-line hover:border-line-strong">
          <X className="size-4" aria-hidden="true" />
        </button>
      </header>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[88%] rounded-2xl px-4 py-3 text-[0.92rem] leading-relaxed",
                m.from === "user" ? "rounded-br-md bg-ink text-bg" : "rounded-bl-md bg-sunken text-ink",
              )}
            >
              <p>{m.text}</p>
              {m.entry?.link && (
                <Link to={m.entry.link.to} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent underline-offset-4 hover:underline">
                  {m.entry.link.label} <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
              )}
              {m.related && m.related.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.related.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => ask(r.question)}
                      className="rounded-full border border-line-strong px-3 py-1.5 text-left text-xs text-ink-soft hover:border-accent hover:text-accent"
                    >
                      {r.question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => ask(s.question)}
                className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-accent hover:text-accent"
              >
                {s.question}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-line p-3">
        <label htmlFor="guide-input" className="sr-only">
          Ask a question
        </label>
        <input
          id="guide-input"
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={200}
          autoComplete="off"
          placeholder="e.g. What did he build for his thesis?"
          className="min-h-11 flex-1 rounded-full border border-line bg-bg px-4 text-sm placeholder:text-muted focus:border-tech focus:outline-none"
        />
        <button type="submit" aria-label="Ask" className="inline-flex size-11 items-center justify-center rounded-full bg-ink text-bg hover:bg-accent hover:text-accent-ink">
          <CornerDownLeft className="size-4" aria-hidden="true" />
        </button>
      </form>
    </motion.div>
  );
}
