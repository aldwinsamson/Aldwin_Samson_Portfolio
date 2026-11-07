import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, ArrowUpRight, Check, Copy, Lock, Mail, MessageCircle, RotateCcw, Sparkles, Square, X } from "lucide-react";
import { GUIDE } from "@/content/knowledge";
import { siteConfig } from "@/config/site";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { ease, spring } from "@/styles/motion";
import { cn } from "@/utils/cn";
import { AiError, aiConfigured, askAi, type AiTurn } from "./aiClient";
import { getGuide, type GuideAnswer, type GuideContext, type GuideLink } from "./engine";

/**
 * Portfolio assistant.
 *
 * Two layers answer the visitor's question:
 *   1. An AI model (see server/chat) that only knows what is published on this site. Used when VITE_CHAT_API_URL is set.
 *   2. The built-in search (./engine.ts) that runs in the browser. It supplies the "Open the case study" links,
 *      and it answers on its own when the AI service is missing, slow, rate limited or down.
 * Disable the whole assistant with siteConfig.features.portfolioGuide = false.
 */

const MAX_CHARS = 300;
/** Space kept free above the panel so it can never cover the navigation bar (nav is about 76px tall). */
const TOP_CLEARANCE = "5.75rem";

interface Message {
  id: number;
  from: "user" | "guide";
  text: string;
  kind?: GuideAnswer["kind"] | "ai";
  links?: GuideLink[];
  followUps?: string[];
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

/** **bold** and `code` inside a line. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.length > 4 && p.startsWith("**") && p.endsWith("**")) return <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>;
        if (p.length > 2 && p.startsWith("`") && p.endsWith("`")) return <code key={i} className="rounded bg-bg px-1 py-0.5 text-[0.85em]">{p.slice(1, -1)}</code>;
        return p;
      })}
    </>
  );
}

/** Renders answer text: "• ", "- " and "* " lines become a list, "Yes!" is emphasised. */
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
            <Inline text={l} />
          </li>
        ))}
      </ul>,
    );
    list = [];
  };
  text.split("\n").forEach((line, i) => {
    const bullet = line.match(/^\s*[•\-*]\s+(.*)$/);
    if (bullet) return list.push(bullet[1]);
    flush();
    if (!line.trim()) return;
    const lead = line.match(/^(Yes!|Opo!) /)?.[1];
    blocks.push(
      <p key={`p${i}`} className={cn(i > 0 && "mt-2", /^\(.*\)$/.test(line.trim()) && "text-xs text-muted")}>
        {lead ? <strong className="font-semibold text-accent">{lead} </strong> : null}
        <Inline text={lead ? line.slice(lead.length + 1) : line} />
      </p>,
    );
  });
  flush();
  return <>{blocks}</>;
}

/** Reveals the text a few characters at a time, like a streaming reply. */
function Typed({ text, instant, skip, onTick, onDone }: { text: string; instant: boolean; skip: boolean; onTick: () => void; onDone: () => void }) {
  const [n, setN] = useState(instant ? text.length : 0);
  const done = useRef(false);
  const doneRef = useRef(onDone);
  const tickRef = useRef(onTick);
  doneRef.current = onDone;
  tickRef.current = onTick;

  useEffect(() => {
    if (instant || skip) {
      setN(text.length);
      return;
    }
    const step = Math.max(2, Math.ceil(text.length / 150));
    let i = 0;
    const id = window.setInterval(() => {
      i = Math.min(text.length, i + step);
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, 18);
    return () => window.clearInterval(id);
  }, [text, instant, skip]);

  useEffect(() => {
    tickRef.current();
    if (n >= text.length && !done.current) {
      done.current = true;
      doneRef.current();
    }
  }, [n, text.length]);

  return <RichText text={text.slice(0, n)} />;
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };
  return (
    <button type="button" onClick={copy} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.7rem] text-muted transition-colors hover:text-ink">
      {copied ? <Check className="size-3" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

const offlineNote = (kind: AiError["kind"] | "none") =>
  kind === "rate"
    ? "(Lots of questions at once. This answer comes from the built-in search.)"
    : "(The AI service isn't reachable right now, so this answer comes from the built-in search.)";

function GuidePanel({ onClose, initialQuery }: { onClose: () => void; initialQuery?: string }) {
  const guide = useMemo(() => getGuide(), []);
  const reduced = usePrefersReducedMotion();
  const isSm = useMediaQuery("(min-width: 640px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isWide = useMediaQuery("(min-width: 1240px)");

  const welcome = useMemo<Message>(() => ({ id: 0, from: "guide", text: GUIDE.welcome }), []);
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [waiting, setWaiting] = useState(false); // waiting for the answer (shows the typing dots)
  const [streamingId, setStreamingId] = useState<number | null>(null); // message currently typing itself out
  const [skipTyping, setSkipTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [aiUp, setAiUp] = useState(aiConfigured);
  const [value, setValue] = useState("");

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const counter = useRef(1);
  const ctx = useRef<GuideContext>({});
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const busyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const history = useRef<AiTurn[]>([]);
  const titleId = useId();

  // The panel sits above the navigation bar's space and, on mid-size screens, above the floating dock.
  const bottom = isLg && !isWide ? "7rem" : isSm ? "1.5rem" : "0.75rem";

  const release = useCallback(() => {
    busyRef.current = false;
    setBusy(false);
    setWaiting(false);
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const stickToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const ask = useCallback(
    (q: string) => {
      const text = q.trim().slice(0, MAX_CHARS);
      if (!text || busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      setWaiting(true);
      setMessages((m) => [...m, { id: counter.current++, from: "user", text }]);

      // The local search always runs: it is instant and gives us the case-study links and the fallback answer.
      const local = guide.ask(text, ctx.current);
      ctx.current = { group: local.group ?? ctx.current.group, shown: local.shown ?? ctx.current.shown, lang: local.lang };
      history.current = [...history.current, { role: "user" as const, content: text }].slice(-12);

      const answerLocally = (note?: string) => {
        const delay = reduced ? 0 : Math.min(900, 380 + local.text.length * 1.1);
        timer.current = setTimeout(() => {
          setMessages((m) => [
            ...m,
            { id: counter.current++, from: "guide", text: note ? `${local.text}\n${note}` : local.text, kind: local.kind, links: local.links, followUps: local.followUps },
          ]);
          history.current = [...history.current, { role: "assistant" as const, content: local.text }].slice(-12);
          release();
        }, delay);
      };

      if (!aiConfigured) return answerLocally();

      const controller = new AbortController();
      abortRef.current = controller;
      askAi(history.current.slice(-8), controller.signal)
        .then((reply) => {
          setAiUp(true);
          const mentionsContact = /e-?mail|contact|reach|sulat|makipag-ugnayan/i.test(reply.text);
          const links = local.kind === "answer" || (local.kind === "fallback" && mentionsContact) ? local.links : [];
          const id = counter.current++;
          history.current = [...history.current, { role: "assistant" as const, content: reply.text }].slice(-12);
          setSkipTyping(false);
          setWaiting(false);
          setMessages((m) => [
            ...m,
            { id, from: "guide", text: reply.text, kind: "ai", links, followUps: reply.followUps.length ? reply.followUps : local.followUps },
          ]);
          setStreamingId(id);
        })
        .catch((err: unknown) => {
          const kind = err instanceof AiError ? err.kind : "network";
          if (kind === "aborted") {
            history.current = history.current.slice(0, -1); // forget the question that was cancelled
            release();
            return;
          }
          setAiUp(false);
          answerLocally(offlineNote(kind === "rate" ? "rate" : "none"));
        });
    },
    [guide, reduced, release],
  );

  const stop = () => {
    if (waiting) abortRef.current?.abort();
    else if (streamingId !== null) setSkipTyping(true);
  };

  const onTypedDone = useCallback(
    (id: number) => {
      setStreamingId((cur) => (cur === id ? null : cur));
      release();
    },
    [release],
  );

  const reset = () => {
    abortRef.current?.abort();
    clearTimeout(timer.current);
    busyRef.current = false;
    ctx.current = {};
    history.current = [];
    setBusy(false);
    setWaiting(false);
    setStreamingId(null);
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
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the newest message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [messages, waiting, reduced]);

  // Grow the text box with its content, up to about four lines.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [value]);

  const send = () => {
    if (busyRef.current || !value.trim()) return;
    ask(value);
    setValue("");
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    send();
  };
  const onKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const lastGuideId = [...messages].reverse().find((m) => m.from === "guide")?.id;
  const online = aiConfigured && aiUp;

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
      // Height stops below the navigation bar, and the bottom edge clears the dock, however long the chat gets.
      style={{ bottom, maxHeight: `min(680px, calc(100dvh - ${TOP_CLEARANCE} - ${bottom}))` }}
      className="surface fixed inset-x-3 z-[80] flex flex-col overflow-hidden rounded-[24px] sm:inset-x-auto sm:right-5 sm:w-[420px]"
    >
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line p-5">
        <div className="min-w-0">
          <p id={titleId} className="font-display text-2xl">{GUIDE.title}</p>
          <p className="t-meta mt-1 inline-flex items-center gap-1.5 text-[0.62rem] text-muted">
            {online ? <Sparkles className="size-3 shrink-0" aria-hidden="true" /> : <Lock className="size-3 shrink-0" aria-hidden="true" />}
            {online ? GUIDE.subtitle : GUIDE.subtitleOffline}
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

      <div
        ref={listRef}
        data-lenis-prevent
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5"
        aria-live={streamingId === null ? "polite" : "off"}
        aria-busy={busy}
      >
        {messages.map((m) => {
          const streaming = m.id === streamingId;
          return (
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
                    m.from === "user" ? "ml-auto w-fit rounded-br-md bg-ink text-bg" : "w-fit max-w-full rounded-bl-md bg-sunken text-ink",
                    m.kind === "fallback" && "border border-accent/40",
                  )}
                >
                  {m.from === "user" ? (
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  ) : streaming ? (
                    <Typed text={m.text} instant={reduced} skip={skipTyping} onTick={stickToBottom} onDone={() => onTypedDone(m.id)} />
                  ) : (
                    <RichText text={m.text} />
                  )}
                </div>

                {m.from === "guide" && !streaming && m.kind === "ai" && (
                  <div className="mt-1 flex items-center">
                    <CopyButton text={m.text} />
                  </div>
                )}

                {!streaming && m.links && m.links.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {m.links.map((l, i) => (
                      <ActionLink key={l.to} link={l} primary={m.kind === "fallback" && i === 0} />
                    ))}
                  </div>
                )}

                {m.id === lastGuideId && !waiting && !streaming && (m.followUps?.length ?? 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.followUps!.map((f) => (
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
          );
        })}

        {messages.length === 1 && !waiting && (
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

        {waiting && (
          <div className="flex justify-start">
            <TypingDots reduced={reduced} />
          </div>
        )}
      </div>

      <form onSubmit={submit} className="shrink-0 border-t border-line p-3">
        <div className="flex items-end gap-2">
          <label htmlFor="guide-input" className="sr-only">
            Ask a question about John
          </label>
          <textarea
            id="guide-input"
            ref={inputRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            maxLength={MAX_CHARS}
            autoComplete="off"
            placeholder={GUIDE.placeholder}
            style={{ outline: "none" }}
            className="max-h-28 min-h-11 flex-1 resize-none rounded-[22px] border border-line bg-bg px-4 py-[0.7rem] text-sm leading-snug placeholder:text-muted focus:border-tech"
          />
          {busy ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop"
              title="Stop"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-accent hover:text-accent"
            >
              <Square className="size-3.5 fill-current" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send"
              disabled={!value.trim()}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-bg transition-colors hover:bg-accent hover:text-accent-ink disabled:opacity-40"
            >
              <ArrowUp className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
        {(online || value.length > 240) && (
          <div className="mt-1.5 flex items-start justify-between gap-3 px-1 text-[0.68rem] leading-snug text-muted">
            <span>{online ? GUIDE.privacyNote : ""}</span>
            {value.length > 240 && <span className="shrink-0">{value.length}/{MAX_CHARS}</span>}
          </div>
        )}
      </form>
    </motion.div>
  );
}
