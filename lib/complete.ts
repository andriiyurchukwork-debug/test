import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ModelDefinition } from "./models";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const GROQ_SYSTEM_PROMPT_MAX_CHARS = 10_000;
const GROQ_MAX_COMPLETION_TOKENS = 2048;

function clampGroqMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((m) => {
    if (m.role !== "system" || m.content.length <= GROQ_SYSTEM_PROMPT_MAX_CHARS) return m;
    return {
      ...m,
      content: `${m.content.slice(0, GROQ_SYSTEM_PROMPT_MAX_CHARS)}\n\n[… system prompt truncated for Groq request limits …]`,
    };
  });
}

function getKey(def: ModelDefinition): string | undefined {
  switch (def.provider) {
    case "openai":
      return process.env.OPENAI_API_KEY;
    case "groq":
      return process.env.GROQ_API_KEY;
    case "deepinfra":
      return process.env.DEEPINFRA_API_KEY;
    case "gemini":
      return process.env.GEMINI_API_KEY;
    case "openrouter":
      return process.env.OPENROUTER_API_KEY;
  }
}

function openAiPrefersMaxCompletionTokens(model: string): boolean {
  const m = model.toLowerCase();
  return m.startsWith("gpt-5") || m.startsWith("o1") || m.startsWith("o3") || /^o\d/.test(m);
}

function openAiOmitsTemperature(model: string): boolean {
  const m = model.toLowerCase();
  return m.startsWith("o1") || m.startsWith("o3") || /^o\d/.test(m);
}

async function openaiCompatible(
  baseURL: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  opts?: {
    useMaxCompletionTokens?: boolean;
    omitTemperature?: boolean;
    maxOutputTokens?: number;
  },
): Promise<string> {
  const client = new OpenAI({ apiKey, baseURL });
  const maxOut = opts?.maxOutputTokens ?? 4096;
  const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
    model,
    messages,
    ...(opts?.omitTemperature ? {} : { temperature: 0.4 }),
    ...(opts?.useMaxCompletionTokens
      ? { max_completion_tokens: maxOut }
      : { max_tokens: maxOut }),
  };
  const res = await client.chat.completions.create(params);
  const text = res.choices[0]?.message?.content;
  if (!text) throw new Error("Empty completion");
  return text;
}

async function completeGemini(apiKey: string, model: string, messages: ChatMessage[]): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const gm = genAI.getGenerativeModel({ model });
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
  const rest = messages.filter((m) => m.role !== "system");
  const userParts = rest.map((m) => `${m.role}: ${m.content}`).join("\n\n");
  const prompt = system ? `${system}\n\n${userParts}` : userParts;
  const result = await gm.generateContent(prompt);
  const text = result.response.text();
  if (!text?.trim()) throw new Error("Empty Gemini completion");
  return text;
}

export async function completeWithModel(def: ModelDefinition, messages: ChatMessage[]): Promise<string> {
  const key = getKey(def);
  if (!key) {
    throw new Error(`Missing API key for ${def.provider} (${def.label})`);
  }

  switch (def.provider) {
    case "openai":
      return openaiCompatible("https://api.openai.com/v1", key, def.apiModel, messages, {
        useMaxCompletionTokens: openAiPrefersMaxCompletionTokens(def.apiModel),
        omitTemperature: openAiOmitsTemperature(def.apiModel),
      });
    case "groq":
      return openaiCompatible(
        "https://api.groq.com/openai/v1",
        key,
        def.apiModel,
        clampGroqMessages(messages),
        { maxOutputTokens: GROQ_MAX_COMPLETION_TOKENS },
      );
    case "deepinfra":
      return openaiCompatible("https://api.deepinfra.com/v1/openai", key, def.apiModel, messages);
    case "openrouter": {
      const orPrefers = /^openai\/gpt-5/i.test(def.apiModel) || /^openai\/o\d/i.test(def.apiModel);
      const client = new OpenAI({
        apiKey: key,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://localhost",
          "X-Title": process.env.OPENROUTER_SITE_NAME || "AI Shock Tester",
        },
      });
      const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
        model: def.apiModel,
        messages,
        temperature: 0.4,
        ...(orPrefers ? { max_completion_tokens: 4096 } : { max_tokens: 4096 }),
      };
      const res = await client.chat.completions.create(params);
      const text = res.choices[0]?.message?.content;
      if (!text) throw new Error("Empty OpenRouter completion");
      return text;
    }
    case "gemini":
      return completeGemini(key, def.apiModel, messages);
  }
}
