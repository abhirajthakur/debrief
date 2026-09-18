import { getProvider, type LLMProvider } from "@debrief/providers";
import { env } from "./config/env.js";

export type Container = {
  config: {
    port: number;
    llmActor: { provider: string; model: string };
  };
  actorProvider: LLMProvider;
};

export function createContainer(): Container {
  const apiKey = env.LLM_ACTOR_PROVIDER === "groq" ? env.GROQ_API_KEY : env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(`Missing API key for LLM_ACTOR_PROVIDER="${env.LLM_ACTOR_PROVIDER}"`);
  }

  const actorProvider = getProvider(env.LLM_ACTOR_PROVIDER, { apiKey });

  return {
    config: {
      port: env.PORT,
      llmActor: { provider: env.LLM_ACTOR_PROVIDER, model: env.LLM_ACTOR_MODEL },
    },
    actorProvider,
  };
}
