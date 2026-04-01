import type { CrossEvaluationSectionProps } from "./types";

export function CrossEvaluationSection({ matrix, evaluatorLabels }: CrossEvaluationSectionProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-lg font-medium">Cross evaluation</h2>
      <p className="text-sm text-[var(--muted)]">
        Each model reviews every other model&apos;s answers across all questions and returns scores (1–10) and notes per question when JSON
        parsing succeeds.
      </p>
      {Object.entries(matrix).map(([evalId, targets]) => (
        <div key={evalId} className="space-y-3">
          <h3 className="text-md font-medium text-[var(--accent)]">Reviewer: {evaluatorLabels[evalId] ?? evalId}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(targets).map(([tid, cell]) => (
              <article
                key={tid}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2 text-sm"
              >
                <div className="font-medium">Target: {cell.targetLabel}</div>
                {cell.summary && <p className="text-[var(--muted)]">{cell.summary}</p>}
                {cell.perQuestion && cell.perQuestion.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2 text-[var(--muted)]">
                    {cell.perQuestion.map((pq, idx) => (
                      <li key={idx}>
                        <span className="text-[var(--foreground)]">
                          {pq.score != null ? `Score ${pq.score}/10` : "Score"} —{" "}
                        </span>
                        {pq.feedback}
                        <div className="text-xs mt-1 opacity-80 line-clamp-3">{pq.question}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <pre className="text-xs whitespace-pre-wrap break-words bg-black/30 rounded p-2 max-h-48 overflow-auto">
                    {cell.raw}
                  </pre>
                )}
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
