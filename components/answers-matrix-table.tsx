import type { CompareRow } from "@/app/api/compare/route";

type AnswersMatrixTableProps = {
  rows: CompareRow[];
  modelIds: string[];
  labels: Record<string, string>;
};

export function AnswersMatrixTable({ rows, modelIds, labels }: AnswersMatrixTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-[var(--card)] border-b border-[var(--border)]">
            <th className="text-left p-3 font-medium text-[var(--muted)] w-48">Question</th>
            {modelIds.map((id) => (
              <th key={id} className="text-left p-3 font-medium text-[var(--muted)] min-w-[220px]">
                {labels[id] ?? id}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--border)] align-top">
              <td className="p-3 text-[var(--foreground)]">{row.question}</td>
              {modelIds.map((id) => (
                <td key={id} className="p-3 text-[var(--muted)] whitespace-pre-wrap break-words">
                  {row.errors[id] ? <span className="text-red-400">{row.errors[id]}</span> : row.answers[id]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
