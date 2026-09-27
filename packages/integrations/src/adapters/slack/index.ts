import type { Integration, IntegrationConfig } from "../../types.js";
import { createPostAlertTool, createPostDigestTool } from "./tools.js";

export function createSlackIntegration(config: IntegrationConfig): Integration {
  const webhookUrl = config.webhookUrl;
  if (!webhookUrl) {
    throw new Error("Slack integration requires a webhookUrl");
  }

  return {
    name: "slack",
    tools: [createPostDigestTool(webhookUrl), createPostAlertTool(webhookUrl)],
  };
}
