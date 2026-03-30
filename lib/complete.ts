import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ModelDefinition } from "./models";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

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

async function openaiCompatible(
  baseURL: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  const client = new OpenAI({ apiKey, baseURL });
  const res = await client.chat.completions.create({
    model,
    messages,
    max_tokens: 4096,
    temperature: 0.4,
  });
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
      return openaiCompatible("https://api.openai.com/v1", key, def.apiModel, messages);
    case "groq":
      return openaiCompatible("https://api.groq.com/openai/v1", key, def.apiModel, messages);
    case "deepinfra":
      return openaiCompatible("https://api.deepinfra.com/v1/openai", key, def.apiModel, messages);
    case "openrouter": {
      const client = new OpenAI({
        apiKey: key,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://localhost",
          "X-Title": process.env.OPENROUTER_SITE_NAME || "AI Shock Tester",
        },
      });
      const res = await client.chat.completions.create({
        model: def.apiModel,
        messages,
        max_tokens: 4096,
        temperature: 0.4,
      });
      const text = res.choices[0]?.message?.content;
      if (!text) throw new Error("Empty OpenRouter completion");
      return text;
    }
    case "gemini":
      return completeGemini(key, def.apiModel, messages);
  }
}
