// Vercel serverless function for the portfolio assistant: POST /api/chat
// It only translates Vercel's request shape; all the logic lives in server/chat/core.mjs (shared with the AWS Lambda).
//
// Environment variables (Vercel > Project > Settings > Environment Variables):
//   ANTHROPIC_API_KEY   your key. Mark it Sensitive. Never prefix it with VITE_ (that would publish it).
//   ALLOWED_ORIGINS     optional extra origins; this host (production AND previews) is always allowed (same-origin).

import { handleChat } from "../server/chat/core.mjs";

export default async function handler(req, res) {
  const bodyText = typeof req.body === "string" ? req.body : req.body ? JSON.stringify(req.body) : "";
  const out = await handleChat({
    method: req.method,
    origin: req.headers.origin,
    host: req.headers.host,
    ip: (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress,
    bodyText,
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  for (const [k, v] of Object.entries(out.headers)) res.setHeader(k, v);
  res.status(out.status).send(out.body);
}
