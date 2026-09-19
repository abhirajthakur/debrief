import { z } from 'zod';

export const runStatus = z.enum([
  'queued',
  'extracting',
  'routing',
  'executing',
  'completed',
  'failed',
]);
export type RunStatus = z.infer<typeof runStatus>;

export const createRunInputSchema = z.object({
  transcript: z.string().min(20, { error: 'Transcript looks too short to be a meeting' }),
  source: z.enum(['manual', 'zoom', 'google_meet', 'upload']).default('manual'),
  promptVersion: z.string().optional(), // defaults to latest in packages/core/prompts
});
export type CreateRunInput = z.infer<typeof createRunInputSchema>;

export const runSchema = z.object({
  id: z.uuid(),
  status: runStatus,
  promptVersion: z.string(),
  model: z.string(), // e.g. "groq/llama-3.3-70b-versatile"
  error: z.string().nullable(),
  startedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime().nullable(),
});
export type Run = z.infer<typeof runSchema>;
