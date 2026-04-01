import type { CompareRow } from "@/app/api/compare/route";

export type AnswersMatrixTableProps = {
  rows: CompareRow[];
  modelIds: string[];
  labels: Record<string, string>;
};
