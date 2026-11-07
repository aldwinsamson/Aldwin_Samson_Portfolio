// Use this when you move the site (and the chat backend) off AWS to Vercel.
//
//   1. Copy this file to  api/chat.js  in the repo root (Vercel turns files in /api into endpoints).
//   2. Add the key in Vercel: Project > Settings > Environment Variables > ANTHROPIC_API_KEY
//      (also set ALLOWED_ORIGINS if your domain differs from aldwinsamson.com).
//   3. Add a vercel.json so the knowledge file is shipped with the function:
//        { "functions": { "api/chat.js": { "includeFiles": "server/chat/**" } } }
//   4. In .env.production set  VITE_CHAT_API_URL=/api/chat  and redeploy.
//
// The handler logic is unchanged: it is the same core.mjs that runs on Lambda.

import { handleChat } from "../server/chat/core.mjs";

export default async function handler(req, res) {
  const bodyText = typeof req.body === "string" ? req.body : req.body ? JSON.stringify(req.body) : "";
  const out = await handleChat({
    method: req.method,
    origin: req.headers.origin,
    ip: (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress,
    bodyText,
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  for (const [k, v] of Object.entries(out.headers)) res.setHeader(k, v);
  res.status(out.status).send(out.body);
}
