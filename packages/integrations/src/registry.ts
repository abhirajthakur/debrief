import { UnknownIntegrationError } from './errors.js';
import type { Integration, IntegrationConfig, IntegrationFactory } from './types.js';

const registry = new Map<string, IntegrationFactory>();

export function registerIntegration(name: string, factory: IntegrationFactory): void {
  registry.set(name, factory);
}

export function getIntegration(name: string, config: IntegrationConfig): Integration {
  const factory = registry.get(name);
  if (!factory) {
    throw new UnknownIntegrationError(name);
  }
  return factory(config);
}
