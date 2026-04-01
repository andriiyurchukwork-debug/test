import type { EvalMatrix } from "@/app/api/evaluate/route";

export type CrossEvaluationSectionProps = {
  matrix: EvalMatrix;
  evaluatorLabels: Record<string, string>;
};
