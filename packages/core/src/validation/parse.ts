import type { ZodType } from "zod";

type ParseWithRetryOptions<T> = {
  schema: ZodType<T>;
  /** Called once per attempt. Receives the previous failure's feedback, if any. */
  generate: (feedback?: string) => Promise<string>;
  maxAttempts?: number;
};

// Some models wrap JSON output in ```json ... ``` fences even when jsonMode
// is requested and the prompt explicitly says not to. Stripping this
// defensively before parsing is standard practice — it's a no-op when
// there are no fences, and fixes the single most common cause of parse
// failures when there are.
function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
  return match?.[1]?.trim() ?? trimmed;
}

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
    const cleaned = stripCodeFences(raw);

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
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
