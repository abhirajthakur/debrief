import { z } from "zod";

export const RunStatus = z.enum([
  "queued",
  "extracting",
  "routing",
  "executing",
  "completed",
  "failed",
]);
export type RunStatus = z.infer<typeof RunStatus>;

export const CreateRunInputSchema = z.object({
  transcript: z.string().min(20, { error: "Transcript looks too short to be a meeting" }),
  source: z.enum(["manual", "zoom", "google_meet", "upload"]).default("manual"),
  promptVersion: z.string().optional(), // defaults to latest in packages/core/prompts
});
export type CreateRunInput = z.infer<typeof CreateRunInputSchema>;

export const RunSchema = z.object({
  id: z.uuid(),
  status: RunStatus,
  promptVersion: z.string(),
  model: z.string(), // e.g. "groq/llama-3.3-70b-versatile"
  error: z.string().nullable(),
  startedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime().nullable(),
});
export type Run = z.infer<typeof RunSchema>;
