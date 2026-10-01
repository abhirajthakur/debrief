import { env } from '../config/env.js';

const SLACK_AUTHORIZE_URL = 'https://slack.com/oauth/v2/authorize';
const SLACK_TOKEN_URL = 'https://slack.com/api/oauth.v2.access';
const SLACK_SCOPES = 'incoming-webhook';

export function buildSlackAuthorizeUrl(state: string): string {
  const url = new URL(SLACK_AUTHORIZE_URL);
  url.searchParams.set('client_id', env.SLACK_CLIENT_ID ?? '');
  url.searchParams.set('scope', SLACK_SCOPES);
  url.searchParams.set('redirect_uri', env.SLACK_REDIRECT_URI ?? '');
  url.searchParams.set('state', state);
  return url.toString();
}

interface SlackOAuthResponse {
  ok: boolean;
  error?: string;
  team?: { id: string; name: string };
  incoming_webhook?: { url: string; channel: string; configuration_url: string };
}

export type SlackConnectionResult = {
  webhookUrl: string;
  teamName: string;
  channel: string;
};

export async function exchangeSlackCode(code: string): Promise<SlackConnectionResult> {
  // Slack's own docs recommend HTTP Basic auth for the client credentials
  // here over sending them as body params.
  const basicAuth = Buffer.from(`${env.SLACK_CLIENT_ID}:${env.SLACK_CLIENT_SECRET}`).toString(
    'base64',
  );

  const response = await fetch(SLACK_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({ code, redirect_uri: env.SLACK_REDIRECT_URI ?? '' }),
  });

  const data = (await response.json()) as SlackOAuthResponse;

  if (!data.ok || !data.incoming_webhook) {
    throw new Error(
      `Slack OAuth exchange failed: ${data.error ?? 'no incoming_webhook in response'}`,
    );
  }

  return {
    webhookUrl: data.incoming_webhook.url,
    teamName: data.team?.name ?? 'unknown workspace',
    channel: data.incoming_webhook.channel,
  };
}
