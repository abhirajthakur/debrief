import type { PostAlertInput, PostDigestInput, Tool } from "@debrief/integrations";
import { getIntegration } from "@debrief/integrations";
import { getProvider, type LLMProvider } from "@debrief/providers";
import { env } from "./config/env.js";

export type Container = {
  config: {
    port: number;
    llmActor: { provider: string; model: string };
  };
  actorProvider: LLMProvider;
  // Undefined when SLACK_WEBHOOK_URL isn't set — callers must handle that
  slackDigestTool?: Tool<PostDigestInput, void>;
  slackAlertTool?: Tool<PostAlertInput, void>;
};

export function createContainer(): Container {
  const apiKey = env.LLM_ACTOR_PROVIDER === "groq" ? env.GROQ_API_KEY : env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(`Missing API key for LLM_ACTOR_PROVIDER="${env.LLM_ACTOR_PROVIDER}"`);
  }

  const actorProvider = getProvider(env.LLM_ACTOR_PROVIDER, { apiKey });

  const slackTools = env.SLACK_WEBHOOK_URL
    ? getIntegration("slack", { webhookUrl: env.SLACK_WEBHOOK_URL }).tools
    : undefined;

  const slackDigestTool = slackTools?.find(
    (tool): tool is Tool<PostDigestInput, void> => tool.name === "slack.postDigest",
  );
  const slackAlertTool = slackTools?.find(
    (tool): tool is Tool<PostAlertInput, void> => tool.name === "slack.postAlert",
  );

  return {
    config: {
      port: env.PORT,
      llmActor: { provider: env.LLM_ACTOR_PROVIDER, model: env.LLM_ACTOR_MODEL },
    },
    actorProvider,
    slackDigestTool,
    slackAlertTool,
  };
}
