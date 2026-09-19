export type ToolResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type Tool<TInput = unknown, TOutput = unknown> = {
  name: string;
  execute(input: TInput): Promise<ToolResult<TOutput>>;
};

export type IntegrationConfig = Record<string, string>;

export type Integration = {
  name: string;
  tools: Tool[];
};

export type IntegrationFactory = (config: IntegrationConfig) => Integration;
