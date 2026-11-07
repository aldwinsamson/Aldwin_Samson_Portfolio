// server/chat/lambda.mjs
// AWS Lambda entry point (API Gateway HTTP API, payload format 2.0). Terraform sets the handler to "lambda.handler".
//
// The Anthropic API key is NOT in the code, the environment or Terraform state. It lives in SSM Parameter Store
// as a SecureString (you create it once with the AWS CLI, see README-CHANGES.md) and is read when the function starts.

import { handleChat } from "./core.mjs";

let cached = { key: "", at: 0 };
const KEY_TTL_MS = 30 * 60 * 1000;

async function getApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY; // handy for local testing only
  if (cached.key && Date.now() - cached.at < KEY_TTL_MS) return cached.key;

  const name = process.env.ANTHROPIC_API_KEY_PARAM;
  if (!name) return "";
  // The AWS SDK v3 is included in the Lambda Node.js runtime, so nothing needs to be bundled.
  const { SSMClient, GetParameterCommand } = await import("@aws-sdk/client-ssm");
  const out = await new SSMClient({}).send(new GetParameterCommand({ Name: name, WithDecryption: true }));
  cached = { key: out.Parameter?.Value || "", at: Date.now() };
  return cached.key;
}

export const handler = async (event) => {
  const method = event?.requestContext?.http?.method || event?.httpMethod || "POST";
  const headers = Object.fromEntries(Object.entries(event?.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
  const bodyText = event?.isBase64Encoded ? Buffer.from(event.body || "", "base64").toString("utf8") : event?.body || "";

  let apiKey = "";
  try {
    apiKey = await getApiKey();
  } catch (err) {
    console.error(JSON.stringify({ evt: "key_lookup_failed", name: err?.name }));
  }

  const res = await handleChat({
    method,
    origin: headers.origin,
    ip: event?.requestContext?.http?.sourceIp || headers["x-forwarded-for"]?.split(",")[0]?.trim(),
    bodyText,
    apiKey,
  });

  return { statusCode: res.status, headers: res.headers, body: res.body };
};
