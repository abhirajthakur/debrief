export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type CompletionRequest = {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean; // ask the provider to return a valid JSON string
  signal?: AbortSignal;
};

export type CompletionResponse = {
  text: string;
  model: string;
  usage: { promptTokens: number; completionTokens: number };
  finishReason: 'stop' | 'length' | 'error';
};

export type LLMProvider = {
  name: string;
  complete(request: CompletionRequest): Promise<CompletionResponse>;
};

export type ProviderConfig = {
  apiKey: string;
};

export type ProviderFactory = (config: ProviderConfig) => LLMProvider;
