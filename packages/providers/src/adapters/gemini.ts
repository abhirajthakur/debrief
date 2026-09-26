import { ProviderError } from "../errors.js";
import { fetchWithRetry } from "../retry.js";
import type {
  CompletionRequest,
  CompletionResponse,
  LLMProvider,
  ProviderConfig,
} from "../types.js";

type InteractionStepContent = {
  type: string;
  text?: string;
};

type InteractionStep = {
  type: string;
  content?: InteractionStepContent[];
};

type InteractionError = {
  code?: string;
  message?: string;
};

type InteractionResponse = {
  id: string;
  model?: string;
  status:
    | "completed"
    | "failed"
    | "in_progress"
    | "requires_action"
    | "cancelled"
    | "incomplete"
    | "queued"
    | "budget_exceeded";
  steps?: InteractionStep[];
  errors?: InteractionError[];
  usage?: {
    total_input_tokens?: number;
    total_output_tokens?: number;
  };
};

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";

function createGeminiProvider(config: ProviderConfig): LLMProvider {
  return {
    name: "gemini",
    async complete(request: CompletionRequest): Promise<CompletionResponse> {
      const systemMessages = request.messages.filter((m) => m.role === "system");

      // Our call sites never send true multi-turn (assistant) messages — each
      // call is a fresh system+user(+retry-feedback) prompt, not a
      // conversation the model has already replied within. So every
      // non-system message is joined into one input string rather than
      // modeled as separate Interaction Steps, which is what "input" as a
      // plain string is for.
      const input = request.messages
        .filter((m) => m.role !== "system")
        .map((m) => m.content)
        .join("\n\n");

      const endpoint = `${GEMINI_ENDPOINT}?key=${config.apiKey}`;

      const response = await fetchWithRetry(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: request.model,
          input,
          ...(systemMessages.length > 0
            ? { system_instruction: systemMessages.map((m) => m.content).join("\n\n") }
            : {}),
          ...(request.jsonMode
            ? { response_format: { type: "text", mime_type: "application/json" } }
            : {}),
          generation_config: {
            max_output_tokens: request.maxTokens,
          },
        }),
        signal: request.signal,
      });

      if (!response.ok) {
        throw new ProviderError(
          `Gemini request failed (${response.status}): ${await response.text()}`,
          "gemini",
        );
      }

      const data = (await response.json()) as InteractionResponse;

      if (data.status === "failed") {
        throw new ProviderError(
          `Gemini interaction failed: ${data.errors?.[0]?.message ?? "unknown error"}`,
          "gemini",
        );
      }

      const modelOutput = data.steps?.find((step) => step.type === "model_output");
      const text = modelOutput?.content?.find((c) => c.type === "text")?.text;

      if (!text) {
        throw new ProviderError("Gemini returned no text content", "gemini");
      }

      return {
        text,
        model: data.model ?? request.model,
        usage: {
          promptTokens: data.usage?.total_input_tokens ?? 0,
          completionTokens: data.usage?.total_output_tokens ?? 0,
        },
        finishReason: data.status === "incomplete" ? "length" : "stop",
      };
    },
  };
}

export default createGeminiProvider;
