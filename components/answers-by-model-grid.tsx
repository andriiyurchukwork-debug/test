import type { CompareRow } from "@/app/api/compare/route";

type AnswersByModelGridProps = {
  rows: CompareRow[];
  modelIds: string[];
  labels: Record<string, string>;
};

export function AnswersByModelGrid({ rows, modelIds, labels }: AnswersByModelGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {modelIds.map((id) => (
        <div key={id} className="rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="bg-[var(--card)] px-3 py-2 text-sm font-medium border-b border-[var(--border)]">
            {labels[id] ?? id}
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-2 text-[var(--muted)]">Question</th>
                <th className="text-left p-2 text-[var(--muted)]">Answer</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-[var(--border)] align-top">
                  <td className="p-2 w-2/5">{row.question}</td>
                  <td className="p-2 text-[var(--muted)] whitespace-pre-wrap break-words w-3/5">
                    {row.errors[id] ? <span className="text-red-400">{row.errors[id]}</span> : row.answers[id]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
