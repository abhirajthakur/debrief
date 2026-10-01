import type { PostAlertInput, PostDigestInput, Tool } from '@debrief/integrations';
import { getIntegration } from '@debrief/integrations';
import { decrypt, encrypt } from '../lib/encryption.js';
import { createOAuthState, verifyOAuthState } from '../lib/oauth-state.js';
import { buildSlackAuthorizeUrl, exchangeSlackCode } from '../lib/slack-oauth.js';
import * as connectionsRepository from '../repositories/integration-connections.repository.js';

export function getSlackConnectUrl(userId: string): string {
  const state = createOAuthState(userId);
  return buildSlackAuthorizeUrl(state);
}

export async function handleSlackCallback(
  code: string,
  state: string,
): Promise<{ teamName: string }> {
  const userId = verifyOAuthState(state); // throws on forged/expired state

  const { webhookUrl, teamName, channel } = await exchangeSlackCode(code);

  await connectionsRepository.upsertConnection({
    userId,
    provider: 'slack',
    encryptedCredentials: encrypt(webhookUrl),
    metadata: { teamName, channel },
  });

  return { teamName };
}

export type SlackTools = {
  digestTool: Tool<PostDigestInput, void>;
  alertTool: Tool<PostAlertInput, void>;
};

// Looked up fresh per request, not built once at boot — that's the whole
// point of moving off a single shared SLACK_WEBHOOK_URL. Returns undefined
// if this user hasn't connected Slack; callers already handle "no Slack
// configured" as a no-op (see runs.service.ts / action-items.service.ts).
export async function getSlackToolsForUser(userId: string): Promise<SlackTools | undefined> {
  const connection = await connectionsRepository.findConnection(userId, 'slack');
  if (!connection) {
    return undefined;
  }

  const webhookUrl = decrypt(connection.encryptedCredentials);
  const integration = getIntegration('slack', { webhookUrl });

  const digestTool = integration.tools.find(
    (tool): tool is Tool<PostDigestInput, void> => tool.name === 'slack.postDigest',
  );
  const alertTool = integration.tools.find(
    (tool): tool is Tool<PostAlertInput, void> => tool.name === 'slack.postAlert',
  );

  if (!digestTool || !alertTool) {
    return undefined;
  }

  return { digestTool, alertTool };
}
