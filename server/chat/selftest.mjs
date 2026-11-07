// Run with: npm run test:chat   (= node server/chat/selftest.mjs; needs Node 20+; calls no real API, client is mocked)
// Named selftest.mjs on purpose: a *.test.mjs name would be picked up by vitest (`npm test`) and fail the suite.
import { handleChat, normaliseTurns, parseReply, buildSystemPrompt, _test } from "./core.mjs";
import { handler } from "./lambda.mjs";
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { cond ? pass++ : fail++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + extra}`); };

const mkMockClient = (replyText, spy = {}) => ({
  models: {
    generateContent: async (params) => {
      spy.params = params;
      return { text: replyText };
    }
  }
});

const post = (messages, extra = {}) => ({ method: "POST", origin: "https://aldwinsamson.com", ip: "1.1.1.1", apiKey: "sk-test", bodyText: JSON.stringify({ messages }), ...extra });

// 1. happy path + parsing
{ _test.reset(); const spy = {};
  const mockClient = mkMockClient("John built a multi-AZ AWS setup.\n• Terraform\n• Argo CD\nFOLLOWUPS: What is his capstone? | Does he know Prometheus? | Where is he based?", spy);
  const r = await handleChat(post([{ role: "user", content: "What did John do at Stratpoint?" }]), mockClient);
  const b = JSON.parse(r.body);
  ok("200 on valid request", r.status === 200);
  ok("text has no FOLLOWUPS line", !b.text.includes("FOLLOWUPS") && b.text.startsWith("John built"));
  ok("3 follow-ups parsed", b.followUps.length === 3 && b.followUps[0] === "What is his capstone?", JSON.stringify(b.followUps));
  ok("CORS header for allowed origin", r.headers["access-control-allow-origin"] === "https://aldwinsamson.com");
  ok("model defaults to gemini-2.5-flash", spy.params.model === "gemini-2.5-flash");
  ok("system instruction includes knowledge + rules", spy.params.config.systemInstruction.includes("=== PROJECTS (") && spy.params.config.systemInstruction.includes("RULES"));
  ok("maxOutputTokens capped", spy.params.config.maxOutputTokens === 450);
}
// 2. origin / method / config / size / json
{ _test.reset();
  const dummyClient = mkMockClient("ok");
  ok("403 for foreign origin", (await handleChat(post([{role:"user",content:"hi"}], { origin: "https://evil.example" }), dummyClient)).status === 403);
  ok("204 preflight", (await handleChat({ method: "OPTIONS", origin: "https://aldwinsamson.com" }, dummyClient)).status === 204);
  ok("405 for GET", (await handleChat({ method: "GET", origin: "https://aldwinsamson.com", apiKey: "k" }, dummyClient)).status === 405);
  ok("503 without api key", (await handleChat(post([{role:"user",content:"hi"}], { apiKey: "" }), dummyClient)).status === 503);
  ok("413 for huge body", (await handleChat(post([{role:"user",content:"hi"}], { bodyText: "x".repeat(9000) }), dummyClient)).status === 413);
  ok("400 for bad JSON", (await handleChat(post([], { bodyText: "{nope" }), dummyClient)).status === 400);
  ok("400 for empty messages", (await handleChat(post([]), dummyClient)).status === 400);
  ok("400 when last message is not user", (await handleChat(post([{role:"user",content:"a"},{role:"assistant",content:"b"}]), dummyClient)).status === 400);
  ok("localhost blocked by default", (await handleChat(post([{role:"user",content:"hi"}], { origin: "http://localhost:5173" }), dummyClient)).status === 403);
  process.env.ALLOW_LOCALHOST = "true";
  ok("localhost allowed when ALLOW_LOCALHOST=true", (await handleChat(post([{role:"user",content:"hi"}], { origin: "http://localhost:5173" }), dummyClient)).status === 200);
  delete process.env.ALLOW_LOCALHOST;
}
// 2b. same-origin (Vercel production and previews) without listing each address
{ _test.reset();
  const msg = [{ role: "user", content: "hi" }];
  const preview = "https://aldwinsamson-portfolio-git-x-me.vercel.app";
  const dummyClient = mkMockClient("ok");
  ok("same-origin preview allowed via Host", (await handleChat(post(msg, { origin: preview, host: "aldwinsamson-portfolio-git-x-me.vercel.app", ip: "6.6.6.6" }), dummyClient)).status === 200);
  ok("foreign origin still blocked when Host differs", (await handleChat(post(msg, { origin: "https://evil.example", host: "aldwinsamson.com", ip: "6.6.6.7" }), dummyClient)).status === 403);
  ok("a look-alike Host does not match", (await handleChat(post(msg, { origin: "https://aldwinsamson.com.evil.example", host: "aldwinsamson.com", ip: "6.6.6.8" }), dummyClient)).status === 403);
}
// 3. normalisation
{
  const long = "a".repeat(900);
  const n = normaliseTurns([{role:"assistant",content:"stray"},{role:"user",content:long},{role:"user",content:"newer"},{role:"assistant",content:"ans"},{role:"user",content:"q\u0000\u0007 text"}]);
  ok("drops leading assistant, merges duplicate roles, strips control chars", n.turns.length === 3 && n.turns[0].content === "newer" && n.turns[2].content === "q text", JSON.stringify(n));
  const big = normaliseTurns([{role:"user",content:long}]);
  ok("user message capped at 300 chars", big.turns[0].content.length === 300);
  const many = []; for (let i = 0; i < 15; i++) { many.push({role:"user",content:`q${i}`}); many.push({role:"assistant",content:`a${i}`}); } many.push({role:"user",content:"last"});
  const m2 = normaliseTurns(many.slice(-39));
  ok("keeps only the last 8 turns and starts with user", m2.turns.length <= 8 && m2.turns[0].role === "user" && m2.turns.at(-1).content === "last", JSON.stringify(m2.turns.map(t=>t.role)));
  ok("rejects bad role", normaliseTurns([{role:"system",content:"x"}]).error);
}
// 4. parseReply edge cases
{
  ok("no FOLLOWUPS → empty chips", parseReply("Just text").followUps.length === 0);
  ok("strips ** bold", parseReply("**Bold** answer\nFOLLOWUPS: a | b").text === "Bold answer");
  ok("drops over-long chips", parseReply("t\nFOLLOWUPS: ok | " + "x".repeat(90)).followUps.length === 1);
}
// 5. rate limit
{ _test.reset(); let last;
  const dummyClient = mkMockClient("ok");
  for (let i = 0; i < 9; i++) last = await handleChat(post([{role:"user",content:"hi"}]), dummyClient);
  ok("429 after 8 requests per minute from one IP", last.status === 429 && last.headers["retry-after"] === "60", String(last.status));
  const other = await handleChat(post([{role:"user",content:"hi"}], { ip: "2.2.2.2" }), dummyClient);
  ok("another visitor is not limited", other.status === 200);
}
// 6. upstream failures
{ _test.reset();
  const failingClient = { models: { generateContent: async () => { throw new Error("upstream error"); } } };
  ok("502 on network/upstream error", (await handleChat(post([{role:"user",content:"hi"}]), failingClient)).status === 502);
  const emptyClient = mkMockClient("   ");
  ok("502 on empty model reply", (await handleChat(post([{role:"user",content:"hi"}]), emptyClient)).status === 502);
}
// 7. lambda adapter (payload v2) with env key
{ _test.reset(); process.env.GEMINI_API_KEY = "sk-lambda";
  const mockLambdaClient = mkMockClient("Hi!\nFOLLOWUPS: a | b");
  const res = await handler({ requestContext: { http: { method: "POST", sourceIp: "9.9.9.9" } }, headers: { Origin: "https://aldwinsamson.com" }, body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }), isBase64Encoded: false }, mockLambdaClient);
  ok("lambda adapter returns statusCode/headers/body", res.statusCode === 200 && JSON.parse(res.body).text === "Hi!" && res.headers["access-control-allow-origin"] === "https://aldwinsamson.com");
  const b64 = await handler({ requestContext: { http: { method: "POST", sourceIp: "8.8.8.8" } }, headers: { origin: "https://aldwinsamson.com" }, body: Buffer.from(JSON.stringify({ messages: [{ role: "user", content: "hello" }] })).toString("base64"), isBase64Encoded: true }, mockLambdaClient);
  ok("lambda adapter decodes base64 bodies", b64.statusCode === 200);
  delete process.env.GEMINI_API_KEY;
}
// 8. prompt never contains private data
{ const p = buildSystemPrompt();
  ok("prompt has no phone/address data", !/\+63|09\d{9}/.test(p));
  console.log("system prompt size:", p.length, "chars (~" + Math.round(p.length / 4) + " tokens)");
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);