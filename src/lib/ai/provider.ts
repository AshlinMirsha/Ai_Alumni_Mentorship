/**
 * Server-side AI Provider Client for AlumniPath Career Services
 * Strictly server-only: Never imports in browser components.
 * Supports Gemini with OpenAI as a configured provider fallback.
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

export class AIProviderError extends Error {
  constructor(message: string, public readonly code: "AI_NOT_CONFIGURED" | "AI_PROVIDER_FAILED") {
    super(message);
    this.name = "AIProviderError";
  }
}

/**
 * Executes an AI generation request using server-side Gemini 3.5 Flash or OpenAI.
 */
export async function generateAICareerResponse(options: GenerateOptions & { history?: Array<{ role: "user" | "assistant"; content: string }> }): Promise<AIResponse> {
  const { prompt, systemPrompt, temperature = 0.7, timeoutMs = 25000 } = options;

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    throw new AIProviderError("AI service is not configured. Set GEMINI_API_KEY or OPENAI_API_KEY on the server.", "AI_NOT_CONFIGURED");
  }
  const failures: string[] = [];

  // 1. Try Gemini (Primary active provider)
  if (geminiKey) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const controller = new AbortController();
      timer = setTimeout(() => controller.abort(), timeoutMs);
      const contents = [
        ...(options.history || []).map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        { role: "user", parts: [{ text: prompt }] },
      ];

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.5-flash"}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
          body: JSON.stringify({
            contents,
            ...(systemPrompt ? { systemInstruction: { parts: [{ text: systemPrompt }] } } : {}),
            generationConfig: {
              temperature,
              maxOutputTokens: 2048,
            },
          }),
          signal: controller.signal,
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && typeof text === "string" && text.trim().length > 0) {
          return {
            text: text.trim(),
            provider: "gemini",
            model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
          };
        }
      } else {
        const errBody = await res.text().catch(() => "");
        console.warn("[AI Provider] Gemini error:", res.status, errBody.substring(0, 160));
        failures.push(`Gemini returned HTTP ${res.status}.`);
      }
    } catch (err: unknown) {
      console.warn("[AI Provider] Gemini request failed or timed out:", err instanceof Error ? err.message : "Unknown error");
      failures.push("Gemini request failed or timed out.");
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  // 2. Try OpenAI Fallback
  if (openaiKey) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const controller = new AbortController();
      timer = setTimeout(() => controller.abort(), timeoutMs);

      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      for (const message of options.history || []) messages.push({ role: message.role, content: message.content });
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
        failures.push(`OpenAI returned HTTP ${res.status}.`);
      }
    } catch (err: unknown) {
      console.warn("[AI Provider] OpenAI request failed or timed out:", err instanceof Error ? err.message : "Unknown error");
      failures.push("OpenAI request failed or timed out.");
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  throw new AIProviderError(`AI providers could not generate a response. ${failures.join(" ")}`.trim(), "AI_PROVIDER_FAILED");
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
