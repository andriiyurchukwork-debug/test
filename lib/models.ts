export type ProviderId = "openai" | "groq" | "deepinfra" | "gemini" | "openrouter";

export type ModelDefinition = {
  id: string;
  label: string;
  provider: ProviderId;
  apiModel: string;
};

export const MODELS: ModelDefinition[] = [
  { id: "openai-gpt-5-2", label: "OpenAI GPT-5.2", provider: "openai", apiModel: "gpt-5.2" },
  { id: "openai-gpt-4o", label: "OpenAI GPT-4o", provider: "openai", apiModel: "gpt-4o" },
  { id: "openai-gpt-4o-mini", label: "OpenAI GPT-4o mini", provider: "openai", apiModel: "gpt-4o-mini" },
  { id: "openai-o1", label: "OpenAI o1", provider: "openai", apiModel: "o1" },

  { id: "groq-llama-33-70b", label: "Groq Llama 3.3 70B", provider: "groq", apiModel: "llama-3.3-70b-versatile" },
  { id: "groq-gpt-oss-120b", label: "Groq GPT-OSS 120B", provider: "groq", apiModel: "openai/gpt-oss-120b" },
  { id: "groq-llama-31-8b", label: "Groq Llama 3.1 8B", provider: "groq", apiModel: "llama-3.1-8b-instant" },
  { id: "groq-gpt-oss-20b", label: "Groq GPT-OSS 20B", provider: "groq", apiModel: "openai/gpt-oss-20b" },
  { id: "groq-llama-4-scout", label: "Groq Llama 4 Scout 17B (preview)", provider: "groq", apiModel: "meta-llama/llama-4-scout-17b-16e-instruct" },
  { id: "groq-qwen3-32b", label: "Groq Qwen3 32B (preview)", provider: "groq", apiModel: "qwen/qwen3-32b" },

  { id: "deepinfra-llama-33-70b", label: "DeepInfra Llama 3.3 70B", provider: "deepinfra", apiModel: "meta-llama/Llama-3.3-70B-Instruct" },
  { id: "deepinfra-llama-31-70b", label: "DeepInfra Llama 3.1 70B", provider: "deepinfra", apiModel: "meta-llama/Meta-Llama-3.1-70B-Instruct" },
  { id: "deepinfra-qwen-25-72b", label: "DeepInfra Qwen2.5 72B", provider: "deepinfra", apiModel: "Qwen/Qwen2.5-72B-Instruct" },
  { id: "deepinfra-mistral-small", label: "DeepInfra Mistral Small", provider: "deepinfra", apiModel: "mistralai/Mistral-Small-24B-Instruct-2501" },
  { id: "deepinfra-phi-4", label: "DeepInfra Phi-4", provider: "deepinfra", apiModel: "microsoft/phi-4" },

  { id: "gemini-25-flash", label: "Gemini 2.5 Flash", provider: "gemini", apiModel: "gemini-2.5-flash" },
  { id: "gemini-25-flash-lite", label: "Gemini 2.5 Flash-Lite", provider: "gemini", apiModel: "gemini-2.5-flash-lite" },
  { id: "gemini-25-pro", label: "Gemini 2.5 Pro", provider: "gemini", apiModel: "gemini-2.5-pro" },
  { id: "gemini-3-flash", label: "Gemini 3 Flash (preview)", provider: "gemini", apiModel: "gemini-3-flash-preview" },

  { id: "or-claude-35-haiku", label: "OpenRouter Claude 3.5 Haiku", provider: "openrouter", apiModel: "anthropic/claude-3-5-haiku" },
  { id: "or-claude-opus-4", label: "OpenRouter Claude Opus 4", provider: "openrouter", apiModel: "anthropic/claude-opus-4" },
  { id: "or-gpt-4o", label: "OpenRouter GPT-4o", provider: "openrouter", apiModel: "openai/gpt-4o" },
  { id: "or-gpt-4o-mini", label: "OpenRouter GPT-4o mini", provider: "openrouter", apiModel: "openai/gpt-4o-mini" },
  { id: "or-llama-33-70b", label: "OpenRouter Llama 3.3 70B", provider: "openrouter", apiModel: "meta-llama/llama-3.3-70b-instruct" },
  { id: "or-gemini-20-flash", label: "OpenRouter Gemini 2.0 Flash", provider: "openrouter", apiModel: "google/gemini-2.0-flash-001" },
  { id: "or-mistral-large", label: "OpenRouter Mistral Large", provider: "openrouter", apiModel: "mistralai/mistral-large" },
  { id: "or-deepseek-chat", label: "OpenRouter DeepSeek Chat", provider: "openrouter", apiModel: "deepseek/deepseek-chat" },
  { id: "or-qwen-25-72b", label: "OpenRouter Qwen2.5 72B", provider: "openrouter", apiModel: "qwen/qwen-2.5-72b-instruct" },
  { id: "or-llama-31-8b", label: "OpenRouter Llama 3.1 8B", provider: "openrouter", apiModel: "meta-llama/llama-3.1-8b-instruct" },
];

export function getModelById(id: string): ModelDefinition | undefined {
  return MODELS.find((m) => m.id === id);
}
