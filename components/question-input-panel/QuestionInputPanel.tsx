import type { QuestionInputPanelProps, ViewMode } from "./types";

export function QuestionInputPanel({
  systemPrompt,
  onSystemPromptChange,
  onResetSystemPrompt,
  input,
  onInputChange,
  onExcelFile,
  onRunCompare,
  loading,
  view,
  onViewChange,
  error,
  models,
  answerModelIds,
  onToggleAnswerModel,
  evaluatorModelIds,
  onToggleEvaluatorModel,
}: QuestionInputPanelProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-lg shadow-black/20">
      {models.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)]/50 p-4 grid gap-4 md:grid-cols-2 mb-1">
          <fieldset className="space-y-2 min-w-0">
            <legend className="text-sm font-medium text-[var(--foreground)] mb-1">Models that answer</legend>
            <p className="text-xs text-[var(--muted)]">API calls: only checked models generate replies.</p>
            <ul className="flex flex-col gap-1.5">
              {models.map((m) => (
                <li key={m.id}>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={answerModelIds.includes(m.id)}
                      onChange={() => onToggleAnswerModel(m.id)}
                      className="rounded border-[var(--border)]"
                    />
                    <span>{m.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
          <fieldset className="space-y-2 min-w-0">
            <legend className="text-sm font-medium text-[var(--foreground)] mb-1">Models that review</legend>
            <p className="text-xs text-[var(--muted)]">
              Cross evaluation: uncheck all here to skip review costs, or pick who scores others.
            </p>
            <ul className="flex flex-col gap-1.5">
              {models.map((m) => (
                <li key={m.id}>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={evaluatorModelIds.includes(m.id)}
                      onChange={() => onToggleEvaluatorModel(m.id)}
                      className="rounded border-[var(--border)]"
                    />
                    <span>{m.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        </div>
      )}

      <label className="block text-sm font-medium text-[var(--muted)]">Questions (one per line)</label>
      <textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        rows={8}
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

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="block text-sm font-medium text-[var(--muted)]">System prompt</label>
          <button
            type="button"
            onClick={onResetSystemPrompt}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            Reset to default
          </button>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Sent as the system message for each answering model. Leave empty for the built-in default (see API).
        </p>
        <textarea
          value={systemPrompt}
          onChange={(e) => onSystemPromptChange(e.target.value)}
          rows={6}
          spellCheck={false}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[var(--accent)]/40 font-[family-name:var(--font-geist-mono)] max-h-[min(40vh,320px)] overflow-y-auto"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </section>
  );
}
