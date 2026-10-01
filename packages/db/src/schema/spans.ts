import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { spanStatusEnum, spanTypeEnum } from './enums.js';
import { runs } from './runs.js';

export const spans = pgTable('spans', {
  id: uuid('id').primaryKey().defaultRandom(),
  runId: uuid('run_id')
    .notNull()
    .references(() => runs.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'), // self-reference, kept nullable/untyped-FK for simplicity
  type: spanTypeEnum('type').notNull(),
  name: text('name').notNull(), // e.g. "extract.groq" or "slack.postDigest"
  input: jsonb('input').notNull(),
  output: jsonb('output'),
  status: spanStatusEnum('status').notNull().default('success'),
  errorMessage: text('error_message'),
  latencyMs: integer('latency_ms'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
});

export type SpanRow = typeof spans.$inferSelect;
export type NewSpanRow = typeof spans.$inferInsert;
