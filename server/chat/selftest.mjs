// Run with: npm run test:chat   (= node server/chat/selftest.mjs; needs Node 20+; calls no real API, fetch is mocked)
// Named selftest.mjs on purpose: a *.test.mjs name would be picked up by vitest (`npm test`) and fail the suite.
import { handleChat, normaliseTurns, parseReply, buildSystemPrompt, _test } from "./core.mjs";
import { handler } from "./lambda.mjs";
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { cond ? pass++ : fail++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + extra}`); };

const mkFetch = (replyText, status = 200, spy = {}) => async (url, init) => {
  spy.url = url; spy.init = init; spy.body = JSON.parse(init.body);
  return { ok: status === 200, status, json: async () => ({ content: [{ type: "text", text: replyText }] }) };
};
const post = (messages, extra = {}) => ({ method: "POST", origin: "https://aldwinsamson.com", ip: "1.1.1.1", apiKey: "sk-test", bodyText: JSON.stringify({ messages }), ...extra });

// 1. happy path + parsing
{ _test.reset(); const spy = {};
  const r = await handleChat(post([{ role: "user", content: "What did John do at Stratpoint?" }]), mkFetch("John built a multi-AZ AWS setup.\n• Terraform\n• Argo CD\nFOLLOWUPS: What is his capstone? | Does he know Prometheus? | Where is he based?", 200, spy));
  const b = JSON.parse(r.body);
  ok("200 on valid request", r.status === 200);
  ok("text has no FOLLOWUPS line", !b.text.includes("FOLLOWUPS") && b.text.startsWith("John built"));
  ok("3 follow-ups parsed", b.followUps.length === 3 && b.followUps[0] === "What is his capstone?", JSON.stringify(b.followUps));
  ok("CORS header for allowed origin", r.headers["access-control-allow-origin"] === "https://aldwinsamson.com");
  ok("calls Anthropic Messages API", spy.url === "https://api.anthropic.com/v1/messages");
  ok("api key sent in x-api-key", spy.init.headers["x-api-key"] === "sk-test" && spy.init.headers["anthropic-version"] === "2023-06-01");
  ok("model defaults to claude-haiku-5-5", spy.body.model === "claude-haiku-5-5");
  ok("system prompt includes knowledge + rules", spy.body.system[0].text.includes("=== PROJECTS (") && spy.body.system[0].text.includes("RULES"));
  ok("system prompt cached", spy.body.system[0].cache_control?.type === "ephemeral");
  ok("max_tokens capped", spy.body.max_tokens === 450);
}
// 2. origin / method / config / size / json
{ _test.reset();
  ok("403 for foreign origin", (await handleChat(post([{role:"user",content:"hi"}], { origin: "https://evil.example" }), mkFetch("x"))).status === 403);
  ok("204 preflight", (await handleChat({ method: "OPTIONS", origin: "https://aldwinsamson.com" })).status === 204);
  ok("405 for GET", (await handleChat({ method: "GET", origin: "https://aldwinsamson.com", apiKey: "k" })).status === 405);
  ok("503 without api key", (await handleChat(post([{role:"user",content:"hi"}], { apiKey: "" }), mkFetch("x"))).status === 503);
  ok("413 for huge body", (await handleChat(post([{role:"user",content:"hi"}], { bodyText: "x".repeat(9000) }), mkFetch("x"))).status === 413);
  ok("400 for bad JSON", (await handleChat(post([], { bodyText: "{nope" }), mkFetch("x"))).status === 400);
  ok("400 for empty messages", (await handleChat(post([]), mkFetch("x"))).status === 400);
  ok("400 when last message is not user", (await handleChat(post([{role:"user",content:"a"},{role:"assistant",content:"b"}]), mkFetch("x"))).status === 400);
  ok("localhost blocked by default", (await handleChat(post([{role:"user",content:"hi"}], { origin: "http://localhost:5173" }), mkFetch("x"))).status === 403);
  process.env.ALLOW_LOCALHOST = "true";
  ok("localhost allowed when ALLOW_LOCALHOST=true", (await handleChat(post([{role:"user",content:"hi"}], { origin: "http://localhost:5173" }), mkFetch("ok"))).status === 200);
  delete process.env.ALLOW_LOCALHOST;
}
// 2b. same-origin (Vercel production and previews) without listing each address
{ _test.reset();
  const msg = [{ role: "user", content: "hi" }];
  const preview = "https://aldwinsamson-portfolio-git-x-me.vercel.app";
  ok("same-origin preview allowed via Host", (await handleChat(post(msg, { origin: preview, host: "aldwinsamson-portfolio-git-x-me.vercel.app", ip: "6.6.6.6" }), mkFetch("ok"))).status === 200);
  ok("foreign origin still blocked when Host differs", (await handleChat(post(msg, { origin: "https://evil.example", host: "aldwinsamson.com", ip: "6.6.6.7" }), mkFetch("ok"))).status === 403);
  ok("a look-alike Host does not match", (await handleChat(post(msg, { origin: "https://aldwinsamson.com.evil.example", host: "aldwinsamson.com", ip: "6.6.6.8" }), mkFetch("ok"))).status === 403);
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
  for (let i = 0; i < 9; i++) last = await handleChat(post([{role:"user",content:"hi"}]), mkFetch("ok"));
  ok("429 after 8 requests per minute from one IP", last.status === 429 && last.headers["retry-after"] === "60", String(last.status));
  const other = await handleChat(post([{role:"user",content:"hi"}], { ip: "2.2.2.2" }), mkFetch("ok"));
  ok("another visitor is not limited", other.status === 200);
}
// 6. upstream failures
{ _test.reset();
  ok("502 on upstream 500", (await handleChat(post([{role:"user",content:"hi"}]), mkFetch("x", 500))).status === 502);
  ok("503 on upstream 429", (await handleChat(post([{role:"user",content:"hi"}], {ip:"3.3.3.3"}), mkFetch("x", 429))).status === 503);
  ok("502 on network error", (await handleChat(post([{role:"user",content:"hi"}], {ip:"4.4.4.4"}), async () => { throw new Error("boom"); })).status === 502);
  ok("502 on empty model reply", (await handleChat(post([{role:"user",content:"hi"}], {ip:"5.5.5.5"}), mkFetch("   "))).status === 502);
}
// 7. lambda adapter (payload v2) with env key
{ _test.reset(); process.env.ANTHROPIC_API_KEY = "sk-lambda";
  const realFetch = globalThis.fetch; let seen;
  globalThis.fetch = async (u, init) => { seen = JSON.parse(init.headers["x-api-key"] ? JSON.stringify({ key: init.headers["x-api-key"] }) : "{}"); return { ok: true, status: 200, json: async () => ({ content: [{ type: "text", text: "Hi!\nFOLLOWUPS: a | b" }] }) }; };
  const res = await handler({ requestContext: { http: { method: "POST", sourceIp: "9.9.9.9" } }, headers: { Origin: "https://aldwinsamson.com" }, body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }), isBase64Encoded: false });
  ok("lambda adapter returns statusCode/headers/body", res.statusCode === 200 && JSON.parse(res.body).text === "Hi!" && res.headers["access-control-allow-origin"] === "https://aldwinsamson.com");
  ok("lambda adapter passes the key through", seen?.key === "sk-lambda");
  const b64 = await handler({ requestContext: { http: { method: "POST", sourceIp: "8.8.8.8" } }, headers: { origin: "https://aldwinsamson.com" }, body: Buffer.from(JSON.stringify({ messages: [{ role: "user", content: "hello" }] })).toString("base64"), isBase64Encoded: true });
  ok("lambda adapter decodes base64 bodies", b64.statusCode === 200);
  globalThis.fetch = realFetch; delete process.env.ANTHROPIC_API_KEY;
}
// 8. prompt never contains private data
{ const p = buildSystemPrompt();
  ok("prompt has no phone/address data", !/\+63|09\d{9}/.test(p));
  console.log("system prompt size:", p.length, "chars (~" + Math.round(p.length / 4) + " tokens)");
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
