import type { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger.js';
import { getSlackConnectUrl, handleSlackCallback } from '../services/integrations.service.js';
import { sendSuccess } from '../utils/api-response.js';

export function slackConnectHandler() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.userId is always set — requireAuth runs before this handler.
      const authorizeUrl = getSlackConnectUrl(req.userId!);
      sendSuccess(res, { authorizeUrl });
    } catch (err) {
      next(err);
    }
  };
}

// Deliberately not going through the usual next(err) -> errorHandler chain:
// Slack redirects a real browser here, so the response needs to be a human-
// readable page, not the JSON envelope every other error in this API uses.
function resultPage(message: string, success: boolean): string {
  return `<!doctype html>
<html>
  <body style="font-family: sans-serif; text-align: center; padding-top: 4rem;">
    <h2>${success ? '✅' : '❌'} ${message}</h2>
  </body>
</html>`;
}

export function slackCallbackHandler() {
  return async (req: Request, res: Response) => {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;

    if (!code || !state) {
      res.status(400).send(resultPage('Missing code or state from Slack.', false));
      return;
    }

    try {
      const { teamName } = await handleSlackCallback(code, state);
      res.send(
        resultPage(`Connected to Slack workspace "${teamName}". You can close this tab.`, true),
      );
    } catch (err) {
      logger.error('Slack OAuth callback failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      res.status(400).send(resultPage('Failed to connect to Slack. Please try again.', false));
    }
  };
}
