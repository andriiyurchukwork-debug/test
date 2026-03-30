import { NextResponse } from "next/server";
import { MODELS, getModelById } from "@/lib/models";
import { completeWithModel } from "@/lib/complete";
import type { ChatMessage } from "@/lib/complete";

export type CompareRow = {
  question: string;
  answers: Record<string, string>;
  errors: Record<string, string>;
};

const SYSTEM = `You are a helpful assistant. Answer in the same language as the question when practical. Be concise but complete.`;

export async function POST(req: Request) {
  let body: { questions?: string[]; modelIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
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
          { role: "system", content: SYSTEM },
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
