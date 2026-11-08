// server/chat/core.mjs
import { GoogleGenAI } from "@google/genai";
import { KNOWLEDGE } from "./knowledge.generated.mjs";

const cfg = () => ({
  model: (process.env.GEMINI_MODEL || "").trim(),
  // Newer Gemini models spend part of this budget on internal "thinking", so keep it generous.
  // The prompt itself keeps answers short (under ~120 words).
  maxTokens: Number(process.env.MAX_OUTPUT_TOKENS) || 1024,
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "https://aldwinsamson.com,https://www.aldwinsamson.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  allowLocalhost: process.env.ALLOW_LOCALHOST === "true",
  perMinute: Number(process.env.RATE_PER_MINUTE) || 8,
  perHour: Number(process.env.RATE_PER_HOUR) || 40,
  perDayGlobal: Number(process.env.DAILY_LIMIT) || 400,
  contactEmail: process.env.CONTACT_EMAIL || "aldwinsamsonn@gmail.com",
  debug: /^(true|1|yes|on)$/i.test((process.env.CHAT_DEBUG || "").trim().replace(/^["']|["']$/g, "")),
  // The website gives up after 22 s, so the server answers (or fails) well before that.
  modelTimeoutMs: Number(process.env.MODEL_TIMEOUT_MS) || 7000,
  totalBudgetMs: Number(process.env.TOTAL_BUDGET_MS) || 17000,
});

// Tried in order. GEMINI_MODEL (if set) goes first. Lite models first: they answer in 1-3 s, which is plenty for
// questions about a CV. We move to the next model when Google says the model does not exist / is not offered to this
// key (404, "no longer available", ...) or when a model is too slow (timeout). Never on auth, quota or server errors.
const FALLBACK_MODELS = ["gemini-flash-lite-latest", "gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-2.5-flash"];

export const modelChain = (c = cfg()) => [...new Set([c.model, ...FALLBACK_MODELS].filter(Boolean))];

// Safe, secret-free label for what went wrong, returned to the browser so a failure can be diagnosed without logs.
export function failureReason(err) {
  if (isTimeout(err)) return "timeout";
  const status = Number(err?.status ?? err?.code);
  const msg = String(err?.message || "");
  if (status === 429 || /quota|rate.?limit|resource.?exhausted/i.test(msg)) return "quota";
  if (status === 401 || status === 403 || /api key|permission|unauthenticated|PERMISSION_DENIED/i.test(msg)) return "key_rejected";
  if (status === 404 || /not found|no longer available|new users/i.test(msg)) return "model_unavailable";
  if (/fetch failed|ENOTFOUND|ECONN|ETIMEDOUT|network/i.test(msg)) return "network";
  if (status === 400) return "bad_request";
  return "other";
}

const isTimeout = (err) => err?.name === "TimeoutError" || err?.name === "AbortError" || Number(err?.status) === 504;

export function shouldTryNextModel(err) {
  if (isTimeout(err)) return true;
  const status = Number(err?.status ?? err?.code);
  if ([401, 403, 429].includes(status) || status >= 500) return false;
  if (status === 404) return true;
  return /not found|no longer available|not available|not supported|unsupported|deprecated|new users|has been shut down/i.test(
    String(err?.message || ""),
  );
}

// Keep the model's internal "thinking" minimal: it is the main reason answers get slow.
const thinkingFor = (model) => (model.includes("2.5") ? { thinkingBudget: 0 } : { thinkingLevel: "LOW" });

function withTimeout(promise, ms) {
  promise.catch(() => {}); // the losing side of the race must never become an unhandled rejection
  let timer;
  const limit = new Promise((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error(`model timed out after ${ms} ms`), { name: "TimeoutError", status: 504 })), ms);
  });
  return Promise.race([promise, limit]).finally(() => clearTimeout(timer));
}

const MAX_USER_CHARS = 300;
const MAX_ASSISTANT_CHARS = 1500;
const MAX_TURNS = 8;
const MAX_BODY_BYTES = 8 * 1024;

export function buildSystemPrompt(email = cfg().contactEmail) {
  return `You are the assistant on the portfolio website of John Aldwin R. Samson. On the site he is called "John". You answer visitors' questions about John using only the KNOWLEDGE section below.

RULES
1. Use only facts that are in KNOWLEDGE. Never guess, never fill gaps, never use outside knowledge about John. If the answer is not there, say it is not listed on the site and suggest emailing John at ${email}.
2. Keep answers short: one to three short paragraphs, or up to five bullet lines, usually under 120 words. Plain text only. Start each bullet line with "• ".
3. Finish with one last line in exactly this form, and nothing after it:
FOLLOWUPS: first question | second question | third question

KNOWLEDGE
${KNOWLEDGE}`;
}

const json = (status, body, headers = {}) => ({
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  body: JSON.stringify(body),
});

function corsHeaders(origin, c, host) {
  const ok = isAllowedOrigin(origin, c, host);
  if (!ok || !origin) return { vary: "Origin" };
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

function isAllowedOrigin(origin, c, host = "") {
  if (!origin) return true;
  if (c.allowedOrigins.includes(origin)) return true;
  if (host) {
    try {
      if (new URL(origin).host === host.toLowerCase()) return true;
    } catch {}
  }
  if (c.allowLocalhost && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

const clean = (s) =>
  String(s)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export function normaliseTurns(input) {
  if (!Array.isArray(input) || input.length === 0 || input.length > 40) return { error: "messages must be a non-empty list" };
  const turns = [];
  for (const m of input) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return { error: "bad message" };
    const max = m.role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS;
    const content = clean(m.content).slice(0, max);
    if (!content) continue;
    const last = turns[turns.length - 1];
    if (last && last.role === m.role) last.content = content;
    else turns.push({ role: m.role, content });
  }
  while (turns.length && turns[0].role !== "user") turns.shift();
  const recent = turns.slice(-MAX_TURNS);
  while (recent.length && recent[0].role !== "user") recent.shift();
  if (!recent.length || recent[recent.length - 1].role !== "user") return { error: "the last message must be from the user" };
  return { turns: recent };
}

export function parseReply(raw) {
  const text = String(raw || "").trim();
  const i = text.lastIndexOf("FOLLOWUPS:");
  if (i === -1) return { text: text.replace(/\*\*/g, ""), followUps: [] };
  const answer = text.slice(0, i).trim().replace(/\*\*/g, "");
  const followUps = text
    .slice(i + "FOLLOWUPS:".length)
    .split("|")
    .map((s) => s.replace(/^[\s\-•\d.)]+/, "").trim())
    .filter((s) => s && s.length <= 80)
    .slice(0, 3);
  return { text: answer, followUps };
}

const hits = new Map();
let day = { key: "", count: 0 };

function rateLimited(ip, c, now = Date.now()) {
  const today = new Date(now).toISOString().slice(0, 10);
  if (day.key !== today) day = { key: today, count: 0 };
  if (day.count >= c.perDayGlobal) return "day";

  const list = (hits.get(ip) || []).filter((t) => now - t < 3_600_000);
  const lastMinute = list.filter((t) => now - t < 60_000).length;
  if (lastMinute >= c.perMinute || list.length >= c.perHour) {
    hits.set(ip, list);
    return "visitor";
  }
  list.push(now);
  hits.set(ip, list);
  day.count += 1;
  return null;
}

export async function handleChat(req, clientImpl = null) {
  const c = cfg();
  const origin = req.origin || "";
  const cors = corsHeaders(origin, c, req.host);

  if (!isAllowedOrigin(origin, c, req.host)) return json(403, { error: "origin not allowed" }, cors);
  if (req.method === "OPTIONS") return { status: 204, headers: cors, body: "" };
  if (req.method !== "POST") return json(405, { error: "use POST" }, cors);

  const apiKey = (req.apiKey || process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) return json(503, { error: "not configured" }, cors);

  const bodyText = req.bodyText || "";
  if (Buffer.byteLength(bodyText, "utf8") > MAX_BODY_BYTES) return json(413, { error: "request too large" }, cors);

  let parsed;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    return json(400, { error: "invalid JSON" }, cors);
  }
  const norm = normaliseTurns(parsed?.messages);
  if (norm.error) return json(400, { error: norm.error }, cors);

  const limited = rateLimited(req.ip || "unknown", c);
  if (limited) return json(429, { error: "rate limited", scope: limited }, { ...cors, "retry-after": "60" });

  const ai = clientImpl || new GoogleGenAI({ apiKey });
  const contents = norm.turns.map((t) => ({
    role: t.role === "assistant" ? "model" : "user",
    parts: [{ text: t.content }],
  }));

  const tried = [];
  let response = null;
  let lastErr = null;
  try {
    const deadline = Date.now() + c.totalBudgetMs;
    for (const model of modelChain(c)) {
      const left = deadline - Date.now();
      if (left < 1500) break;
      const timeoutMs = Math.min(c.modelTimeoutMs, left);
      tried.push(model);
      let withThinking = true;
      for (;;) {
        try {
          response = await withTimeout(
            ai.models.generateContent({
              model,
              contents,
              config: {
                systemInstruction: buildSystemPrompt(c.contactEmail),
                temperature: 0.3,
                maxOutputTokens: c.maxTokens,
                abortSignal: AbortSignal.timeout(timeoutMs),
                ...(withThinking ? { thinkingConfig: thinkingFor(model) } : {}),
              },
            }),
            timeoutMs,
          );
          break;
        } catch (err) {
          lastErr = err;
          console.error("chat_model_failed", { model, status: err?.status, name: err?.name, message: err?.message });
          // A model that rejects the thinking setting gets one more try without it.
          if (withThinking && /thinking/i.test(String(err?.message || ""))) {
            withThinking = false;
            continue;
          }
          if (!shouldTryNextModel(err)) throw err;
          break;
        }
      }
      if (response) break;
    }
    if (!response) throw lastErr || new Error("no model available");

    const raw = response.text || "";
    const reply = parseReply(raw);
    if (!reply.text) {
      console.error("chat_empty_reply", {
        finishReason: response?.candidates?.[0]?.finishReason,
        blockReason: response?.promptFeedback?.blockReason,
      });
      return json(502, { error: "empty reply" }, cors);
    }
    return json(200, reply, cors);
  } catch (err) {
    console.error("chat_failed", {
      name: err?.name,
      message: err?.message,
      status: err?.status,
      code: err?.code,
      details: err?.details,
      cause: err?.cause?.message ?? err?.cause,
      stack: err?.stack,
      tried,
      hasKey: Boolean(apiKey),
      keyLength: apiKey.length,
    });

    return json(
      isTimeout(err) ? 504 : 502,
      c.debug
        ? { error: "upstream", name: err?.name, message: err?.message, status: err?.status, code: err?.code, tried }
        : { error: isTimeout(err) ? "timeout" : "upstream", reason: failureReason(err), status: Number(err?.status) || undefined, tried },
      cors
    );
  }
}
// Test helper (used by selftest.mjs): clears the in-memory rate-limit state.
export const _test = {
  reset() {
    hits.clear();
    day = { key: "", count: 0 };
  },
};
