/** Server-side AI provider chain. Never import this module in browser code. */

interface GenerateOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  /** Total time budget across all configured providers. */
  timeoutMs?: number;
  responseFormat?: "json";
  /** Domain-specific validation runs before a provider response is accepted. */
  validateResponse?: (text: string) => boolean;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export type AIProviderName = "nvidia" | "gemini" | "openai";

export interface AIResponse {
  text: string;
  provider: AIProviderName;
  model: string;
}

export type AIProviderErrorCode = "AI_NOT_CONFIGURED" | "AI_PROVIDER_FAILED" | "AI_ACTION_REQUIRED" | "AI_INVALID_REQUEST";

export class AIProviderError extends Error {
  constructor(message: string, public readonly code: AIProviderErrorCode) {
    super(message);
    this.name = "AIProviderError";
  }
}

export interface AIProviderRuntime {
  env?: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
  logger?: (message: string, details: Record<string, string | number | undefined>) => void;
}

interface ProviderConfig {
  name: AIProviderName;
  key: string;
  model: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

type FailureKind = "network" | "timeout" | "http" | "invalid_response" | "action_required" | "invalid_request";

class ProviderAttemptError extends Error {
  constructor(
    readonly provider: AIProviderName,
    readonly model: string,
    readonly kind: FailureKind,
    readonly status?: number,
  ) {
    super(kind);
    this.name = "ProviderAttemptError";
  }
}

const TOTAL_TIMEOUT_MS = 45_000;
const MAX_PROVIDER_TIMEOUT_MS = 15_000;
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const CHAT_COMPLETIONS_ENDPOINTS: Record<"nvidia" | "openai", string> = {
  nvidia: "https://integrate.api.nvidia.com/v1/chat/completions",
  openai: "https://api.openai.com/v1/chat/completions",
};

function getProviderConfigs(env: Record<string, string | undefined>): ProviderConfig[] {
  const configs: ProviderConfig[] = [];
  if (env.NVIDIA_API_KEY?.trim()) {
    configs.push({
      name: "nvidia",
      key: env.NVIDIA_API_KEY.trim(),
      model: env.NVIDIA_MODEL?.trim() || "nvidia/nemotron-3.5-lightning-30b-a3b",
    });
  }
  if (env.GEMINI_API_KEY?.trim()) {
    configs.push({
      name: "gemini",
      key: env.GEMINI_API_KEY.trim(),
      model: env.GEMINI_MODEL?.trim() || "gemini-3.8-flash",
    });
  }
  if (env.OPENAI_API_KEY?.trim()) {
    configs.push({
      name: "openai",
      key: env.OPENAI_API_KEY.trim(),
      model: env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    });
  }
  return configs;
}

function getErrorFields(bodyText: string): string {
  try {
    const body = asRecord(JSON.parse(bodyText));
    if (!body) return "";
    const error = body.error;
    if (typeof error === "string") return error.toLowerCase();
    if (error && typeof error === "object") {
      const fields = error as Record<string, unknown>;
      return [fields.code, fields.type, fields.status, fields.message]
        .filter((field): field is string => typeof field === "string")
        .join(" ")
        .toLowerCase();
    }
    return "";
  } catch {
    return bodyText.toLowerCase();
  }
}

function classifyHttpFailure(provider: AIProviderName, model: string, status: number, bodyText: string): ProviderAttemptError {
  const detail = getErrorFields(bodyText);
  if (status === 402 || /billing|insufficient[_ -]?quota|quota[_ -]?exceeded|payment required|out of credits/.test(detail)) {
    return new ProviderAttemptError(provider, model, "action_required", status);
  }
  if (status === 403) return new ProviderAttemptError(provider, model, "action_required", status);
  if (status === 429) return new ProviderAttemptError(provider, model, "http", status);
  if (status === 400 && /invalid[_ -]?request|malformed request|invalid argument|invalid_argument/.test(detail)) {
    return new ProviderAttemptError(provider, model, "invalid_request", status);
  }
  return new ProviderAttemptError(provider, model, "http", status);
}

function getTextContent(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (part && typeof part === "object" && "text" in part && typeof part.text === "string") return part.text;
      return "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

function stripJsonFence(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("```json")) return trimmed.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
  if (trimmed.startsWith("```")) return trimmed.replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
  return trimmed;
}

function validateResponse(text: string, options: GenerateOptions): string {
  const normalized = options.responseFormat === "json" ? stripJsonFence(text) : text.trim();
  if (!normalized) throw new Error("empty response");

  if (options.responseFormat === "json") {
    try {
      JSON.parse(normalized);
    } catch {
      throw new Error("invalid JSON response");
    }
  }

  if (options.validateResponse) {
    try {
      if (!options.validateResponse(normalized)) throw new Error("domain validation failed");
    } catch {
      throw new Error("domain validation failed");
    }
  }

  return normalized;
}

function buildMessages(options: GenerateOptions): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
  if (options.systemPrompt) messages.push({ role: "system", content: options.systemPrompt });
  for (const message of options.history || []) messages.push({ role: message.role, content: message.content });
  messages.push({ role: "user", content: options.prompt });
  return messages;
}

async function readOpenAICompatibleResponse(response: Response, config: ProviderConfig): Promise<string> {
  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw classifyHttpFailure(config.name, config.model, response.status, bodyText);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ProviderAttemptError(config.name, config.model, "invalid_response", response.status);
  }

  const choices = asRecord(data);
  const firstChoice = Array.isArray(choices?.choices) ? asRecord(choices.choices[0]) : null;
  const message = asRecord(firstChoice?.message);
  const text = getTextContent(message?.content);
  if (!text) throw new ProviderAttemptError(config.name, config.model, "invalid_response", response.status);
  return text;
}

async function requestProvider(
  config: ProviderConfig,
  options: GenerateOptions,
  timeoutMs: number,
  fetchImpl: typeof fetch,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const messages = buildMessages(options);

  try {
    let response: Response;
    if (config.name === "gemini") {
      const contents = [
        ...(options.history || []).map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        { role: "user", parts: [{ text: options.prompt }] },
      ];
      response = await fetchImpl(
        `${GEMINI_ENDPOINT}/${encodeURIComponent(config.model)}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": config.key },
          body: JSON.stringify({
            contents,
            ...(options.systemPrompt ? { systemInstruction: { parts: [{ text: options.systemPrompt }] } } : {}),
            generationConfig: {
              temperature: options.temperature ?? 0.7,
              maxOutputTokens: options.maxTokens ?? 2048,
              ...(options.responseFormat === "json" ? { responseMimeType: "application/json" } : {}),
            },
          }),
          signal: controller.signal,
        },
      );
      if (!response.ok) {
        const bodyText = await response.text().catch(() => "");
        throw classifyHttpFailure(config.name, config.model, response.status, bodyText);
      }

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        throw new ProviderAttemptError(config.name, config.model, "invalid_response", response.status);
      }
      const dataRecord = asRecord(data);
      const candidates = Array.isArray(dataRecord?.candidates) ? asRecord(dataRecord.candidates[0]) : null;
      const content = asRecord(candidates?.content);
      const parts = content?.parts;
      const text = Array.isArray(parts)
        ? parts.map((part) => {
          const record = asRecord(part);
          return typeof record?.text === "string" ? record.text : "";
        }).filter(Boolean).join("\n").trim()
        : "";
      if (!text) throw new ProviderAttemptError(config.name, config.model, "invalid_response", response.status);
      return text;
    }

    response = await fetchImpl(CHAT_COMPLETIONS_ENDPOINTS[config.name], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.key}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        ...(options.responseFormat === "json" ? { response_format: { type: "json_object" } } : {}),
        stream: false,
      }),
      signal: controller.signal,
    });
    return await readOpenAICompatibleResponse(response, config);
  } catch (error) {
    if (error instanceof ProviderAttemptError) throw error;
    throw new ProviderAttemptError(config.name, config.model, controller.signal.aborted ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
  }
}

function toSafeFailure(error: ProviderAttemptError): string {
  if (error.kind === "timeout") return `${error.provider} timed out`;
  if (error.kind === "network") return `${error.provider} could not be reached`;
  if (error.kind === "invalid_response") return `${error.provider} returned an invalid response`;
  if (error.kind === "invalid_request") return `${error.provider} rejected the request as invalid (HTTP ${error.status})`;
  return `${error.provider} failed (HTTP ${error.status ?? "network"})`;
}

/** Attempts configured providers in NVIDIA → Gemini → OpenAI order, at most once each. */
export async function generateAICareerResponse(
  options: GenerateOptions,
  runtime: AIProviderRuntime = {},
): Promise<AIResponse> {
  const env = runtime.env ?? process.env;
  const fetchImpl = runtime.fetchImpl ?? globalThis.fetch;
  const logger = runtime.logger ?? ((message, details) => console.warn(message, details));
  const providers = getProviderConfigs(env);

  if (providers.length === 0) {
    throw new AIProviderError(
      "AI service is not configured. Set NVIDIA_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY on the server.",
      "AI_NOT_CONFIGURED",
    );
  }

  const totalTimeoutMs = Math.max(1_000, options.timeoutMs ?? TOTAL_TIMEOUT_MS);
  const deadline = Date.now() + totalTimeoutMs;
  const failures: string[] = [];

  for (let index = 0; index < providers.length; index += 1) {
    const provider = providers[index];
    const remainingMs = deadline - Date.now();
    if (remainingMs < 1_000) {
      failures.push("The AI request exceeded its time budget");
      break;
    }
    const timeoutMs = Math.min(MAX_PROVIDER_TIMEOUT_MS, Math.floor(remainingMs / (providers.length - index)));

    try {
      const rawText = await requestProvider(provider, options, timeoutMs, fetchImpl);
      let text: string;
      try {
        text = validateResponse(rawText, options);
      } catch {
        throw new ProviderAttemptError(provider.name, provider.model, "invalid_response");
      }
      return { text, provider: provider.name, model: provider.model };
    } catch (error) {
      const failure = error instanceof ProviderAttemptError
        ? error
        : new ProviderAttemptError(provider.name, provider.model, "network");
      logger("[AI Provider] Provider attempt failed.", {
        provider: provider.name,
        model: provider.model,
        category: failure.kind,
        status: failure.status,
      });

      if (failure.kind === "action_required") {
        throw new AIProviderError(
          `${provider.name} requires an account or permission check (HTTP ${failure.status}). Resolve that provider issue before retrying.`,
          "AI_ACTION_REQUIRED",
        );
      }
      if (failure.kind === "invalid_request") {
        throw new AIProviderError("The AI request was rejected as invalid. Please check the request and try again.", "AI_INVALID_REQUEST");
      }
      failures.push(toSafeFailure(failure));
    }
  }

  throw new AIProviderError(
    `All configured AI providers failed. ${failures.join("; ")}. Check provider credentials and service status, then retry.`,
    "AI_PROVIDER_FAILED",
  );
}

/** Safely extracts JSON from markdown-wrapped AI responses. */
export function parseStructuredAIResponse<T>(rawText: string, fallback: T): T {
  try {
    return JSON.parse(stripJsonFence(rawText)) as T;
  } catch {
    return fallback;
  }
}
