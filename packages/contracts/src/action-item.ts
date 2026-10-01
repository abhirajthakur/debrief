import { z } from 'zod';

export const actionPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type ActionPriority = z.infer<typeof actionPrioritySchema>;

export const actionItemStatusSchema = z.enum([
  'pending_review', // low confidence — held for a human to approve
  'auto_executed', // confidence above threshold — tool calls already ran
  'executed', // approved manually and executed
  'rejected', // human rejected it, no tool calls made
  'failed', // execution attempted but a tool call errored
]);
export type ActionItemStatus = z.infer<typeof actionItemStatusSchema>;

// What the actor LLM must return for one action item extracted from a
// transcript. Validated against every model response — a failure here
// triggers a retry with the Zod error fed back into the next prompt.
export const extractedActionItemSchema = z.object({
  task: z.string().min(3).max(500),
  owner: z.string().min(1).max(200).nullable(),
  dueDate: z.iso.datetime({ offset: true }).nullable(),
  priority: actionPrioritySchema,
  confidence: z.number().min(0).max(1),
  sourceQuote: z.string().max(500).nullable(), // transcript line it came from
});
export type ExtractedActionItem = z.infer<typeof extractedActionItemSchema>;

export const extractionResultSchema = z.object({
  items: z.array(extractedActionItemSchema),
  summary: z.string().max(1000),
});
export type ExtractionResult = z.infer<typeof extractionResultSchema>;

// A persisted action item: extracted fields plus execution state.
export const actionItemSchema = extractedActionItemSchema.extend({
  id: z.uuid(),
  runId: z.uuid(),
  status: actionItemStatusSchema,
  toolCalls: z.array(z.uuid()).default([]),
  createdAt: z.iso.datetime(),
});
export type ActionItem = z.infer<typeof actionItemSchema>;

// Request body for PATCH /action-items/:itemId — a human's decision on an
// item that was held for review.
export const reviewActionItemInputSchema = z.object({
  decision: z.enum(['approve', 'reject']),
});
export type ReviewActionItemInput = z.infer<typeof reviewActionItemInputSchema>;
