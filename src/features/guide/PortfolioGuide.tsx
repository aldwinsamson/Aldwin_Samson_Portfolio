import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, CornerDownLeft, Lock, Mail, MessageCircle, RotateCcw, X } from "lucide-react";
import { GUIDE } from "@/content/knowledge";
import { siteConfig } from "@/config/site";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { ease, spring } from "@/styles/motion";
import { cn } from "@/utils/cn";
import { getGuide, type GuideAnswer, type GuideContext, type GuideLink } from "./engine";

/**
 * Portfolio assistant — a smart search over everything on this site (see ./engine.ts).
 * It runs entirely in the browser: no network calls, nothing stored, and it never invents facts.
 * When it can't answer, it points the visitor to John personally.
 * Disable with siteConfig.features.portfolioGuide = false.
 */

interface Message {
  id: number;
  from: "user" | "guide";
  text: string;
  answer?: GuideAnswer;
}

const GuideContextValue = createContext<{ open: (q?: string) => void } | null>(null);
export const useGuide = () => useContext(GuideContextValue);

export function GuideProvider({ children }: { children: ReactNode }) {
  const enabled = siteConfig.features.portfolioGuide;
  const [isOpen, setOpen] = useState(false);
  const [pending, setPending] = useState<string | undefined>();
  const open = useCallback((q?: string) => {
    setPending(q);
    setOpen(true);
  }, []);
  if (!enabled) return <GuideContextValue.Provider value={null}>{children}</GuideContextValue.Provider>;
  return (
    <GuideContextValue.Provider value={{ open }}>
      {children}
      <GuideLauncher onOpen={() => open()} hidden={isOpen} />
      <AnimatePresence>{isOpen && <GuidePanel initialQuery={pending} onClose={() => setOpen(false)} />}</AnimatePresence>
    </GuideContextValue.Provider>
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
          aria-label="Open the assistant — ask anything about John"
          data-cursor="magnetic"
          className="fixed bottom-5 right-4 z-[70] inline-flex size-12 items-center justify-center rounded-full bg-ink text-bg shadow-[var(--shadow-sm)] transition-colors hover:bg-accent hover:text-accent-ink sm:bottom-6 sm:right-5 sm:size-14"
        >
          <MessageCircle className="size-6" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/** Renders answer text: "• " lines become a list, "Yes!" is emphasised. */
function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul${blocks.length}`} className="my-1.5 space-y-1.5">
        {list.map((l, i) => (
          <li key={i} className="relative pl-4">
            <span aria-hidden="true" className="absolute left-0 top-[0.7em] h-px w-2.5 bg-accent" />
            {l}
          </li>
        ))}
      </ul>,
    );
    list = [];
  };
  text.split("\n").forEach((line, i) => {
    if (line.startsWith("• ")) return list.push(line.slice(2));
    flush();
    if (!line.trim()) return;
    const lead = line.match(/^(Yes!|Opo!) /)?.[1];
    blocks.push(
      <p key={`p${i}`} className={cn(i > 0 && "mt-2", /^\(.*\)$/.test(line.trim()) && "text-xs text-muted")}>
        {lead ? <strong className="font-semibold text-accent">{lead} </strong> : null}
        {lead ? line.slice(lead.length + 1) : line}
      </p>,
    );
  });
  flush();
  return <>{blocks}</>;
}

function ActionLink({ link, primary }: { link: GuideLink; primary?: boolean }) {
  const cls = cn(
    "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-[0.82rem] font-medium transition-colors",
    primary ? "bg-ink text-bg hover:bg-accent hover:text-accent-ink" : "border border-line-strong text-ink-soft hover:border-accent hover:text-accent",
  );
  const inner = (
    <>
      {link.to.startsWith("mailto:") && <Mail className="size-3.5" aria-hidden="true" />}
      {link.label}
      {!link.to.startsWith("mailto:") && <ArrowUpRight className="size-3.5" aria-hidden="true" />}
    </>
  );
  if (link.external) {
    const mail = link.to.startsWith("mailto:");
    return (
      <a href={link.to} className={cls} {...(mail ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
        {inner}
      </a>
    );
  }
  return (
    <Link to={link.to} className={cls}>
      {inner}
    </Link>
  );
}

function TypingDots({ reduced }: { reduced: boolean }) {
  return (
    <div role="status" className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-sunken px-4 py-3.5">
      <span className="sr-only">The assistant is typing</span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="size-1.5 rounded-full bg-muted"
          animate={reduced ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function GuidePanel({ onClose, initialQuery }: { onClose: () => void; initialQuery?: string }) {
  const guide = useMemo(() => getGuide(), []);
  const reduced = usePrefersReducedMotion();
  const welcome = useMemo<Message>(() => ({ id: 0, from: "guide", text: GUIDE.welcome }), []);
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [typing, setTyping] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const counter = useRef(1);
  const ctx = useRef<GuideContext>({});
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const busy = useRef(false);
  const titleId = useId();

  const ask = useCallback(
    (q: string) => {
      const text = q.trim().slice(0, 300);
      if (!text || busy.current) return;
      busy.current = true;
      setMessages((m) => [...m, { id: counter.current++, from: "user", text }]);
      setTyping(true);
      const answer = guide.ask(text, ctx.current);
      ctx.current = { group: answer.group ?? ctx.current.group, shown: answer.shown ?? ctx.current.shown, lang: answer.lang };
      const delay = reduced ? 0 : Math.min(900, 380 + answer.text.length * 1.1);
      timer.current = setTimeout(() => {
        setMessages((m) => [...m, { id: counter.current++, from: "guide", text: answer.text, answer }]);
        setTyping(false);
        busy.current = false;
      }, delay);
    },
    [guide, reduced],
  );

  const reset = () => {
    clearTimeout(timer.current);
    busy.current = false;
    ctx.current = {};
    setTyping(false);
    setMessages([welcome]);
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
    if (initialQuery) ask(initialQuery);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [messages, typing, reduced]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(value);
    setValue("");
  };

  const lastGuideId = [...messages].reverse().find((m) => m.from === "guide")?.id;

  return (
    <motion.div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      data-lenis-prevent
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ duration: 0.35, ease: ease.lux }}
      className="surface fixed inset-x-3 bottom-3 z-[80] flex max-h-[min(680px,calc(100svh-1.5rem))] flex-col overflow-hidden rounded-[24px] sm:inset-x-auto sm:bottom-6 sm:right-5 sm:w-[420px]"
    >
      <header className="flex items-start justify-between gap-4 border-b border-line p-5">
        <div className="min-w-0">
          <p id={titleId} className="font-display text-2xl">{GUIDE.title}</p>
          <p className="t-meta mt-1 inline-flex items-center gap-1.5 text-[0.62rem] text-muted">
            <Lock className="size-3 shrink-0" aria-hidden="true" /> {GUIDE.subtitle}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {messages.length > 1 && (
            <button
              type="button"
              onClick={reset}
              aria-label="Clear the conversation"
              title="Clear conversation"
              className="inline-flex size-10 items-center justify-center rounded-full border border-line text-ink-soft hover:border-line-strong hover:text-ink"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Close the assistant" className="inline-flex size-10 items-center justify-center rounded-full border border-line hover:border-line-strong">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div ref={listRef} data-lenis-prevent className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-5" aria-live="polite">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: ease.lux }}
            className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}
          >
            <div className={cn("max-w-[90%]", m.from === "guide" && "w-full")}>
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-[0.92rem] leading-relaxed",
                  m.from === "user" ? "ml-auto w-fit rounded-br-md bg-ink text-bg" : "w-fit rounded-bl-md bg-sunken text-ink",
                  m.answer?.kind === "fallback" && "border border-accent/40",
                )}
              >
                {m.from === "guide" ? <RichText text={m.text} /> : <p>{m.text}</p>}
              </div>

              {m.answer && m.answer.links.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {m.answer.links.map((l, i) => (
                    <ActionLink key={l.to} link={l} primary={m.answer?.kind === "fallback" && i === 0} />
                  ))}
                </div>
              )}

              {m.id === lastGuideId && !typing && (m.answer?.followUps.length ?? 0) > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.answer!.followUps.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => ask(f)}
                      className="rounded-full border border-line px-3 py-1.5 text-left text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {messages.length === 1 && !typing && (
          <div className="flex flex-wrap gap-1.5">
            {guide.starters().map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="rounded-full border border-line px-3 py-1.5 text-left text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {typing && (
          <div className="flex justify-start">
            <TypingDots reduced={reduced} />
          </div>
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-line p-3">
        <label htmlFor="guide-input" className="sr-only">
          Ask a question about John
        </label>
        <input
          id="guide-input"
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={300}
          autoComplete="off"
          placeholder={GUIDE.placeholder}
          style={{ outline: "none" }}
          className="min-h-11 flex-1 rounded-full border border-line bg-bg px-4 text-sm placeholder:text-muted focus:border-tech"
        />
        <button type="submit" aria-label="Send" disabled={!value.trim()} className="inline-flex size-11 items-center justify-center rounded-full bg-ink text-bg transition-colors hover:bg-accent hover:text-accent-ink disabled:opacity-40">
          <CornerDownLeft className="size-4" aria-hidden="true" />
        </button>
      </form>
    </motion.div>
  );
}
