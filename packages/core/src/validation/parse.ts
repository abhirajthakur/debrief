import type { ZodType } from "zod";

type ParseWithRetryOptions<T> = {
  schema: ZodType<T>;
  /** Called once per attempt. Receives the previous failure's feedback, if any. */
  generate: (feedback?: string) => Promise<string>;
  maxAttempts?: number;
};

/**
 * Calls `generate` and validates its output against `schema`. If parsing or
 * validation fails, it retries with the specific error fed back in as
 * feedback — rather than blindly retrying — so the model gets a chance to
 * correct itself. This is the core reliability mechanism for every LLM call
 * that must return structured data.
 */
export async function parseJsonWithRetry<T>({
  schema,
  generate,
  maxAttempts = 2,
}: ParseWithRetryOptions<T>) {
  let feedback: string | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const raw = await generate(feedback);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      feedback = `Response was not valid JSON: ${(err as Error).message}`;
      continue;
    }

    const result = schema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    feedback = `Response did not match the expected schema: ${result.error.message}`;
  }

  throw new Error(
    `Failed to get valid output after ${maxAttempts} attempts. Last error: ${feedback}`,
  );
}
