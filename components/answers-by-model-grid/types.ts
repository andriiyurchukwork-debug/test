import type { CompareRow } from "@/app/api/compare/route";

export type AnswersByModelGridProps = {
  rows: CompareRow[];
  modelIds: string[];
  labels: Record<string, string>;
};
