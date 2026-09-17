export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export class UnknownProviderError extends Error {
  constructor(name: string) {
    super(`No LLM provider registered under the name "${name}"`);
    this.name = "UnknownProviderError";
  }
}
