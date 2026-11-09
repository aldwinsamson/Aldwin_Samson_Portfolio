export interface AiTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AiReply {
  text: string;
  followUps: string[];
}

export type AiErrorKind = "rate" | "timeout" | "network" | "server" | "aborted";

export class AiError extends Error {
  constructor(public readonly kind: AiErrorKind) {
    super(`AI request failed: ${kind}`);
  }
}

const url = (import.meta.env.VITE_CHAT_API_URL as string | undefined)?.trim() ?? "";

export const aiConfigured = url.length > 0;

const TIMEOUT_MS = 22_000;

export async function askAi(turns: AiTurn[], signal?: AbortSignal): Promise<AiReply> {
  if (!aiConfigured) throw new AiError("server");

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: turns }),
      signal: controller.signal,
    });
    if (res.status === 429) throw new AiError("rate");
    if (!res.ok) throw new AiError("server");

    const data: unknown = await res.json();
    const text = typeof (data as AiReply)?.text === "string" ? (data as AiReply).text.trim() : "";
    if (!text || text.length > 4000) throw new AiError("server");
    const raw = (data as AiReply).followUps;
    const followUps = Array.isArray(raw) ? raw.filter((f): f is string => typeof f === "string" && f.length <= 80).slice(0, 3) : [];
    return { text, followUps };
  } catch (err) {
    if (err instanceof AiError) throw err;
    if (signal?.aborted) throw new AiError("aborted");
    if (timedOut) throw new AiError("timeout");
    throw new AiError("network");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}
