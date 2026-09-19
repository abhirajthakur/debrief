export class IntegrationError extends Error {
  constructor(
    message: string,
    public readonly integration: string,
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}

export class UnknownIntegrationError extends Error {
  constructor(name: string) {
    super(`No integration registered under the name "${name}"`);
    this.name = 'UnknownIntegrationError';
  }
}
