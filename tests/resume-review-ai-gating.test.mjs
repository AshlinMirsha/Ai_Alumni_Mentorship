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

class TestAIProviderError extends Error {
  constructor(message, code) { super(message); this.code = code; }
}

function createRoute({ authorized = true, generate } = {}) {
  let providerCalls = 0;
  const module = { exports: {} };
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
      AIProviderError: TestAIProviderError,
      generateAICareerResponse: async (options) => {
        providerCalls += 1;
        return generate ? generate(options) : { text: "{}", provider: "nvidia", model: "test-model" };
      },
      parseStructuredAIResponse: (text, fallback) => {
        try { return JSON.parse(text); } catch { return fallback; }
      },
    },
  };
  const localRequire = (specifier) => Object.hasOwn(stubs, specifier) ? stubs[specifier] : nativeRequire(specifier);
  new Function("module", "exports", "require", routeJs)(module, module.exports, localRequire);
  return { POST: module.exports.POST, getProviderCalls: () => providerCalls };
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
