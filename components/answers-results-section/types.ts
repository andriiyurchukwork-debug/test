import type { CompareRow } from "@/app/api/compare/route";
import type { EvalMatrix } from "@/app/api/evaluate/route";
import type { ViewMode } from "@/components/question-input-panel";

export type AnswersResultsSectionProps = {
  rows: CompareRow[];
  view: ViewMode;
  /** Columns shown in the comparison table */
  displayModelIds: string[];
  /** All model ids present in the result (for column picker + export) */
  resultModelIds: string[];
  comparisonColumnIds: string[];
  onToggleComparisonColumn: (id: string) => void;
  labels: Record<string, string>;
  evalLoading: boolean;
  onEvaluate: () => void;
  evalMatrix: EvalMatrix | null;
  evaluatorLabels: Record<string, string> | null;
};
