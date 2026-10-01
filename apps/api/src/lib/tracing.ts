import * as spansRepository from '../repositories/spans.repository.js';

type SpanType = 'llm' | 'tool';

type WithSpanOptions = {
  runId: string;
  type: SpanType;
  name: string;
  /** Must be JSON-serializable — never pass a provider/tool instance here, only its inputs. */
  input: unknown;
};

// Our Tool contract never throws — a failed Slack post, for example, comes
// back as { success: false, error }, not a rejected promise. So a span is
// only "successful" if it didn't throw AND (when the output looks like a
// ToolResult) that result says success too.
function looksLikeToolResult(value: unknown): value is { success: boolean; error?: string } {
  return typeof value === 'object' && value !== null && 'success' in value;
}

export async function withSpan<T>(options: WithSpanOptions, fn: () => Promise<T>): Promise<T> {
  const startedAt = new Date();

  try {
    const output = await fn();
    const failed = looksLikeToolResult(output) && !output.success;

    await spansRepository.createSpan({
      runId: options.runId,
      type: options.type,
      name: options.name,
      input: options.input,
      output: output as unknown,
      status: failed ? 'error' : 'success',
      errorMessage: failed ? ((output as { error?: string }).error ?? 'Unknown tool error') : null,
      latencyMs: Date.now() - startedAt.getTime(),
      startedAt,
    });

    return output;
  } catch (err) {
    await spansRepository.createSpan({
      runId: options.runId,
      type: options.type,
      name: options.name,
      input: options.input,
      output: null,
      status: 'error',
      errorMessage: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - startedAt.getTime(),
      startedAt,
    });
    throw err;
  }
}
