import { pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { actionItemStatusEnum, actionPriorityEnum } from "./enums.js";
import { runs } from "./runs.js";

export const actionItems = pgTable("action_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id")
    .notNull()
    .references(() => runs.id, { onDelete: "cascade" }),
  task: text("task").notNull(),
  owner: text("owner"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  priority: actionPriorityEnum("priority").notNull(),
  confidence: real("confidence").notNull(),
  sourceQuote: text("source_quote"),
  status: actionItemStatusEnum("status").notNull().default("pending_review"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ActionItemRow = typeof actionItems.$inferSelect;
export type NewActionItemRow = typeof actionItems.$inferInsert;
