import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(projectRoot, "src/lib/ai/provider.ts");
const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpile(source, {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2022,
});
const providerModule = { exports: {} };
const require = createRequire(import.meta.url);
new Function("module", "exports", "require", compiled)(providerModule, providerModule.exports, require);
const { generateAICareerResponse, AIProviderError } = providerModule.exports;

const prompt = "How can I become an AI Engineer?";
const successChat = (text) => new Response(JSON.stringify({ choices: [{ message: { content: text } }] }), { status: 200 });
const successGemini = (text) => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 });
const failed = (status, body = {}, headers = {}) => new Response(JSON.stringify({ error: body }), { status, headers });

test("NVIDIA success skips Gemini and OpenAI", async () => {
  const calls = [];
  const result = await generateAICareerResponse({ prompt }, {
    env: { NVIDIA_API_KEY: "nvidia-test", GEMINI_API_KEY: "gemini-test", OPENAI_API_KEY: "openai-test" },
    fetchImpl: async (url) => { calls.push(String(url)); return successChat("NVIDIA answer"); },
    logger: () => {},
  });

  assert.equal(result.provider, "nvidia");
  assert.equal(result.text, "NVIDIA answer");
  assert.deepEqual(calls, ["https://integrate.api.nvidia.com/v1/chat/completions"]);
});

test("NVIDIA failure falls back to Gemini and does not call OpenAI after success", async () => {
  const calls = [];
  const result = await generateAICareerResponse({ prompt }, {
    env: { NVIDIA_API_KEY: "nvidia-test", GEMINI_API_KEY: "gemini-test", OPENAI_API_KEY: "openai-test" },
    fetchImpl: async (url) => {
      calls.push(String(url));
      return calls.length === 1 ? failed(503) : successGemini("Gemini answer");
    },
    logger: () => {},
  });

  assert.equal(result.provider, "gemini");
  assert.equal(result.text, "Gemini answer");
  assert.equal(calls.length, 2);
  assert.match(calls[1], /generativelanguage\.googleapis\.com/);
});

test("NVIDIA and Gemini failures fall back to OpenAI", async () => {
  const calls = [];
  const result = await generateAICareerResponse({ prompt }, {
    env: { NVIDIA_API_KEY: "nvidia-test", GEMINI_API_KEY: "gemini-test", OPENAI_API_KEY: "openai-test" },
    fetchImpl: async (url) => {
      calls.push(String(url));
      if (calls.length === 1) return failed(401, { message: "invalid key" });
      if (calls.length === 2) return failed(503);
      return successChat("OpenAI answer");
    },
    logger: () => {},
  });

  assert.equal(result.provider, "openai");
  assert.equal(result.text, "OpenAI answer");
  assert.equal(calls.length, 3);
  assert.equal(calls[2], "https://api.openai.com/v1/chat/completions");
});

test("all provider failures return a safe error without key or prompt leakage", async () => {
  const secret = "dont-log-this-api-key";
  const logs = [];
  await assert.rejects(
    generateAICareerResponse({ prompt }, {
      env: { NVIDIA_API_KEY: secret, GEMINI_API_KEY: "gemini-test", OPENAI_API_KEY: "openai-test" },
      fetchImpl: async () => failed(503),
      logger: (message, details) => logs.push({ message, details }),
    }),
    (error) => {
      assert.ok(error instanceof AIProviderError);
      assert.equal(error.code, "AI_PROVIDER_FAILED");
      assert.match(error.message, /All configured AI providers failed/);
      assert.doesNotMatch(error.message, new RegExp(secret));
      assert.doesNotMatch(error.message, new RegExp(prompt));
      return true;
    },
  );
  assert.equal(logs.length, 3);
  assert.ok(logs.every(({ details }) => !JSON.stringify(details).includes(secret)));
});

test("missing NVIDIA key tries Gemini first", async () => {
  let firstUrl = "";
  const result = await generateAICareerResponse({ prompt }, {
    env: { GEMINI_API_KEY: "gemini-test", OPENAI_API_KEY: "openai-test" },
    fetchImpl: async (url) => { firstUrl = String(url); return successGemini("Gemini answer"); },
    logger: () => {},
  });
  assert.equal(result.provider, "gemini");
  assert.match(firstUrl, /generativelanguage\.googleapis\.com/);
});

test("missing NVIDIA and Gemini keys tries OpenAI", async () => {
  let firstUrl = "";
  const result = await generateAICareerResponse({ prompt }, {
    env: { OPENAI_API_KEY: "openai-test" },
    fetchImpl: async (url) => { firstUrl = String(url); return successChat("OpenAI answer"); },
    logger: () => {},
  });
  assert.equal(result.provider, "openai");
  assert.equal(firstUrl, "https://api.openai.com/v1/chat/completions");
});

test("quota errors fall through to a later configured provider, but stop when none remain", async () => {
  let calls = 0;
  const result = await generateAICareerResponse({ prompt }, {
    env: { NVIDIA_API_KEY: "nvidia-test", GEMINI_API_KEY: "gemini-test", OPENAI_API_KEY: "openai-test" },
    fetchImpl: async () => {
      calls += 1;
      return calls === 1
        ? failed(429, { message: "insufficient_quota" })
        : successGemini("Gemini response despite NVIDIA quota issue");
    },
    logger: () => {},
  });
  assert.equal(result.provider, "gemini");
  assert.equal(calls, 2);

  calls = 0;
  await assert.rejects(
    generateAICareerResponse({ prompt }, {
      env: { NVIDIA_API_KEY: "nvidia-test" },
      fetchImpl: async () => { calls += 1; return failed(429, { message: "insufficient_quota" }); },
      logger: () => {},
    }),
    (error) => error instanceof AIProviderError && error.code === "AI_ACTION_REQUIRED",
  );
  assert.equal(calls, 1);
});

test("OpenAI exhausted-credit 429 is reported as quota, without retrying", async () => {
  let calls = 0;
  const logs = [];
  await assert.rejects(
    generateAICareerResponse({ prompt }, {
      env: { OPENAI_API_KEY: "openai-test" },
      fetchImpl: async () => {
        calls += 1;
        return failed(429, { code: "credit_balance_exhausted", type: "insufficient_quota", message: "Sensitive provider detail" });
      },
      logger: (message, details) => logs.push({ message, details }),
      sleepImpl: async () => assert.fail("quota errors must not be retried"),
    }),
    (error) => {
      assert.ok(error instanceof AIProviderError);
      assert.equal(error.code, "AI_ACTION_REQUIRED");
      assert.match(error.message, /prepaid credit balance is exhausted/);
      assert.doesNotMatch(error.message, /Sensitive provider detail/);
      return true;
    },
  );
  assert.equal(calls, 1);
  assert.equal(logs[0].details.category, "quota");
  assert.equal(logs[0].details.providerCode, "credit_balance_exhausted");
});

test("OpenAI temporary rate limit retries once with bounded backoff", async () => {
  let calls = 0;
  const delays = [];
  const result = await generateAICareerResponse({ prompt }, {
    env: { OPENAI_API_KEY: "openai-test" },
    fetchImpl: async () => {
      calls += 1;
      return calls === 1
        ? failed(429, { code: "rate_limit_exceeded", type: "requests" }, { "retry-after": "0.2" })
        : successChat("OpenAI response after rate limit");
    },
    logger: () => {},
    sleepImpl: async (milliseconds) => delays.push(milliseconds),
  });

  assert.equal(result.provider, "openai");
  assert.equal(calls, 2);
  assert.deepEqual(delays, [200]);
});

test("OpenAI rate-limit retries stop at the configured attempt limit", async () => {
  let calls = 0;
  const delays = [];
  await assert.rejects(
    generateAICareerResponse({ prompt }, {
      env: { OPENAI_API_KEY: "openai-test" },
      fetchImpl: async () => { calls += 1; return failed(429, { code: "rate_limit_exceeded" }); },
      logger: () => {},
      sleepImpl: async (milliseconds) => delays.push(milliseconds),
    }),
    (error) => error instanceof AIProviderError && error.code === "AI_PROVIDER_FAILED" && /openai failed \(HTTP 429\)/.test(error.message),
  );
  assert.equal(calls, 2);
  assert.deepEqual(delays, [250]);
});

test("invalid JSON or domain responses trigger the next provider", async () => {
  const calls = [];
  const result = await generateAICareerResponse({
    prompt,
    responseFormat: "json",
    validateResponse: (text) => JSON.parse(text).ok === true,
  }, {
    env: { NVIDIA_API_KEY: "nvidia-test", GEMINI_API_KEY: "gemini-test" },
    fetchImpl: async (url) => {
      calls.push(String(url));
      return calls.length === 1 ? successChat("not json") : successGemini('{"ok":true}');
    },
    logger: () => {},
  });

  assert.equal(result.provider, "gemini");
  assert.equal(result.text, '{"ok":true}');
  assert.equal(calls.length, 2);
});
