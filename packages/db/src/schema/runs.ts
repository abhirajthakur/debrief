import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { runStatusEnum } from './enums.js';
import { users } from './users.js';

export const runs = pgTable('runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  transcript: text('transcript').notNull(),
  status: runStatusEnum('status').notNull().default('queued'),
  promptVersion: text('prompt_version').notNull(),
  model: text('model').notNull(), // e.g. "groq/llama-3.3-70b-versatile"
  error: text('error'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
});

export type RunRow = typeof runs.$inferSelect;
export type NewRunRow = typeof runs.$inferInsert;
