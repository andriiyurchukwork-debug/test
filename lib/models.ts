export type ProviderId = "openai" | "groq" | "deepinfra" | "gemini" | "openrouter";

export type ModelDefinition = {
  id: string;
  label: string;
  provider: ProviderId;
  apiModel: string;
};

const envOr = (key: string, fallback: string) =>
  (typeof process !== "undefined" && process.env[key]) || fallback;

export const MODELS: ModelDefinition[] = [
  {
    id: "openai",
    label: "OpenAI GPT-4o",
    provider: "openai",
    apiModel: envOr("OPENAI_MODEL", "gpt-4o"),
  },
  {
    id: "groq",
    label: "Groq Llama 3.3 70B",
    provider: "groq",
    apiModel: envOr("GROQ_MODEL", "llama-3.3-70b-versatile"),
  },
  {
    id: "deepinfra",
    label: "DeepInfra Llama 3.3 70B",
    provider: "deepinfra",
    apiModel: envOr("DEEPINFRA_MODEL", "meta-llama/Llama-3.3-70B-Instruct"),
  },
  {
    id: "gemini",
    label: "Gemini 2.5 Flash",
    provider: "gemini",
    apiModel: envOr("GEMINI_MODEL", "gemini-2.5-flash"),
  },
  {
    id: "openrouter",
    label: "OpenRouter Claude 3.5 Haiku",
    provider: "openrouter",
    apiModel: envOr("OPENROUTER_MODEL", "anthropic/claude-3-5-haiku"),
  },
];

export function getModelById(id: string): ModelDefinition | undefined {
  return MODELS.find((m) => m.id === id);
}
