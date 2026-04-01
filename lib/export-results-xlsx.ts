import type { CompareRow } from "@/app/api/compare/route";
import type { EvalMatrix } from "@/app/api/evaluate/route";

function formatTimestampForFilename(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

export async function downloadResultsXlsx(
  rows: CompareRow[],
  modelIds: string[],
  labels: Record<string, string>,
  evalMatrix?: EvalMatrix | null,
  evaluatorLabels?: Record<string, string> | null,
): Promise<void> {
  const XLSX = await import("xlsx");

  const wb = XLSX.utils.book_new();

  const header = ["Question", ...modelIds.map((id) => labels[id] ?? id)];
  const aoa: string[][] = [
    header,
    ...rows.map((row) => [
      row.question,
      ...modelIds.map((id) =>
        row.errors[id] ? `ERROR: ${row.errors[id]}` : (row.answers[id] ?? ""),
      ),
    ]),
  ];
  const wsCompare = XLSX.utils.aoa_to_sheet(aoa);
  wsCompare["!cols"] = [{ wch: 48 }, ...modelIds.map(() => ({ wch: 36 }))];
  XLSX.utils.book_append_sheet(wb, wsCompare, "Comparison");

  if (evalMatrix && evaluatorLabels && Object.keys(evalMatrix).length > 0) {
    const evalAoa: string[][] = [
      ["Reviewer", "Target model", "Summary", "Per-question (score / feedback)", "Raw output"],
    ];
    for (const [evalId, targets] of Object.entries(evalMatrix)) {
      const reviewer = evaluatorLabels[evalId] ?? evalId;
      for (const cell of Object.values(targets)) {
        const perQ =
          cell.perQuestion
            ?.map(
              (pq) =>
                `[${pq.score != null ? `${pq.score}/10` : "—"}] ${pq.question}\n${pq.feedback ?? ""}`,
            )
            .join("\n\n") ?? "";
        const raw = cell.perQuestion?.length ? "" : cell.raw;
        evalAoa.push([reviewer, cell.targetLabel, cell.summary ?? "", perQ, raw]);
      }
    }
    const wsEval = XLSX.utils.aoa_to_sheet(evalAoa);
    wsEval["!cols"] = [{ wch: 22 }, { wch: 28 }, { wch: 40 }, { wch: 56 }, { wch: 48 }];
    XLSX.utils.book_append_sheet(wb, wsEval, "Cross evaluation");
  }

  const base = `ai-shock-results_${formatTimestampForFilename()}`;
  XLSX.writeFile(wb, `${base}.xlsx`);
}
