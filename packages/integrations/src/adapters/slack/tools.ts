import type { ActionItemStatus, ActionPriority } from '@debrief/contracts';
import type { Tool, ToolResult } from '../../types.js';
import { postToSlackWebhook } from './client.js';

export type DigestItem = {
  task: string;
  owner: string | null;
  dueDate: string | null;
  priority: ActionPriority;
  status: ActionItemStatus;
};

export type PostDigestInput = {
  summary: string;
  items: DigestItem[];
};

function formatDigest({ summary, items }: PostDigestInput): string {
  const lines = [`*Meeting summary:* ${summary}`, ''];

  if (items.length === 0) {
    lines.push('_No action items found._');
    return lines.join('\n');
  }

  lines.push('*Action items:*');
  for (const item of items) {
    const owner = item.owner ?? 'unassigned';
    const due = item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'no due date';
    const flag = item.status === 'pending_review' ? ' :warning: needs review' : '';
    lines.push(`• [${item.priority}] ${item.task} — _${owner}_, ${due}${flag}`);
  }

  return lines.join('\n');
}

export function createPostDigestTool(webhookUrl: string): Tool<PostDigestInput, void> {
  return {
    name: 'slack.postDigest',
    async execute(input): Promise<ToolResult<void>> {
      try {
        await postToSlackWebhook(webhookUrl, formatDigest(input));
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    },
  };
}
