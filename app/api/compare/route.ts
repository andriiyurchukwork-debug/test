import { NextResponse } from "next/server";
import { MODELS, getModelById } from "@/lib/models";
import { completeWithModel } from "@/lib/complete";
import type { ChatMessage } from "@/lib/complete";
import { WELLBEING_ASSISTANT_SYSTEM_PROMPT } from "@/lib/system-prompt";

export type CompareRow = {
  question: string;
  answers: Record<string, string>;
  errors: Record<string, string>;
};

const MAX_SYSTEM_PROMPT_CHARS = 120_000;

export async function POST(req: Request) {
  let body: { questions?: string[]; modelIds?: string[]; systemPrompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const trimmedPrompt = typeof body.systemPrompt === "string" ? body.systemPrompt.trim() : "";
  const systemContent =
    trimmedPrompt.length > 0 ? trimmedPrompt : WELLBEING_ASSISTANT_SYSTEM_PROMPT;
  if (systemContent.length > MAX_SYSTEM_PROMPT_CHARS) {
    return NextResponse.json(
      { error: `System prompt must be at most ${MAX_SYSTEM_PROMPT_CHARS} characters` },
      { status: 400 },
    );
  }

  const raw = body.questions?.map((q) => q.trim()).filter(Boolean) ?? [];
  if (raw.length < 1 || raw.length > 20) {
    return NextResponse.json(
      { error: "Provide between 1 and 20 questions (5–10 recommended)" },
      { status: 400 },
    );
  }

  const selected = body.modelIds?.length
    ? body.modelIds.map((id) => getModelById(id)).filter(Boolean)
    : MODELS;
  const models = selected as typeof MODELS;
  if (!models.length) {
    return NextResponse.json({ error: "No valid models" }, { status: 400 });
  }

  const rows: CompareRow[] = [];

  for (const question of raw) {
    const answers: Record<string, string> = {};
    const errors: Record<string, string> = {};

    await Promise.all(
      models.map(async (def) => {
        const messages: ChatMessage[] = [
          { role: "system", content: systemContent },
          { role: "user", content: question },
        ];
        try {
          const text = await completeWithModel(def, messages);
          answers[def.id] = text;
        } catch (e) {
          errors[def.id] = e instanceof Error ? e.message : String(e);
        }
      }),
    );

    rows.push({ question, answers, errors });
  }

  return NextResponse.json({ rows, modelIds: models.map((m) => m.id), modelLabels: Object.fromEntries(models.map((m) => [m.id, m.label])) });
}
