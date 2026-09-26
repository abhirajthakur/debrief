export { mockProviderWithResponse } from "./adapters/mock.js";
export * from "./errors.js";
export { getProvider, registerProvider } from "./registry.js";
export * from "./types.js";
import createGeminiProvider from "./adapters/gemini.js";
import createGroqProvider from "./adapters/groq.js";
import createMockProvider from "./adapters/mock.js";
import { registerProvider } from "./registry.js";

registerProvider("groq", createGroqProvider);
registerProvider("gemini", createGeminiProvider);
registerProvider("mock", createMockProvider);

// To add a provider later: write adapters/<name>.ts implementing LLMProvider,
// then add one line here. Nothing outside this package needs to change —
// packages/core only ever calls getProvider(name, config).
