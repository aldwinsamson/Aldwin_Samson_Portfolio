import { STRINGS, type GuideStrings, type Lang } from "@/content/knowledge";
import { GUIDE } from "@/content/knowledge";
import { profile, socials } from "@/content/profile";
import { certifications, experience, honors } from "@/content/experience";
import { projects } from "@/content/projects";
import { buildCorpus, type Fact, type GuideLink } from "./corpus";
import { TL, TL_STOPWORDS, TL_WH, detectLang, isTagalogYesNo, toEnglish } from "./tagalog";

export type { Fact, GuideLink } from "./corpus";
export type { Lang } from "@/content/knowledge";

/* ========================================================================== */
/*  Public types                                                              */
/* ========================================================================== */

export interface GuideAnswer {
  /** answer = found in the portfolio · smalltalk = greeting etc. · fallback = could not answer → contact John */
  kind: "answer" | "smalltalk" | "fallback";
  text: string;
  links: GuideLink[];
  /** Questions the visitor might want to ask next (in the visitor's language). */
  followUps: string[];
  /** Ids of the facts used (debugging / tests). */
  sources: string[];
  /** Language the visitor wrote in — the assistant's own sentences use the same one. */
  lang: Lang;
  /** Topic of the answer — passed back as context so "tell me more" works. */
  group?: string;
  shown?: string[];
}

export interface GuideContext {
  group?: string;
  shown?: string[];
  /** Language of the previous answer — a short follow-up ("Terraform?") keeps replying in it. */
  lang?: Lang;
}

/* ========================================================================== */
/*  Text processing                                                           */
/* ========================================================================== */

const STOP = new Set([
  ...(
    "a an and are as at be been being by can could did do does done for from get got had has have having he her hers him his how i if in into is it its me my of on or our so than that the their them then there these they this those to us was we were what whats when where which who whom whose why will with would you your yours about please kindly really very just also ok okay yes no tell show give explain describe say know knows many much some any anything everything something s t john aldwin samson mr sir maam hey hi hello thanks thank want need let lets use used using usage like mean means hes johns whats more kinda sort guess think thing things stuff etc all hold holds held own owns possess possesses currently now today ever never always still already pls plz simple terms simply plain english words layman briefly brief short quick quickly long duration length period when date dates month months week weeks year years latest recent newest recently ongoing current compare versus vs difference differences differ between else other others another besides face faced facing encounter encountered two three both each highest level greatest biggest proudest"
  ).split(/\s+/),
  ...TL_STOPWORDS,
]);

/** Lowercase, remove accents, glue dotted acronyms and tech punctuation ("L.I.G.T.A.S." → "ligtas", "C++" → "cpp"). */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/c\+\+/g, "cpp")
    .replace(/c#/g, "csharp")
    .replace(/\bci\s*\/?\s*cd\b/g, "cicd")
    .replace(/(?<=[a-z0-9])[.'’](?=[a-z0-9])/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Light stemmer (consistent on both sides, so exact linguistics don't matter). */
export function stem(w: string): string {
  if (w.length > 5 && w.endsWith("ies")) return `${w.slice(0, -3)}y`;
  if (w.length > 6 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 5 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 4 && /(ss|sh|ch|x|z)es$/.test(w)) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

export function tokenize(text: string, keepStopwords = false): string[] {
  return normalize(text)
    .split(" ")
    .filter((t) => t.length > 1 && (keepStopwords || !STOP.has(t)))
    .map(stem);
}

/** Words that mean (roughly) the same thing — a match on any of them counts. */
const SYNONYM_GROUPS: string[][] = [
  ["intern", "internship", "ojt", "trainee", "traineeship"],
  ["job", "career", "opportunity", "employment", "vacancy", "hire", "hiring", "hired", "recruit"],
  ["role", "position", "title", "responsibility", "responsibilities", "duty", "duties"],
  ["setup", "architecture", "environment", "infrastructure", "design", "layout"],
  ["learned", "learn", "learning", "gained", "takeaway", "takeaways"],
  ["school", "university", "college", "education", "study", "studied", "degree", "graduate", "graduated", "bachelor", "academic"],
  ["contact", "email", "mail", "reach", "touch", "connect", "message", "write"],
  ["project", "built", "build", "made", "created", "developed", "app", "application", "system", "prototype"],
  ["skill", "technology", "tech", "stack", "tool", "proficiency", "expertise", "competency", "capability"],
  ["specialize", "specialise", "specialization", "specialty", "speciality", "focus", "expertise"],
  ["award", "achievement", "honor", "honour", "recognition", "recognized", "won", "win", "prize", "accomplishment", "medal"],
  ["certification", "certificate", "credential", "training", "seminar", "course", "masterclass"],
  ["hardware", "electronics", "circuit", "pcb", "board"],
  ["embedded", "firmware", "microcontroller", "iot"],
  ["thesis", "capstone", "dissertation"],
  ["cv", "resume", "curriculum", "vitae"],
  ["location", "based", "live", "located", "city", "country"],
  ["available", "availability", "open", "looking", "seeking"],
  ["language", "programming", "coding", "code"],
  ["challenge", "difficulty", "difficult", "obstacle", "hardest", "hard"],
  ["outcome", "result", "impact", "achieved", "delivered"],
  ["team", "teammate", "leadership", "lead", "led", "leader", "manage", "managed"],
  ["monitoring", "observability", "metric", "logging", "tracing", "alerting"],
  ["deploy", "deployment", "release", "delivery", "pipeline", "cicd"],
  ["web", "website", "frontend", "fullstack"],
  ["ai", "ml", "machine", "intelligence"],
  ["experience", "worked", "history", "background"],
  ["favourite", "favorite"],
];

const SYN = (() => {
  const map = new Map<string, Set<string>>();
  for (const g of SYNONYM_GROUPS) {
    const stems = g.map((w) => stem(normalize(w)));
    for (const s of stems) {
      const set = map.get(s) ?? new Set<string>();
      stems.forEach((o) => o !== s && set.add(o));
      map.set(s, set);
    }
  }
  return map;
})();

/** Optimal-string-alignment distance (Levenshtein + adjacent swaps), bounded. */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/* ========================================================================== */
/*  Conversation rules (English; the Filipino ones live in ./tagalog.ts)      */
/* ========================================================================== */

const GREETING = /^\s*(hi|hello|hey|heya|hiya|yo|sup|hola|good\s+(morning|afternoon|evening|day))\b/;
const THANKS = /\b(thanks|thank you|thankyou|cheers|appreciate it|much appreciated)\b/;
const BYE = /^\s*(bye|goodbye|see you|see ya|that's all|thats all|that is all|nothing else|i'm done|im done|ok bye|okay bye)\b/;
const IDENTITY = /\b(who|what) are you\b|\bare you (an? )?(ai|bot|robot|human|real|chatgpt|gpt|person|john)\b|\byour name\b|\bwho am i (talking|speaking|chatting)\b|\bwho made you\b/;
const HELP = /^\s*(help|menu|options)\b|\bwhat can (i|you) (ask|do|answer)\b|\bwhat do you know\b|\bhow (do|can) i use (you|this)\b|\bwhat (topics|questions)\b/;
const MORE = /^\s*(more|tell me more|go on|continue|and|what else|anything else|more details?|elaborate|expand|next|keep going|more about (that|this|it))\s*[?!.]*\s*$/;

/** Personal / private topics John prefers to discuss directly. */
const PRIVATE =
  /\b(salary|salaries|compensation|expected pay|pay rate|hourly rate|how much (do|does|would|will|is).*(earn|make|charge|cost|paid|ask)|how much.*\b(rate|fee|pay|salary)\b|how old|\bage\b|birthday|birth ?date|date of birth|birthplace|home address|street address|phone|mobile|cell ?phone|whatsapp|viber|telegram|girlfriend|boyfriend|married|single|relationship status|relationship|religion|religious|politic|politics|parents|siblings|family|nationality|citizenship|visa|passport|health|medical|disabilit|sexuality|salary history|tax|ssn|id number)\b/;

/** Clearly unrelated to John's work. */
const OFF_TOPIC =
  /\b(weather|joke|poem|song lyrics|lyrics|recipe|capital of|president of|prime minister|bitcoin|crypto|stock price|football|basketball|nba|movie|anime|horoscope|translate|lottery|homework|solve|calculate|write (me )?(a|an|some) (essay|code|script|poem|story|email|letter)|tell me a (joke|story)|what time is it|news)\b/;

/** Work-arrangement questions (remote, relocation, notice period…) — not published on the site, so John answers these himself. */
const WORK_TERMS =
  /\b(remote(ly)?|relocat\w*|hybrid|on-?site|full[- ]?time|part[- ]?time|notice period|start date|when can (he|john) start|sponsor\w*|work permit|time ?zone|overtime|willing to|contract(or)?|freelanc\w*)\b/;
const WORK_CONTEXT = /\b(work|job|role|hire|hiring|join|start|available|employ\w*|position|opportunit\w*|can he|will he|would he|could he|is he willing)\b/;

const SHORTCUTS: { test: RegExp; ids: string[] }[] = [
  { test: /\b(is|are) (he|john|aldwin|you) (available|open|looking|hirable|employed|free|hiring)\b|\bopen to (work|opportunit|roles?|offers?|job)|\bavailable (for|to) (hire|work)\b|\b(can|could) (i|we) hire (him|john)\b|\blooking for (a )?(job|work|role|opportunit)/, ids: ["availability"] },
  { test: /\bwhy (should|would|do|shall|must) (i|we|you).*(hire|choose|pick|work)|\bwhat makes (him|john|you) (different|special|unique|stand)|\bsell (him|yourself)|\b(his|john'?s|your) strengths?\b|\bwhy hire\b/, ids: ["faq:why-hire"] },
  { test: /\b(cv|resume|curriculum vitae)\b/, ids: ["faq:resume"] },
  { test: /\bwhere (is|are|does|do) (he|you|john|aldwin) (live|based|from|located)\b|\bwhere('s| is) (he|john|aldwin) (from|based|located)\b|\bwhich (city|country)\b|\bwhere (do|does) (he|john) live\b|\bwhere are you (from|based)\b|\bwhat country\b|\bwhere.*\b(located|based)\b/, ids: ["location"] },
  { test: /\bwho (is|s|was) (he|john|aldwin|this|samson|john aldwin)\b|\bwho is john\b|\btell me (more )?about (him|john|aldwin|yourself|you)\b|\bintroduce (him|john|yourself)\b|\bdescribe (him|john|yourself)\b|\bwhat (does|do) (he|john|aldwin|you) do\b|\bwhat is (he|john) (about|into)\b|^\s*(about|bio|profile)\s*[?.!]*\s*$/, ids: ["faq:who", "focus-list"] },
];
/** The same shortcuts for Filipino questions. */
const TL_SHORTCUTS: { test: RegExp; ids: string[] }[] = [
  { test: TL.availability, ids: ["availability"] },
  { test: TL.whyHire, ids: ["faq:why-hire"] },
  { test: TL.resume, ids: ["faq:resume"] },
  { test: TL.location, ids: ["location"] },
  { test: TL.who, ids: ["faq:who", "focus-list"] },
];

/** Judgement questions ("is he good at AWS?") — the assistant can show the facts but not rate his level. */
const EVALUATIVE = /\b(good|great|excellent|expert|skilled|skillful|proficient|advanced|competent|better|stronger|strongest|weaker|weakest)\b/;
const EVAL_TOKENS = new Set(["good", "great", "excellent", "expert", "skilled", "skillful", "proficient", "advanced", "competent", "better", "stronger", "strongest", "weaker", "weakest"].map((w) => stem(w)));

const EXPLICIT_DEFINE = /\b(define|definition|meaning|stands? for|explain|eli5|what does .* (mean|stand for))\b/;
const STARTS_WHAT_IS = /^\s*(what is|what s|whats|what are)\b/;
const YES_NO = /^\s*(does|do|did|is|are|was|were|has|have|had|can|could|will|would)\b/;

/* ========================================================================== */
/*  The guide                                                                 */
/* ========================================================================== */

interface Doc {
  fact: Fact;
  tf: Map<string, number>;
  len: number;
}

interface QueryGroup {
  orig: string;
  alts: { term: string; weight: number }[];
  unknown: boolean;
}

interface Ranked {
  fact: Fact;
  score: number;
  matched: Set<number>;
}

/** Topic words that appear everywhere — they matter less when the question also names something specific. */
const GENERIC = new Set(["experience", "work", "skill", "tool", "technology", "stack", "background", "history", "project"].map((w) => stem(w)));

/** Words that only ask ABOUT the topic being discussed ("what tech did he use?") — they name no subject of their own. */
const TOPICAL_TOKENS = new Set(["use", "used", "using", "tech", "technology", "technologie", "stack", "tool", "role", "challenge", "outcome", "result", "team", "teammate", "duration", "link", "github", "demo", "repo", "code", "source", "built", "highlight"].map((w) => stem(w)));

const K1 = 1.2;
const B = 0.75;
const MIN_COVERAGE = 0.5;
const MIN_SCORE = 1.0;

export function createGuide(corpus: Fact[] = buildCorpus()) {
  /* ------------------------------ Index ------------------------------ */
  const docs: Doc[] = corpus.map((fact) => {
    const tokens = [
      ...Array(3).fill(tokenize(fact.title)).flat(),
      ...Array(2).fill((fact.keywords ?? []).flatMap((k) => tokenize(k))).flat(),
      ...tokenize(fact.text),
    ];
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    return { fact, tf, len: tokens.length };
  });
  const N = docs.length;
  const avgLen = docs.reduce((s, d) => s + d.len, 0) / Math.max(N, 1);
  const df = new Map<string, number>();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const idf = (t: string) => {
    const n = df.get(t) ?? 0;
    return Math.log(1 + (N - n + 0.5) / (n + 0.5));
  };
  const idfMax = Math.log(1 + (N - 1 + 0.5) / 1.5);
  const vocab = [...df.keys()];
  const byId = new Map(corpus.map((f) => [f.id, f]));

  const bm25 = (d: Doc, term: string) => {
    const f = d.tf.get(term);
    if (!f) return 0;
    return idf(term) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.len) / avgLen)));
  };

  /** Fixes a typo by finding the nearest known word (only for longer words, same first letter). */
  const correct = (t: string): string | null => {
    const max = t.length >= 9 ? 2 : t.length >= 5 ? 1 : 0;
    if (!max) return null;
    let best: string | null = null;
    let bestD = max + 1;
    for (const v of vocab) {
      if (v[0] !== t[0] || Math.abs(v.length - t.length) > max) continue;
      if (t.length < 8 && (v.startsWith(t) || t.startsWith(v))) continue;
      const dist = distance(t, v, max);
      if (dist < bestD || (dist === bestD && best && (df.get(v) ?? 0) > (df.get(best) ?? 0))) {
        best = v;
        bestD = dist;
      }
    }
    return bestD <= max ? best : null;
  };

  const groupsFor = (tokens: string[]): QueryGroup[] =>
    tokens.map((t) => {
      const alts: { term: string; weight: number }[] = [];
      if (df.has(t)) alts.push({ term: t, weight: 1 });
      for (const s of SYN.get(t) ?? []) if (df.has(s)) alts.push({ term: s, weight: 0.75 });
      if (!alts.length) {
        const fixed = correct(t);
        if (fixed) {
          alts.push({ term: fixed, weight: 0.9 });
          for (const s of SYN.get(fixed) ?? []) if (df.has(s)) alts.push({ term: s, weight: 0.7 });
        }
      }
      return { orig: t, alts, unknown: alts.length === 0 };
    });

  const isGeneric = (g: QueryGroup) => GENERIC.has(g.orig) || (g.alts[0] ? GENERIC.has(g.alts[0].term) : false);
  const groupWeight = (g: QueryGroup) => (g.unknown ? idfMax : idf(g.alts[0].term));

  const rank = (groups: QueryGroup[], allow: (f: Fact) => boolean, boostFor?: (f: Fact) => number): Ranked[] => {
    const known = groups.map((g, i) => ({ g, i })).filter(({ g }) => !g.unknown);
    const hasSpecific = groups.some((g) => !isGeneric(g));
    const damp = (g: QueryGroup) => (hasSpecific && isGeneric(g) ? 0.4 : 1);
    const out: Ranked[] = [];
    for (const d of docs) {
      if (!allow(d.fact)) continue;
      let score = 0;
      const matched = new Set<number>();
      for (const { g, i } of known) {
        let best = 0;
        for (const a of g.alts) best = Math.max(best, bm25(d, a.term) * a.weight * damp(g));
        if (best > 0) {
          score += best;
          matched.add(i);
        }
      }
      if (score <= 0) continue;
      // Exact title match: every word of the fact's title appears in the question.
      const titleTokens = tokenize(d.fact.title);
      if (titleTokens.length && titleTokens.every((t) => groups.some((g) => g.alts.some((a) => a.term === t)))) score *= 1.25;
      score *= (d.fact.boost ?? 1) * (boostFor ? boostFor(d.fact) : 1);
      out.push({ fact: d.fact, score, matched });
    }
    return out.sort((a, b) => b.score - a.score);
  };

  /* ------------------------------ Helpers ------------------------------ */
  const personalLinks = (S: GuideStrings, question?: string): GuideLink[] => {
    const subject = encodeURIComponent(GUIDE.emailSubject);
    const body = question ? encodeURIComponent(S.emailBody(question.slice(0, 300))) : "";
    const linkedin = socials.find((s) => s.id === "linkedin");
    return [
      { label: S.emailLabel, to: `mailto:${profile.email}?subject=${subject}${body ? `&body=${body}` : ""}`, external: true },
      { label: S.contactLabel, to: "/contact" },
      ...(linkedin ? [{ label: S.linkedinLabel, to: linkedin.href, external: true }] : []),
    ];
  };

  const starters = (lang: Lang = "en"): string[] => STRINGS[lang].starters(projects[0]?.title);

  const pickFollowUps = (ranked: Ranked[], skipGroups: Set<string>, lang: Lang): string[] => {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const r of ranked) {
      const q = lang === "tl" ? r.fact.askTl : r.fact.ask;
      if (!q || skipGroups.has(r.fact.group) || seen.has(q)) continue;
      seen.add(q);
      out.push(q);
      if (out.length === 3) break;
    }
    for (const s of starters(lang)) {
      if (out.length >= 3) break;
      if (!seen.has(s)) out.push(s);
    }
    return out;
  };

  /** The words in the visitor's question that appear nowhere on the site, in the visitor's own spelling. */
  const unknownFrom = (raw: string, groups: QueryGroup[]): string[] => {
    const original = raw.match(/[A-Za-z0-9+#.']+/g) ?? [];
    return groups
      .filter((g) => g.unknown)
      .map((g) => original.find((w) => stem(normalize(w)) === g.orig)?.replace(/^[.']+|[.']+$/g, "") ?? g.orig);
  };

  const uniqLinks = (facts: Fact[], max = 2): GuideLink[] => {
    const seen = new Set<string>();
    const out: GuideLink[] = [];
    for (const f of facts) {
      for (const l of f.links ?? []) {
        if (seen.has(l.to)) continue;
        seen.add(l.to);
        out.push(l);
        if (out.length >= max) return out;
      }
    }
    return out;
  };

  /** Best experience / project evidence mentioning the same terms (used to ground definitions and yes/no answers). */
  const evidence = (groups: QueryGroup[], exclude: Set<string>): Fact | null => {
    const r = rank(groups, (f) => (f.group.startsWith("exp:") || f.group.startsWith("proj:")) && f.kind === "detail" && !exclude.has(f.id));
    return r[0] && r[0].score > 1.5 ? r[0].fact : null;
  };

  const smalltalk = (lang: Lang, text: string, extra: Partial<GuideAnswer> = {}): GuideAnswer => ({
    kind: "smalltalk",
    text,
    links: [],
    followUps: starters(lang).slice(0, 4),
    sources: [],
    lang,
    ...extra,
  });

  const fallback = (
    question: string,
    kind: "unknown" | "privacy" | "offTopic",
    lang: Lang,
    unknownWords: string[] = [],
    related: Ranked[] = [],
  ): GuideAnswer => {
    const S = STRINGS[lang];
    const base = kind === "privacy" ? S.privacy : kind === "offTopic" ? S.offTopic : S.fallback;
    const note = unknownWords.length ? S.notFound(unknownWords) : "";
    return {
      kind: "fallback",
      text: note ? `${base}\n\n${note}` : base,
      links: personalLinks(S, question),
      followUps: pickFollowUps(related, new Set(), lang),
      sources: [],
      lang,
    };
  };

  const fromIds = (ids: string[], lang: Lang, ranked: Ranked[] = []): GuideAnswer => {
    const facts = ids.map((id) => byId.get(id)).filter((f): f is Fact => Boolean(f));
    return {
      kind: "answer",
      text: facts.map((f) => f.text).join("\n\n"),
      links: uniqLinks(facts),
      followUps: pickFollowUps(ranked, new Set(facts.map((f) => f.group)), lang),
      sources: facts.map((f) => f.id),
      lang,
      group: facts[0]?.group,
      shown: facts.map((f) => f.id),
    };
  };

  /** Writes the answer: the best fact, plus the most relevant supporting points from the same topic. */
  const compose = (ranked: Ranked[], opts: { yes?: boolean; groups: QueryGroup[]; ctx: GuideContext; lang: Lang }): GuideAnswer => {
    const S = STRINGS[opts.lang];
    const top = ranked[0];
    const best = top.fact;
    const used: Fact[] = [best];
    const lines: string[] = [];
    const sameGroup = ranked.filter((r) => r.fact.group === best.group && r.fact.id !== best.id);

    const family = (g: string) => g.split(":")[0];
    const peers =
      best.kind === "overview"
        ? ranked.filter((r) => r.fact.kind === "overview" && r.fact.group !== best.group && family(r.fact.group) === family(best.group) && r.score >= 0.8 * top.score).slice(0, 3)
        : [];

    if (peers.length) {
      const all = [best, ...peers.map((p) => p.fact)];
      all.forEach((f) => used.push(...(used.includes(f) ? [] : [f])));
      lines.push(S.found);
      for (const f of all) lines.push(`• ${f.text}`);
    } else if (best.kind === "detail") {
      lines.push(best.text);
      const extras = sameGroup.filter((r) => r.fact.kind === "detail" && r.score >= 0.6 * top.score).slice(0, 3);
      for (const r of extras) {
        lines.push(`• ${r.fact.short ?? r.fact.text}`);
        used.push(r.fact);
      }
      // Skill facts are thin on their own — back them up with real evidence.
      if (best.group.startsWith("skills:")) {
        const ev = evidence(opts.groups, new Set(used.map((u) => u.id)));
        if (ev) {
          lines.push(`${S.inWork} ${ev.text}`);
          used.push(ev);
        }
      }
    } else if (best.kind === "overview") {
      lines.push(best.text);
      const details = sameGroup.filter((r) => r.fact.kind === "detail" && r.score >= 0.45 * top.score).slice(0, 3);
      for (const r of details) {
        lines.push(`• ${r.fact.short ?? r.fact.text}`);
        used.push(r.fact);
      }
    } else if (best.kind === "glossary") {
      lines.push(best.text);
      const ev = evidence(groupsFor(tokenize((best.evidence ?? []).join(" "))), new Set());
      if (ev) {
        lines.push(`${S.inWork} ${ev.text}`);
        used.push(ev);
      }
    } else {
      lines.push(best.text);
    }

    // A strong answer from a different topic is worth a second paragraph (e.g. a skill AND the project that used it).
    const other = ranked.find((r) => r.fact.group !== best.group && r.score >= 0.85 * top.score && r.fact.kind !== "glossary" && !used.includes(r.fact));
    if (other && best.kind !== "list" && other.fact.kind !== "list" && lines.length < 4) {
      lines.push(other.fact.kind === "detail" ? other.fact.text : other.fact.text.split("\n")[0]);
      used.push(other.fact);
    }

    let text = lines.join("\n");
    if (opts.yes) text = `${S.yes} ${text}`;
    const shownSet = new Set(used.map((f) => f.id));
    if (opts.ctx.group === best.group) for (const id of opts.ctx.shown ?? []) shownSet.add(id);
    const hasMore = corpus.some((f) => f.group === best.group && f.kind === "detail" && !shownSet.has(f.id));
    return {
      kind: "answer",
      text: hasMore && best.kind !== "list" ? `${text}\n\n${S.moreHint}` : text,
      links: uniqLinks(used),
      followUps: pickFollowUps(ranked, new Set([best.group]), opts.lang),
      sources: used.map((f) => f.id),
      lang: opts.lang,
      group: best.group,
      shown: [...shownSet],
    };
  };

  const more = (ctx: GuideContext, lang: Lang): GuideAnswer => {
    const S = STRINGS[lang];
    const shown = new Set(ctx.shown ?? []);
    const rest = corpus.filter((f) => f.group === ctx.group && f.kind === "detail" && !shown.has(f.id));
    if (!rest.length) {
      return { kind: "answer", text: S.moreEnd, links: [], followUps: starters(lang).slice(0, 4), sources: [], lang, group: ctx.group, shown: [...shown] };
    }
    const next = rest.slice(0, 4);
    return {
      kind: "answer",
      text: `${S.moreIntro}\n${next.map((f) => `• ${f.short ?? f.text}`).join("\n")}${rest.length > 4 ? `\n\n${S.moreHintAgain}` : ""}`,
      links: uniqLinks(next),
      followUps: starters(lang).slice(0, 3),
      sources: next.map((f) => f.id),
      lang,
      group: ctx.group,
      shown: [...shown, ...next.map((f) => f.id)],
    };
  };

  /* --------------------------- Smarter intents --------------------------- */
  /** "How many projects does he have?" — a real count, plus the list it came from. */
  const intentCount = (en: string, lang: Lang): GuideAnswer | null => {
    const m = en.match(/\bhow many\b.*\b(projects?|certifications?|certificates?|trainings?|awards?|honou?rs?|internships?|interns?)\b/);
    if (!m) return null;
    const word = m[1];
    const S = STRINGS[lang];
    const [what, n, listId]: ["projects" | "certifications" | "awards" | "internships", number, string] = /^project/.test(word)
      ? ["projects", corpus.filter((f) => f.kind === "overview" && f.group.startsWith("proj:")).length, "projects-list"]
      : /^(cert|training)/.test(word)
        ? ["certifications", certifications.length, "certs-list"]
        : /^(award|hono)/.test(word)
          ? ["awards", honors.length, "honors-list"]
          : ["internships", experience.filter((e) => e.type === "Internship").length, "experience-list"];
    const list = byId.get(listId);
    return {
      kind: "answer",
      text: `${S.count(n, what)}${list ? `\n\n${list.text.split("\n").slice(1).join("\n")}` : ""}`,
      links: uniqLinks(list ? [list] : []),
      followUps: pickFollowUps([], new Set(list ? [list.group] : []), lang),
      sources: list ? [list.id] : [],
      lang,
      group: list?.group,
      shown: list ? [list.id] : [],
    };
  };

  /** Month + year of a period like "Aug 2025 — May 2026" (the END of it); "2026" counts as late 2026; "Present" is the far future. */
  const endStamp = (period: string): number => {
    if (/present|ongoing|current/i.test(period)) return Number.MAX_SAFE_INTEGER;
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const all = [...period.matchAll(/(?:\b([A-Za-z]{3})[a-z]*\.?\s+)?\b(20\d\d)\b/g)];
    const last = all[all.length - 1];
    if (!last) return 0;
    const mi = last[1] ? months.indexOf(last[1].toLowerCase()) : -1;
    return Number(last[2]) * 12 + (mi >= 0 ? mi : 11);
  };

  /** "What's his latest project?", "What is he working on now?", "Where did he work most recently?" */
  const intentRecent = (en: string, lang: Lang): GuideAnswer | null => {
    const S = STRINGS[lang];
    const ongoing = /\b(current|currently|ongoing|working on|building|developing|now)\b/.test(en);
    const asksProject =
      /\b(latest|newest|most recent|recent|recently|last|current|currently|ongoing|new)\b.*\b(project|built|made|created|developed|app|system)\b/.test(en) ||
      /\b(project|built|made|created)\b.*\b(latest|newest|most recent|recently|currently|ongoing|now)\b/.test(en) ||
      /\bworking on\b|\bwhat current\b|\b(is|s) (he|john) (building|developing|making)\b/.test(en);
    if (asksProject) {
      const pool = projects.filter((p) => byId.has(`proj:${p.slug}`));
      const live = ongoing ? pool.filter((p) => p.status === "In progress") : [];
      const pick = (live.length ? live : pool).slice().sort((a, b) => endStamp(b.period) - endStamp(a.period) || a.order - b.order)[0];
      const fact = pick && byId.get(`proj:${pick.slug}`);
      if (fact) {
        const a = fromIds([fact.id], lang);
        return { ...a, text: `${live.length ? S.ongoingProject : S.latestProject}\n${a.text}` };
      }
    }
    const asksRole =
      /\b(latest|most recent|recent|last|current|currently)\b.*\b(job|work|internship|intern|role|position|company|employer|experience)\b/.test(en) ||
      /\bwhere (does|did|is) (he|john) (work|worked|working|intern|interned)\b.*\b(now|currently|last|recently)\b/.test(en) ||
      /\bwhere (is|does) (he|john) (work|working)\b/.test(en);
    if (asksRole) {
      const job = experience.find((e) => e.type !== "Project");
      const fact = job && byId.get(`exp:${job.id}`);
      if (fact) {
        const a = fromIds([fact.id], lang);
        return { ...a, text: `${S.latestRole}\n${a.text}` };
      }
    }
    return null;
  };

  /** "Compare Terraform and CloudFormation" — one best fact per thing being compared. */
  const intentCompare = (en: string, lang: Lang): GuideAnswer | null => {
    if (!/\b(compare|versus|vs|differences?|differ|better than|how (is|are) .* different)\b/.test(en)) return null;
    const groups = groupsFor(tokenize(en)).filter((g) => !g.unknown && !isGeneric(g));
    const picked: Fact[] = [];
    for (const g of groups) {
      const best = rank([g], (f) => f.kind === "detail" || f.kind === "glossary" || f.kind === "overview")[0];
      if (best && best.score >= 1.5 && !picked.some((p) => p.id === best.fact.id)) picked.push(best.fact);
    }
    if (picked.length < 2) return null;
    const S = STRINGS[lang];
    const shown = picked.slice(0, 4);
    return {
      kind: "answer",
      text: `${S.compareIntro}\n${shown.map((f) => `• ${f.text}`).join("\n")}`,
      links: uniqLinks(shown),
      followUps: pickFollowUps([], new Set(shown.map((f) => f.group)), lang),
      sources: shown.map((f) => f.id),
      lang,
      group: shown[0].group,
      shown: shown.map((f) => f.id),
    };
  };

  /* ------------------------------ ask() ------------------------------ */
  function ask(raw: string, ctx: GuideContext = {}): GuideAnswer {
    const query = raw.trim().slice(0, 300);
    const norm = normalize(query);
    const lang: Lang = detectLang(norm) === "tl" || (ctx.lang === "tl" && norm.split(" ").length <= 3) ? "tl" : "en";
    const S = STRINGS[lang];
    if (!norm) return smalltalk(lang, S.empty);
    // Filipino / Taglish is translated into the English words the site is written in; English passes through unchanged.
    const en = toEnglish(norm);
    const is = (re: RegExp) => re.test(norm) || re.test(en);
    const words = norm.split(" ").length;

    // 1. Small talk
    if ((GREETING.test(norm) || TL.greeting.test(norm)) && words <= 4) return smalltalk(lang, S.greeting);
    if (is(THANKS) || TL.thanks.test(norm)) if (words <= 6) return smalltalk(lang, S.thanks, { links: personalLinks(S).slice(1, 2) });
    if ((BYE.test(norm) || TL.bye.test(norm)) && words <= 6) return smalltalk(lang, S.bye, { links: personalLinks(S).slice(1, 2), followUps: [] });
    if (is(IDENTITY) || TL.identity.test(norm)) return smalltalk(lang, S.identity);
    if (is(HELP) || TL.help.test(norm)) return smalltalk(lang, S.help);

    // 2. Private topics
    if (is(PRIVATE)) return fallback(query, "privacy", lang);

    // 3. "Tell me more"
    if ((MORE.test(norm) || TL.more.test(norm)) && ctx.group) return more(ctx, lang);

    // 4. Direct shortcuts
    const yesNoQuestion = YES_NO.test(en) || isTagalogYesNo(norm);
    for (const s of [...SHORTCUTS, ...TL_SHORTCUTS]) {
      if (!is(s.test)) continue;
      const a = fromIds(s.ids, lang);
      return s.ids[0] === "availability" && yesNoQuestion ? { ...a, text: `${S.yes} ${a.text}` } : a;
    }
    if (is(WORK_TERMS) && is(WORK_CONTEXT)) return fallback(query, "unknown", lang);

    // 4b. Smarter question types: "how many…", "latest / current…", "compare A and B"
    const counted = intentCount(en, lang);
    if (counted) return counted;
    const recent = intentRecent(en, lang);
    if (recent) return recent;
    const compared = intentCompare(en, lang);
    if (compared) return compared;

    // 5. Off-topic
    if ((is(OFF_TOPIC) || TL.offTopic.test(norm)) && !/\b(john|aldwin|his|him|he|portfolio)\b/.test(en)) return fallback(query, "offTopic", lang);

    // 6. Retrieval
    const evaluative = is(EVALUATIVE);
    const tokens = tokenize(en).filter((t) => !(evaluative && EVAL_TOKENS.has(t)));
    const anaphoric = TL.anaphora.test(norm) || /\b(it|its|that|this|those|these|there|them|same)\b/.test(en);
    const moreish = /\b(what else|else|other|another|besides|ano pa|ano pang|may iba pa|iba pa|meron pa|mayroon pa)\b/.test(en) || /\b(ano pa|ano pang|iba pa)\b/.test(norm);
    if (tokens.length === 0 && ctx.group && (anaphoric || moreish)) return more(ctx, lang);
    if (tokens.length === 0) {
      // Only filler words left ("tell me about him") — the sensible default is the intro.
      if (/\b(john|aldwin|him|his|he|yourself|you|siya|kanya|kaniya)\b/.test(norm)) return fromIds(["faq:who", "focus-list"], lang);
      return fallback(query, "unknown", lang);
    }
    const groups = groupsFor(tokens);
    // "What is GitOps?" wants a definition; "what's his experience with Kubernetes?" does not.
    const definitional = !groups.some(isGeneric) && (EXPLICIT_DEFINE.test(en) || ((STARTS_WHAT_IS.test(en) || /^\s*ano\b/.test(norm)) && tokens.length <= 3));
    const allowGlossary = (f: Fact) => f.kind !== "glossary" || definitional;
    let ranked = rank(groups, allowGlossary, (f) => (f.kind === "glossary" && definitional ? 1.6 : 1));
    let usedGlossaryFallback = false;
    if (!ranked.length || ranked[0].score < MIN_SCORE) {
      ranked = rank(groups, () => true);
      usedGlossaryFallback = true;
    }
    // Follow-ups like "what tech did he use?" or "ano ang challenges doon?" stay inside the topic of the last answer.
    const inProject = Boolean(ctx.group && /^(proj|exp):/.test(ctx.group));
    const topical = inProject && /\b(use|used|using|tech|technologies|stack|tools?|role|challenges?|outcomes?|results?|team|teammates|duration|link|links|github|demo|repo|code|source|built|highlights?)\b/.test(en);
    if (ctx.group && (anaphoric || topical)) {
      const inCtx = rank(groups, (f) => f.group === ctx.group && f.kind !== "glossary" && f.kind !== "list");
      if (inCtx.length && inCtx[0].score >= MIN_SCORE * 0.8 && (!ranked.length || inCtx[0].score >= 0.45 * ranked[0].score)) {
        ranked = [...inCtx, ...ranked.filter((r) => r.fact.group !== ctx.group)];
      } else if (topical && groups.every((g) => TOPICAL_TOKENS.has(g.orig) || isGeneric(g))) {
        // "what tech did he use?" / "what was his role?" — the project's own summary line already says it ("Role: …  Built with …").
        const overview = corpus.find((f) => f.group === ctx.group && f.kind === "overview");
        if (overview) return fromIds([overview.id], lang);
      }
    }
    if (!ranked.length) return fallback(query, "unknown", lang, unknownFrom(query, groups));

    // "Where did he study?" matches one school slightly better than the whole education list — prefer the list when it is a near-tie.
    const topicOf = (g: string) => ({ edu: "education", exp: "experience", proj: "projects" } as Record<string, string>)[g.split(":")[0]] ?? g.split(":")[0];
    if (ranked[0].fact.kind === "overview") {
      const topic = topicOf(ranked[0].fact.group);
      const entries = ranked.filter((r) => r.fact.kind === "overview" && topicOf(r.fact.group) === topic && r.score >= 0.6 * ranked[0].score);
      const list = ranked.find((r) => r.fact.kind === "list" && r.fact.group === topic && r.score >= 0.9 * ranked[0].score);
      if (entries.length >= 2 && list) ranked = [list, ...ranked.filter((r) => r !== list)];
    }

    // Coverage: how much of the question (weighted by rarity) is explained by the best matches?
    const top = ranked[0];
    const window = ranked.filter((r) => r.fact.group === top.fact.group && r.score >= 0.4 * top.score).slice(0, 5);
    const covered = new Set<number>();
    window.forEach((r) => r.matched.forEach((i) => covered.add(i)));
    const specific = groups.some((g) => !isGeneric(g));
    const weightOf = (g: QueryGroup) => groupWeight(g) * (specific && isGeneric(g) ? 0.4 : 1);
    const total = groups.reduce((s, g) => s + weightOf(g), 0);
    const got = [...covered].reduce((s, i) => s + weightOf(groups[i]), 0);
    const coverage = total ? got / total : 0;
    const unknownWords = unknownFrom(query, groups);

    const isYesNo = !evaluative && (YES_NO.test(en) || (isTagalogYesNo(norm) && !TL_WH.test(norm)));
    if (top.score < MIN_SCORE || coverage < MIN_COVERAGE || (isYesNo && coverage < 0.85)) {
      return fallback(query, "unknown", lang, unknownWords, ranked);
    }
    // A glossary definition only makes sense for a "what is …" question.
    const answer =
      usedGlossaryFallback && top.fact.kind === "glossary" && !definitional
        ? compose(ranked, { groups, ctx, lang })
        : compose(ranked, { yes: isYesNo && top.fact.kind !== "glossary", groups, ctx, lang });
    return evaluative ? { ...answer, text: `${S.evalNote}\n${answer.text}` } : answer;
  }

  /** Shows how a question was understood and which facts matched best (for debugging / tuning). */
  function explain(raw: string) {
    const en = toEnglish(normalize(raw));
    const groups = groupsFor(tokenize(en));
    const ranked = rank(groups, () => true);
    return {
      english: en,
      tokens: groups.map((g) => ({ word: g.orig, matches: g.alts.map((a) => a.term), unknown: g.unknown })),
      top: ranked.slice(0, 6).map((r) => ({ id: r.fact.id, score: Math.round(r.score * 100) / 100, matched: [...r.matched].map((i) => groups[i].orig) })),
    };
  }

  return { ask, starters, explain, facts: corpus };
}

let singleton: ReturnType<typeof createGuide> | null = null;
/** The shared guide instance (built lazily on first use, so it never slows the page load). */
export const getGuide = () => (singleton ??= createGuide());
