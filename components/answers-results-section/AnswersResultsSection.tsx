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
  modelIds,
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
      await downloadResultsXlsx(rows, modelIds, labels, evalMatrix, evaluatorLabels);
    } finally {
      setExporting(false);
    }
  }, [rows, modelIds, labels, evalMatrix, evaluatorLabels]);

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

        {view === "matrix" ? (
          <AnswersMatrixTable rows={rows} modelIds={modelIds} labels={labels} />
        ) : (
          <AnswersByModelGrid rows={rows} modelIds={modelIds} labels={labels} />
        )}
      </section>

      {evalMatrix && evaluatorLabels && <CrossEvaluationSection matrix={evalMatrix} evaluatorLabels={evaluatorLabels} />}
    </>
  );
}
