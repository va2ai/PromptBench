export interface JsonSchemaLike {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  items?: unknown;
  description?: string;
}

export interface GenerateJsonRequest {
  model: string;
  prompt: string;
  schema: JsonSchemaLike;
  temperature?: number;
  maxRetries?: number;
}

export interface GenerateTextRequest {
  model: string;
  prompt: string;
  temperature?: number;
}

export interface LLMUsage {
  prompt_tokens: number;
  output_tokens: number;
}

export interface LLMResponse<T = unknown> {
  provider: string;
  model: string;
  data: T;
  text?: string;
  usage: LLMUsage;
}

export interface LLMProvider {
  readonly name: string;
  generateJson<T = unknown>(request: GenerateJsonRequest): Promise<LLMResponse<T>>;
  generateText?(request: GenerateTextRequest): Promise<LLMResponse<string>>;
}

export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}
