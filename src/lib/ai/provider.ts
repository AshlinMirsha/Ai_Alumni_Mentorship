/**
 * Server-side AI Provider Client for AlumniPath Career Services
 * Strictly server-only: Never imports in browser components.
 * Supports Gemini 3.5 Flash with fallback to OpenAI and deterministic fallback.
 */

interface GenerateOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface AIResponse {
  text: string;
  provider: "gemini" | "openai" | "fallback";
  model: string;
}

/**
 * Executes an AI generation request using server-side Gemini 3.5 Flash or OpenAI.
 */
export async function generateAICareerResponse(options: GenerateOptions): Promise<AIResponse> {
  const { prompt, systemPrompt, temperature = 0.7, timeoutMs = 25000 } = options;

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. Try Gemini (Primary active provider)
  if (geminiKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const contents = [];
      if (systemPrompt) {
        contents.push({
          role: "user",
          parts: [{ text: `[System Instruction]\n${systemPrompt}` }],
        });
        contents.push({
          role: "model",
          parts: [{ text: "Understood. I will act strictly as the AlumniPath career advisor following these instructions." }],
        });
      }
      contents.push({
        role: "user",
        parts: [{ text: prompt }],
      });

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature,
              maxOutputTokens: 2048,
            },
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && typeof text === "string" && text.trim().length > 0) {
          return {
            text: text.trim(),
            provider: "gemini",
            model: "gemini-3.5-flash",
          };
        }
      } else {
        const errBody = await res.text().catch(() => "");
        console.warn("[AI Provider] Gemini error:", res.status, errBody.substring(0, 160));
      }
    } catch (err: any) {
      console.warn("[AI Provider] Gemini request failed or timed out:", err?.message);
    }
  }

  // 2. Try OpenAI Fallback
  if (openaiKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const messages: any[] = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature,
          max_tokens: 2048,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && typeof text === "string" && text.trim().length > 0) {
          return {
            text: text.trim(),
            provider: "openai",
            model: "gpt-4o-mini",
          };
        }
      } else {
        const errBody = await res.text().catch(() => "");
        console.warn("[AI Provider] OpenAI error:", res.status, errBody.substring(0, 160));
      }
    } catch (err: any) {
      console.warn("[AI Provider] OpenAI request failed or timed out:", err?.message);
    }
  }

  // 3. Deterministic Structured Fallback (Guarantees zero downtime)
  return {
    text: generateDeterministicFallback(prompt),
    provider: "fallback",
    model: "alumnipath-rule-engine-v1",
  };
}

/**
 * Safely extracts JSON from markdown-wrapped AI responses.
 */
export function parseStructuredAIResponse<T>(rawText: string, fallback: T): T {
  try {
    let clean = rawText.trim();
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    return JSON.parse(clean.trim()) as T;
  } catch {
    return fallback;
  }
}

/**
 * Fallback generator when remote providers are unreachable or rate-limited.
 */
function generateDeterministicFallback(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("roadmap") || p.includes("plan")) {
    return `### Personalized Career Roadmap Guidance

To succeed in your target role, focus on these critical career milestones:
1. **Core Fundamentals**: Master core algorithms, data structures, and asynchronous programming.
2. **Framework Mastery**: Build end-to-end applications demonstrating clean component lifecycles and state management.
3. **Database Architecture**: Practice relational normalization, indexing, and transactional boundaries.
4. **Cloud & DevOps**: Containerize apps with Docker and deploy automated CI/CD pipelines.
5. **Interview Readiness**: Systematic practice on key design patterns and behavioral STAR stories.

You can inspect, track, and update your active milestone statuses directly on your personalized roadmap page.`;
  }

  if (p.includes("skill") || p.includes("gap")) {
    return `### Skill Gap Assessment

Based on typical engineering benchmarks:
- **High Priority**: TypeScript, Docker containerization, and automated integration testing.
- **Medium Priority**: Database query optimization (indexing & EXPLAIN plans) and caching architectures.
- **Recommended Action**: Expand on your project bullet points to showcase production engineering depth and measurable impact.`;
  }

  if (p.includes("resume") || p.includes("cv")) {
    return `### Resume Optimization Guidance

Follow Google's **XYZ Formula**: *"Accomplished [X] as measured by [Y], by doing [Z]"*.
- Standardize all bullet points to lead with strong action verbs (Architected, Spearheaded, Engineered).
- Ensure core keywords matching your target role appear naturally in your Skills and Experience sections.
- Submit your resume directly to our automated **Resume Review** page for in-depth ATS scoring and line-by-line feedback.`;
  }

  return `### Career Advisory Intelligence

I am here to support your career trajectory. Consider these next steps:
1. Complete your target career role and skill list on your **Student Profile**.
2. Generate an actionable step-by-step roadmap on the **Career Roadmap** page.
3. Upload your current resume to the **Resume Review** tool to check your ATS compatibility.
4. Reach out to verified alumni mentors working in your field of interest.`;
}
