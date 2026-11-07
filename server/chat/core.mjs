// server/chat/core.mjs
import { GoogleGenAI } from "@google/genai";
import { KNOWLEDGE } from "./knowledge.generated.mjs";

const cfg = () => ({
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  maxTokens: Number(process.env.MAX_OUTPUT_TOKENS) || 450,
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "https://aldwinsamson.com,https://www.aldwinsamson.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  allowLocalhost: process.env.ALLOW_LOCALHOST === "true",
  perMinute: Number(process.env.RATE_PER_MINUTE) || 8,
  perHour: Number(process.env.RATE_PER_HOUR) || 40,
  perDayGlobal: Number(process.env.DAILY_LIMIT) || 400,
  contactEmail: process.env.CONTACT_EMAIL || "aldwinsamsonn@gmail.com",
  debug: process.env.CHAT_DEBUG === "true",
});

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

  try {
    const ai = clientImpl || new GoogleGenAI({ apiKey });

    const contents = norm.turns.map((t) => ({
      role: t.role === "assistant" ? "model" : "user",
      parts: [{ text: t.content }],
    }));

    const response = await ai.models.generateContent({
      model: c.model,
      contents,
      config: {
        systemInstruction: buildSystemPrompt(c.contactEmail),
        temperature: 0.3,
        maxOutputTokens: c.maxTokens,
        // Gemini 2.5 "thinking" tokens count against maxOutputTokens and can
        // leave an empty reply. Short Q&A doesn't need thinking.
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

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
      model: c.model,
      hasKey: Boolean(apiKey),
      keyLength: apiKey.length,
    });

    return json(
      502,
      c.debug
        ? { error: "upstream", name: err?.name, message: err?.message, status: err?.status, code: err?.code }
        : { error: "upstream" },
      cors
    );
  }
}