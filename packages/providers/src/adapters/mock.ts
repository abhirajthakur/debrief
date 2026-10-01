import type { CompletionResponse, LLMProvider, ProviderConfig } from '../types.js';

// Helper for tests: a provider that always returns a specific canned string,
// bypassing the network entirely.
export function mockProviderWithResponse(text: string): LLMProvider {
  return {
    name: 'mock',
    async complete(request): Promise<CompletionResponse> {
      return {
        text,
        model: request.model,
        usage: { promptTokens: 0, completionTokens: 0 },
        finishReason: 'stop',
      };
    },
  };
}

// Registered under "mock" so it's reachable via getProvider() too, e.g. for
// local dev without any API keys set.
function createMockProvider(_config: ProviderConfig): LLMProvider {
  return mockProviderWithResponse('{}');
}

export default createMockProvider;
