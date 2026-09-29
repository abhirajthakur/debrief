import type { ExtractedActionItem } from "@debrief/contracts";
import { parseJsonWithRetry } from "@debrief/core";
import type { LLMProvider } from "@debrief/providers";
import { type GoldenCase, type JudgeVerdict, judgeVerdictSchema } from "./schemas.js";

const JUDGE_SYSTEM_PROMPT = `You are a strict grading assistant comparing an AI system's extracted action items against a known-correct expected answer. Return ONLY valid JSON, no prose, no markdown fences.`;

function buildJudgeUserPrompt(goldenCase: GoldenCase, actualItems: ExtractedActionItem[]): string {
  return `Transcript:
"""
${goldenCase.transcript}
"""

Expected action items (the correct answer):
${JSON.stringify(goldenCase.expectedItems, null, 2)}

The system's actual extracted action items:
${JSON.stringify(actualItems, null, 2)}

Return JSON matching this exact shape:
{
  "matchedCount": number,
  "missedItems": string[],
  "hallucinatedItems": string[],
  "passed": boolean,
  "reasoning": string
}

Grading rules:
- "passed" is true only if every expected item was captured in substance (minor wording differences are fine) AND nothing was hallucinated.
- Judge dueDate resolution charitably: if the expected item's date is a relative phrase, credit any absolute date the system resolved it to as correct, as long as it's a reasonable interpretation relative to the transcript.
- Do not fail a case solely because "priority" differs from the expected value by one level (e.g. medium vs high) — priority is a subjective judgment call, not a factual extraction like task, owner, or date. Only treat priority as wrong if it's wildly implausible (e.g. "urgent" for a casual suggestion).
- If expectedItems is empty, "passed" is true only if the system also extracted zero items.`;
}

export async function judgeExtraction(options: {
  judgeProvider: LLMProvider;
  judgeModel: string;
  goldenCase: GoldenCase;
  actualItems: ExtractedActionItem[];
}): Promise<JudgeVerdict> {
  return parseJsonWithRetry({
    schema: judgeVerdictSchema,
    generate: async (feedback) => {
      const response = await options.judgeProvider.complete({
        model: options.judgeModel,
        temperature: 0,
        jsonMode: true,
        messages: [
          { role: "system", content: JUDGE_SYSTEM_PROMPT },
          { role: "user", content: buildJudgeUserPrompt(options.goldenCase, options.actualItems) },
          ...(feedback
            ? [
                {
                  role: "user" as const,
                  content: `Your previous response was invalid: ${feedback}\nReturn corrected JSON only.`,
                },
              ]
            : []),
        ],
      });
      return response.text;
    },
  });
}
