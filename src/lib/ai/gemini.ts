import { callNvidiaChat } from "./nvidia";

export interface GeminiContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiContent {
  role?: "user" | "model";
  parts: GeminiContentPart[];
}

export interface GeminiGenerateOptions {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export async function generateWithGemini(
  prompt: string,
  options: GeminiGenerateOptions = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API || "";
  const model = options.model || "gemini-3.5-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload: Record<string, unknown> = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 4096,
    },
  };

  if (options.systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: options.systemInstruction }],
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const candidate = data.candidates?.[0];
      const part = candidate?.content?.parts?.[0];
      if (part?.text) {
        return part.text;
      }
    }
  } catch (err) {
    console.warn("Gemini API call failed or timed out, falling back to NVIDIA NIM:", err);
  }

  // Resilient fallback to NVIDIA NIM
  const nvidiaRes = await callNvidiaChat(
    [
      ...(options.systemInstruction
        ? [{ role: "system" as const, content: options.systemInstruction }]
        : []),
      { role: "user" as const, content: prompt },
    ],
    { model: "minimaxai/minimax-m3.1-flash" }
  );

  return nvidiaRes.text;
}
