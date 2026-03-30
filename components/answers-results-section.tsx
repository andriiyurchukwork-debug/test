import type { CompareRow } from "@/app/api/compare/route";
import type { EvalMatrix } from "@/app/api/evaluate/route";
import type { ViewMode } from "./types";
import { AnswersByModelGrid } from "./answers-by-model-grid";
import { AnswersMatrixTable } from "./answers-matrix-table";
import { CrossEvaluationSection } from "./cross-evaluation-section";

type AnswersResultsSectionProps = {
  rows: CompareRow[];
  view: ViewMode;
  modelIds: string[];
  labels: Record<string, string>;
  evalLoading: boolean;
  onEvaluate: () => void;
  evalMatrix: EvalMatrix | null;
  evaluatorLabels: Record<string, string> | null;
};

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
  if (!rows.length) return null;

  return (
    <>
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Answers</h2>
          <button
            type="button"
            onClick={onEvaluate}
            disabled={evalLoading}
            className="rounded-lg border border-[var(--accent)] text-[var(--accent)] px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {evalLoading ? "Models are scoring answers…" : "Evaluate answers (cross review)"}
          </button>
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
