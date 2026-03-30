import type { ViewMode } from "./types";

type QuestionInputPanelProps = {
  input: string;
  onInputChange: (value: string) => void;
  onExcelFile: (file: File | null) => void;
  onRunCompare: () => void;
  loading: boolean;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  error: string | null;
};

export function QuestionInputPanel({
  input,
  onInputChange,
  onExcelFile,
  onRunCompare,
  loading,
  view,
  onViewChange,
  error,
}: QuestionInputPanelProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-lg shadow-black/20">
      <label className="block text-sm font-medium text-[var(--muted)]">Questions (one per line)</label>
      <textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        rows={10}
        placeholder={"e.g.\nWhat is RAG in the LLM context?\nHow do you reduce hallucinations?"}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/40 font-[family-name:var(--font-geist-mono)]"
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-[var(--muted)] cursor-pointer inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 hover:bg-white/5">
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => onExcelFile(e.target.files?.[0] ?? null)}
          />
          Import Excel
        </label>
        <button
          type="button"
          onClick={onRunCompare}
          disabled={loading}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Calling models…" : "Run comparison"}
        </button>
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <span>Table layout:</span>
          <select
            value={view}
            onChange={(e) => onViewChange(e.target.value as ViewMode)}
            className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1"
          >
            <option value="matrix">Single wide table</option>
            <option value="byModel">One table per model</option>
          </select>
        </div>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </section>
  );
}
