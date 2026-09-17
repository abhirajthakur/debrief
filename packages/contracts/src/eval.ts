import { z } from "zod";
import { ExtractedActionItemSchema } from "./action-item.js";

export const GoldenCaseCategory = z.enum([
  "normal", // straightforward transcript, should be a clean pass
  "no_action_items", // pure chitchat — tests against false positives
  "adversarial", // contains a decoy that sounds like a task but isn't
]);
export type GoldenCaseCategory = z.infer<typeof GoldenCaseCategory>;

export const GoldenCaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: GoldenCaseCategory,
  transcript: z.string(),
  expectedItems: z.array(
    ExtractedActionItemSchema.partial({ confidence: true, sourceQuote: true }),
  ),
});
export type GoldenCase = z.infer<typeof GoldenCaseSchema>;

// Judge model scores one run's extraction against a golden case's expected
// items. Always a different provider than the actor (see LLM_JUDGE_* in
// .env.example) so a model never grades its own output.
export const JudgeVerdictSchema = z.object({
  matchedCount: z.number().int().min(0),
  missedItems: z.array(z.string()),
  hallucinatedItems: z.array(z.string()),
  passed: z.boolean(),
  reasoning: z.string().max(1000),
});
export type JudgeVerdict = z.infer<typeof JudgeVerdictSchema>;

export const EvalResultSchema = z.object({
  id: z.uuid(),
  evalRunId: z.uuid(),
  goldenCaseId: z.string(),
  verdict: JudgeVerdictSchema,
  createdAt: z.iso.datetime(),
});
export type EvalResult = z.infer<typeof EvalResultSchema>;

// Aggregate stats for one sweep across the whole golden set.
export const EvalRunSummarySchema = z.object({
  id: z.uuid(),
  promptVersion: z.string(),
  actorModel: z.string(), // e.g. "groq/llama-3.3-70b-versatile"
  judgeModel: z.string(), // e.g. "gemini/gemini-2.0-flash"
  totalCases: z.number().int(),
  passRate: z.number().min(0).max(1),
  hallucinationRate: z.number().min(0).max(1),
  createdAt: z.iso.datetime(),
});
export type EvalRunSummary = z.infer<typeof EvalRunSummarySchema>;
