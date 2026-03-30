import { NextResponse } from "next/server";
import { MODELS, getModelById } from "@/lib/models";
import { completeWithModel } from "@/lib/complete";
import type { ChatMessage } from "@/lib/complete";
import type { CompareRow } from "../compare/route";

export type EvalCell = {
  targetModelId: string;
  targetLabel: string;
  raw: string;
  summary?: string;
  perQuestion?: { question: string; score?: number; feedback?: string }[];
};

export type EvalMatrix = Record<string, Record<string, EvalCell>>;

function tryParseEvalJson(text: string): { items?: { questionIndex: number; score: number; feedback: string }[]; summary?: string } {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const slice = fenced?.[1]?.trim() ?? text.trim();
  try {
    const o = JSON.parse(slice) as {
      items?: { questionIndex: number; score: number; feedback: string }[];
      summary?: string;
    };
    return o;
  } catch {
    return {};
  }
}

export async function POST(req: Request) {
  let body: { rows?: CompareRow[]; modelIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rows = body.rows;
  if (!rows?.length) {
    return NextResponse.json({ error: "No rows to evaluate" }, { status: 400 });
  }

  const selected = body.modelIds?.length
    ? body.modelIds.map((id) => getModelById(id)).filter(Boolean)
    : MODELS;
  const models = selected as typeof MODELS;
  if (!models.length) {
    return NextResponse.json({ error: "No valid models" }, { status: 400 });
  }

  const matrix: EvalMatrix = {};

  const tasks: Promise<void>[] = [];

  for (const evaluator of models) {
    matrix[evaluator.id] = {};
    for (const target of models) {
      if (target.id === evaluator.id) continue;

      const qaBlock = rows
        .map((r, i) => {
          const a = r.answers[target.id] ?? "(no answer — call failed)";
          return `### Question ${i + 1}\n${r.question}\n\nAnswer from «${target.label}»:\n${a}`;
        })
        .join("\n\n---\n\n");

      const user = `You are an independent reviewer. Evaluate the other model's answers to each question.

${qaBlock}

Return STRICT JSON only, no extra prose (you may wrap it in a markdown json code block):
{
  "summary": "Overall assessment in 2–4 sentences in English",
  "items": [
    { "questionIndex": 1, "score": 7, "feedback": "What works / what to improve (1–3 sentences)" }
  ]
}

questionIndex is 1..${rows.length}. score is an integer from 1 to 10.`;

      const messages: ChatMessage[] = [
        {
          role: "system",
          content:
            "You are an expert at judging LLM answer quality. Use English for summary and feedback fields.",
        },
        { role: "user", content: user },
      ];

      tasks.push(
        (async () => {
          let raw = "";
          try {
            raw = await completeWithModel(evaluator, messages);
          } catch (e) {
            raw = e instanceof Error ? e.message : String(e);
            matrix[evaluator.id][target.id] = {
              targetModelId: target.id,
              targetLabel: target.label,
              raw,
            };
            return;
          }

          const parsed = tryParseEvalJson(raw);
          const items = parsed.items?.map((it) => ({
            question: rows[it.questionIndex - 1]?.question ?? `Question ${it.questionIndex}`,
            score: it.score,
            feedback: it.feedback,
          }));

          matrix[evaluator.id][target.id] = {
            targetModelId: target.id,
            targetLabel: target.label,
            raw,
            summary: parsed.summary,
            perQuestion: items,
          };
        })(),
      );
    }
  }

  await Promise.all(tasks);

  return NextResponse.json({
    matrix,
    evaluatorLabels: Object.fromEntries(models.map((m) => [m.id, m.label])),
  });
}
