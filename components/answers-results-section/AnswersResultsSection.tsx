"use client";

import { useCallback, useState } from "react";
import { downloadResultsXlsx } from "@/lib/export-results-xlsx";
import { AnswersByModelGrid } from "@/components/answers-by-model-grid";
import { AnswersMatrixTable } from "@/components/answers-matrix-table";
import { CrossEvaluationSection } from "@/components/cross-evaluation-section";
import type { AnswersResultsSectionProps } from "./types";

export function AnswersResultsSection({
  rows,
  view,
  displayModelIds,
  resultModelIds,
  comparisonColumnIds,
  onToggleComparisonColumn,
  labels,
  evalLoading,
  onEvaluate,
  evalMatrix,
  evaluatorLabels,
}: AnswersResultsSectionProps) {
  const [exporting, setExporting] = useState(false);

  const onExportExcel = useCallback(async () => {
    setExporting(true);
    try {
      await downloadResultsXlsx(rows, resultModelIds, labels, evalMatrix, evaluatorLabels);
    } finally {
      setExporting(false);
    }
  }, [rows, resultModelIds, labels, evalMatrix, evaluatorLabels]);

  if (!rows.length) return null;

  return (
    <>
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Answers</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onExportExcel}
              disabled={exporting}
              className="rounded-lg border border-[var(--border)] text-[var(--foreground)] px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-white/5"
            >
              {exporting ? "Exporting…" : "Export Excel"}
            </button>
            <button
              type="button"
              onClick={onEvaluate}
              disabled={evalLoading}
              className="rounded-lg border border-[var(--accent)] text-[var(--accent)] px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {evalLoading ? "Models are scoring answers…" : "Evaluate answers (cross review)"}
            </button>
          </div>
        </div>

        {resultModelIds.length > 0 && (
          <fieldset className="rounded-lg border border-[var(--border)] bg-[var(--card)]/80 p-4 space-y-2">
            <legend className="text-sm font-medium text-[var(--foreground)] px-1">Comparison table columns</legend>
            <p className="text-xs text-[var(--muted)]">
              Choose which models appear side by side below (does not run new API calls). Export still includes all loaded answers.
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 max-h-[min(40vh,320px)] overflow-y-auto overscroll-contain">
              {resultModelIds.map((id) => (
                <li key={id}>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={comparisonColumnIds.includes(id)}
                      onChange={() => onToggleComparisonColumn(id)}
                      className="rounded border-[var(--border)]"
                    />
                    <span>{labels[id] ?? id}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        )}

        {view === "matrix" ? (
          <AnswersMatrixTable rows={rows} modelIds={displayModelIds} labels={labels} />
        ) : (
          <AnswersByModelGrid rows={rows} modelIds={displayModelIds} labels={labels} />
        )}
      </section>

      {evalMatrix && evaluatorLabels && <CrossEvaluationSection matrix={evalMatrix} evaluatorLabels={evaluatorLabels} />}
    </>
  );
}
