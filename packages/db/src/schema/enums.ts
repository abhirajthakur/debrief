import { pgEnum } from 'drizzle-orm/pg-core';

export const runStatusEnum = pgEnum('run_status', [
  'queued',
  'extracting',
  'routing',
  'executing',
  'completed',
  'failed',
]);

export const actionPriorityEnum = pgEnum('action_priority', ['low', 'medium', 'high', 'urgent']);

export const actionItemStatusEnum = pgEnum('action_item_status', [
  'pending_review',
  'auto_executed',
  'executed',
  'rejected',
  'failed',
]);

export const spanTypeEnum = pgEnum('span_type', ['llm', 'tool']);

export const spanStatusEnum = pgEnum('span_status', ['success', 'error']);
