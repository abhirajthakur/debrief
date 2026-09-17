import { UnknownProviderError } from "./errors.js";
import type { LLMProvider, ProviderConfig, ProviderFactory } from "./types.js";

const registry = new Map<string, ProviderFactory>();

export function registerProvider(name: string, factory: ProviderFactory) {
  registry.set(name, factory);
}

export function getProvider(name: string, config: ProviderConfig): LLMProvider {
  const factory = registry.get(name);
  if (!factory) {
    throw new UnknownProviderError(name);
  }
  return factory(config);
}
