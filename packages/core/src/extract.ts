import { type ExtractionResult, extractionResultSchema } from '@debrief/contracts';
import type { LLMProvider } from '@debrief/providers';
import { buildExtractPrompt, PROMPT_VERSION } from './prompts/extract.v4.js';
import { parseJsonWithRetry } from './validation/parse.js';

export type ExtractOptions = {
  provider: LLMProvider;
  model: string;
  transcript: string;
  /** Defaults to now. Pass a fixed date in golden-case evals for determinism. */
  referenceDate?: Date;
};

export type ExtractOutput = {
  result: ExtractionResult;
  promptVersion: string;
};

export async function extractActionItems({
  provider,
  model,
  transcript,
  referenceDate = new Date(),
}: ExtractOptions): Promise<ExtractOutput> {
  const result = await parseJsonWithRetry({
    schema: extractionResultSchema,
    generate: async (feedback) => {
      const response = await provider.complete({
        model,
        temperature: 0.2,
        jsonMode: true,
        messages: [
          { role: 'system', content: buildExtractPrompt(referenceDate) },
          { role: 'user', content: transcript },
          ...(feedback
            ? [
                {
                  role: 'user' as const,
                  content: `Your previous response was invalid: ${feedback}\nReturn corrected JSON only.`,
                },
              ]
            : []),
        ],
      });
      return response.text;
    },
  });

  return { result, promptVersion: PROMPT_VERSION };
}
