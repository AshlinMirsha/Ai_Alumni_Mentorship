export type NvidiaContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface NvidiaChatMessage {
  role: "system" | "user" | "assistant";
  content: string | NvidiaContentPart[];
}

export interface NvidiaChatOptions {
  model?: "minimaxai/minimax-m3.1-flash" | "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning" | string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  reasoning_budget?: number;
}

export interface NvidiaChatResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      reasoning_content?: string;
    };
    finish_reason?: string;
  }>;
}

export async function callNvidiaChat(
  messages: NvidiaChatMessage[],
  options: NvidiaChatOptions = {}
): Promise<{ text: string; reasoning?: string }> {
  const apiKey = process.env.NVIDIA_NIM_API || "";
  const model = options.model || "minimaxai/minimax-m3.1-flash";
  const url = "https://integrate.api.nvidia.com/v1/chat/completions";

  const isNemotron = model.includes("nemotron");

  const payload: Record<string, unknown> = {
    model,
    messages,
    max_tokens: options.max_tokens || 4096,
    temperature: options.temperature ?? (isNemotron ? 0.6 : 0.7),
    top_p: options.top_p ?? 0.95,
  };

  if (isNemotron) {
    payload.reasoning_budget = options.reasoning_budget ?? 4096;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // If specific model like nemotron is experiencing temporary 503, fallback to minimax
    if (response.status === 503 && model !== "minimaxai/minimax-m3.1-flash") {
      return callNvidiaChat(messages, {
        ...options,
        model: "minimaxai/minimax-m3.1-flash",
      });
    }
    const errorText = await response.text();
    throw new Error(`NVIDIA NIM error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as NvidiaChatResponse;
  const choice = data.choices?.[0];
  const text = choice?.message?.content || choice?.message?.reasoning_content || "";
  const reasoning = choice?.message?.reasoning_content;

  return { text, reasoning };
}

export async function callNvidiaChatStream(
  messages: NvidiaChatMessage[],
  options: NvidiaChatOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.NVIDIA_NIM_API || "";
  const model = options.model || "minimaxai/minimax-m3.1-flash";
  const url = "https://integrate.api.nvidia.com/v1/chat/completions";

  const payload = {
    model,
    messages,
    max_tokens: options.max_tokens || 4096,
    temperature: options.temperature ?? 0.7,
    top_p: options.top_p ?? 0.95,
    stream: true,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    throw new Error(`NVIDIA NIM stream error (${response.status}): ${errorText}`);
  }

  return response.body;
}
