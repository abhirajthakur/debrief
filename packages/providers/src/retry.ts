type RetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
};

/**
 * fetch() with retry-on-transient-failure. Only retries 429 (rate limit)
 * and 5xx (server error) — a genuine 4xx like bad auth or a malformed
 * request will never succeed on retry, so those are returned immediately
 * for the caller to turn into a ProviderError as usual.
 *
 * Note this can't help against a truly exhausted daily quota (only a
 * short-term rate limit) — if every attempt still comes back 429, the
 * final failed response is returned rather than retried forever.
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options: RetryOptions = {},
): Promise<Response> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 5000;

  let response: Response;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    response = await fetch(url, init);

    if (response.ok) {
      return response;
    }

    const isRetryable = response.status === 429 || response.status >= 500;
    if (!isRetryable || attempt === maxAttempts) {
      return response;
    }

    const retryAfterHeader = response.headers.get("retry-after");
    const delayMs = retryAfterHeader
      ? Number(retryAfterHeader) * 1000
      : baseDelayMs * 2 ** (attempt - 1); // 5s, 10s, ... if no header given

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  // Unreachable — the loop always returns — but satisfies the type checker.
  return response!;
}
