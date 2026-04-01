import type { CompareRow } from "@/app/api/compare/route";
import type { EvalMatrix } from "@/app/api/evaluate/route";
import type { ViewMode } from "@/components/question-input-panel";

export type AnswersResultsSectionProps = {
  rows: CompareRow[];
  view: ViewMode;
  modelIds: string[];
  labels: Record<string, string>;
  evalLoading: boolean;
  onEvaluate: () => void;
  evalMatrix: EvalMatrix | null;
  evaluatorLabels: Record<string, string> | null;
};
