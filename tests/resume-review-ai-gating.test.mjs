import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);
const routePath = path.resolve(import.meta.dirname, "../src/app/api/career/resume-review/route.ts");
const routeSource = fs.readFileSync(routePath, "utf8");
const routeJs = ts.transpile(routeSource, { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 });
const providerPath = path.resolve(import.meta.dirname, "../src/lib/ai/provider.ts");
const providerSource = fs.readFileSync(providerPath, "utf8");
const providerJs = ts.transpile(providerSource, { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 });
const providerModule = { exports: {} };
new Function("module", "exports", "require", providerJs)(providerModule, providerModule.exports, nativeRequire);
const realProviderService = providerModule.exports;

class TestAIProviderError extends Error {
  constructor(message, code) { super(message); this.code = code; }
}

function createRoute({ authorized = true, generate, aiRuntime } = {}) {
  let providerCalls = 0;
  const routeModule = { exports: {} };
  const supabase = { from: () => ({ insert: async () => ({ error: null }) }) };
  const stubs = {
    "next/server": { NextResponse: { json: (data, init) => Response.json(data, init) }, connection: async () => {} },
    "@/lib/auth/authorize": {
      getAuthenticatedUser: async () => authorized
        ? { user: { id: "test-user" }, profile: {}, error: null }
        : { user: null, profile: null, error: "not signed in" },
    },
    "@/lib/supabase/admin": { getAdminClient: () => supabase },
    "@/lib/ai/provider": {
      AIProviderError: aiRuntime ? realProviderService.AIProviderError : TestAIProviderError,
      generateAICareerResponse: async (options) => {
        providerCalls += 1;
        if (aiRuntime) return realProviderService.generateAICareerResponse(options, aiRuntime);
        return generate ? generate(options) : { text: "{}", provider: "nvidia", model: "test-model" };
      },
      parseStructuredAIResponse: (text, fallback) => {
        try { return JSON.parse(text); } catch { return fallback; }
      },
    },
  };
  const localRequire = (specifier) => Object.hasOwn(stubs, specifier) ? stubs[specifier] : nativeRequire(specifier);
  new Function("module", "exports", "require", routeJs)(routeModule, routeModule.exports, localRequire);
  return { POST: routeModule.exports.POST, getProviderCalls: () => providerCalls };
}

function makePdf(text = "") {
  const stream = text ? `BT /F1 12 Tf 72 720 Td (${text}) Tj ET\n` : "";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}

function reviewRequest(fileBytes, fileName = "resume.pdf") {
  const formData = new FormData();
  formData.append("file", new File([fileBytes], fileName, { type: "application/pdf" }));
  formData.append("targetRole", "Full-Stack Software Engineer");
  formData.append("options", JSON.stringify({
    skillsAnalysis: true,
    projectDescriptionFeedback: true,
    structureReview: true,
    targetRoleAlignment: true,
  }));
  formData.append("consent", "true");
  return new Request("http://localhost/api/career/resume-review", { method: "POST", body: formData });
}

test("unauthorized resume request is rejected before any provider call", async () => {
  const route = createRoute({ authorized: false });
  const response = await route.POST(new Request("http://localhost/api/career/resume-review", { method: "POST" }));
  assert.equal(response.status, 401);
  assert.equal(route.getProviderCalls(), 0);
});

test("malformed PDF returns an extraction error without calling providers", async () => {
  const route = createRoute();
  const response = await route.POST(reviewRequest(Buffer.from("%PDF-1.4\nnot a valid PDF")));
  const body = await response.json();
  assert.equal(response.status, 422);
  assert.equal(body.code, "INVALID_PDF_CONTENT");
  assert.equal(route.getProviderCalls(), 0);
});

test("empty selectable text returns an OCR error without sending empty text to providers", async () => {
  const route = createRoute();
  const response = await route.POST(reviewRequest(makePdf()));
  const body = await response.json();
  assert.equal(response.status, 422);
  assert.equal(body.code, "NO_READABLE_TEXT");
  assert.equal(route.getProviderCalls(), 0);
});

test("valid selectable PDF text reaches the provider only after extraction", async () => {
  const route = createRoute({
    generate: async (options) => {
      assert.match(options.prompt, /Provider integration test resume content/);
      return {
        provider: "nvidia",
        model: "test-model",
        text: JSON.stringify({
          overallScore: 70,
          atsScore: 70,
          summary: "Analysis grounded in the supplied test resume.",
          skillsIdentified: { technical: [], soft: [], missingForRole: [] },
          strengths: [],
          areasToImprove: [],
          projectSuggestions: [],
          missingOrUnclearInfo: [],
          recommendedNextSteps: [],
        }),
      };
    },
  });
  const response = await route.POST(reviewRequest(makePdf("Provider integration test resume content")));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.provider, "nvidia");
  assert.equal(route.getProviderCalls(), 1);
});

test("resume route falls back from NVIDIA outage to Gemini analysis and skips OpenAI", async () => {
  const urls = [];
  const analysis = {
    overallScore: 70,
    atsScore: 72,
    summary: "Feedback grounded in the submitted resume text.",
    skillsIdentified: { technical: ["Python"], soft: [], missingForRole: [] },
    strengths: ["Resume text includes a Python skill."],
    areasToImprove: [],
    projectSuggestions: [],
    missingOrUnclearInfo: [],
    recommendedNextSteps: [],
  };
  const route = createRoute({
    aiRuntime: {
      env: { NVIDIA_API_KEY: "nvidia-test", GEMINI_API_KEY: "gemini-test", OPENAI_API_KEY: "openai-test" },
      logger: () => {},
      fetchImpl: async (url) => {
        urls.push(String(url));
        if (urls.length === 1) return new Response("provider unavailable", { status: 503 });
        return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(analysis) }] } }] }), { status: 200 });
      },
    },
  });

  const response = await route.POST(reviewRequest(makePdf("Resume: Python developer")));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.provider, "gemini");
  assert.equal(body.result.summary, analysis.summary);
  assert.deepEqual(urls, [
    "https://integrate.api.nvidia.com/v1/chat/completions",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
  ]);
  assert.equal(route.getProviderCalls(), 1);
});

test("resume route continues after NVIDIA quota error and returns Gemini's real response", async () => {
  const urls = [];
  const analysis = {
    overallScore: 66,
    atsScore: 69,
    summary: "Gemini analysis based on the extracted resume.",
    skillsIdentified: { technical: [], soft: [], missingForRole: [] },
    strengths: [],
    areasToImprove: [],
    projectSuggestions: [],
    missingOrUnclearInfo: [],
    recommendedNextSteps: [],
  };
  const route = createRoute({
    aiRuntime: {
      env: { NVIDIA_API_KEY: "nvidia-test", GEMINI_API_KEY: "gemini-test", OPENAI_API_KEY: "openai-test" },
      logger: () => {},
      fetchImpl: async (url) => {
        urls.push(String(url));
        if (urls.length === 1) {
          return new Response(JSON.stringify({ error: { code: "credit_balance_exhausted", type: "insufficient_quota" } }), { status: 429 });
        }
        return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(analysis) }] } }] }), { status: 200 });
      },
    },
  });

  const response = await route.POST(reviewRequest(makePdf("Resume: data analysis")));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.provider, "gemini");
  assert.equal(body.result.summary, analysis.summary);
  assert.equal(urls.length, 2);
  assert.match(urls[1], /generativelanguage\.googleapis\.com/);
});

test("resume route reports exhausted OpenAI credits only after all configured providers fail", async () => {
  const urls = [];
  const route = createRoute({
    aiRuntime: {
      env: { NVIDIA_API_KEY: "nvidia-test", GEMINI_API_KEY: "gemini-test", OPENAI_API_KEY: "openai-test" },
      logger: () => {},
      fetchImpl: async (url) => {
        urls.push(String(url));
        if (urls.length < 3) return new Response("provider unavailable", { status: 503 });
        return new Response(JSON.stringify({ error: { code: "credit_balance_exhausted", type: "insufficient_quota" } }), { status: 429 });
      },
    },
  });

  const response = await route.POST(reviewRequest(makePdf("Resume: Python developer")));
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.code, "AI_ACTION_REQUIRED");
  assert.match(body.error, /OpenAI API prepaid credit balance is exhausted/);
  assert.deepEqual(urls, [
    "https://integrate.api.nvidia.com/v1/chat/completions",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
    "https://api.openai.com/v1/chat/completions",
  ]);
});
