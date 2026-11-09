import { handleChat } from "../server/chat/core.mjs";

export default async function handler(req, res) {
  const bodyText = typeof req.body === "string" ? req.body : req.body ? JSON.stringify(req.body) : "";
  const out = await handleChat({
    method: req.method,
    origin: req.headers.origin,
    host: req.headers.host,
    ip: (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress,
    bodyText,
    apiKey: process.env.GEMINI_API_KEY,
  });
  for (const [k, v] of Object.entries(out.headers)) res.setHeader(k, v);
  res.status(out.status).send(out.body);
}