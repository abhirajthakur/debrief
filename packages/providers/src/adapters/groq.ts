import { ProviderError } from "../errors.js";
import type {
  CompletionRequest,
  CompletionResponse,
  LLMProvider,
  ProviderConfig,
} from "../types.js";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

interface GroqResponse {
  model: string;
  choices: Array<{
    message: { content: string };
    finish_reason: "stop" | "length" | "tool_calls" | null;
  }>;
  usage: { prompt_tokens: number; completion_tokens: number };
}

function createGroqProvider(config: ProviderConfig): LLMProvider {
  return {
    name: "groq",
    async complete(request: CompletionRequest): Promise<CompletionResponse> {
      const response = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.2,
          max_tokens: request.maxTokens,
          response_format: request.jsonMode ? { type: "json_object" } : undefined,
        }),
        signal: request.signal,
      });

      if (!response.ok) {
        throw new ProviderError(
          `Groq request failed (${response.status}): ${await response.text()}`,
          "groq",
        );
      }

      const data = (await response.json()) as GroqResponse;
      const choice = data.choices[0];
      if (!choice) {
        throw new ProviderError("Groq returned no choices", "groq");
      }

      return {
        text: choice.message.content,
        model: data.model,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
        },
        finishReason: choice.finish_reason === "length" ? "length" : "stop",
      };
    },
  };
}

export default createGroqProvider;
