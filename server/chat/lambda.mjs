import { handleChat } from "./core.mjs";

export async function handler(event, clientImpl = null) {
  const isB64 = event.isBase64Encoded;
  const rawBody = event.body || "";
  const bodyText = isB64 ? Buffer.from(rawBody, "base64").toString("utf8") : rawBody;
  const headers = {};
  for (const [k, v] of Object.entries(event.headers || {})) {
    headers[k.toLowerCase()] = v;
  }

  const out = await handleChat(
    {
      method: event.requestContext?.http?.method || "POST",
      origin: headers.origin || "",
      host: headers.host || "",
      ip: event.requestContext?.http?.sourceIp || "",
      bodyText,
      apiKey: process.env.GEMINI_API_KEY,
    },
    clientImpl
  );

  return {
    statusCode: out.status,
    headers: out.headers,
    body: out.body,
  };
}