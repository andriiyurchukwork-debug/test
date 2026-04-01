"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CompareRow } from "./api/compare/route";
import type { EvalMatrix } from "./api/evaluate/route";
import { AnswersResultsSection } from "@/components/answers-results-section";
import { HomeHeader } from "@/components/home-header";
import { QuestionInputPanel } from "@/components/question-input-panel";
import type { ViewMode } from "@/components/question-input-panel";
import { WELLBEING_ASSISTANT_SYSTEM_PROMPT } from "@/lib/system-prompt";

type ModelInfo = { id: string; label: string };

export default function Home() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [answerModelIds, setAnswerModelIds] = useState<string[]>([]);
  const [evaluatorModelIds, setEvaluatorModelIds] = useState<string[]>([]);
  const modelsHydrated = useRef(false);

  const [systemPrompt, setSystemPrompt] = useState(WELLBEING_ASSISTANT_SYSTEM_PROMPT);
  const [input, setInput] = useState("");
  const [view, setView] = useState<ViewMode>("matrix");
  const [loading, setLoading] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [rows, setRows] = useState<CompareRow[] | null>(null);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [activeModelIds, setActiveModelIds] = useState<string[] | null>(null);
  const [evalMatrix, setEvalMatrix] = useState<EvalMatrix | null>(null);
  const [evaluatorLabels, setEvaluatorLabels] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comparisonColumnIds, setComparisonColumnIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((d) => setModels(d.models ?? []))
      .catch(() => setModels([]));
  }, []);

  useEffect(() => {
    if (!models.length || modelsHydrated.current) return;
    const ids = models.map((m) => m.id);
    setAnswerModelIds(ids);
    setEvaluatorModelIds(ids);
    modelsHydrated.current = true;
  }, [models]);

  const toggleAnswerModel = useCallback((id: string) => {
    setAnswerModelIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleEvaluatorModel = useCallback((id: string) => {
    setEvaluatorModelIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const idsOrdered = useMemo(() => {
    const fromLabels = Object.keys(labels);
    const mid = activeModelIds ?? answerModelIds;
    if (fromLabels.length) {
      const filtered = mid.filter((id) => fromLabels.includes(id));
      return filtered.length ? filtered : fromLabels;
    }
    return mid;
  }, [labels, activeModelIds, answerModelIds]);

  const toggleComparisonColumn = useCallback(
    (id: string) => {
      setComparisonColumnIds((prev) => {
        const base = idsOrdered;
        const effective = prev.filter((x) => base.includes(x));
        const next = effective.includes(id) ? effective.filter((x) => x !== id) : [...effective, id];
        const filtered = next.filter((x) => base.includes(x));
        if (filtered.length === 0) return base;
        return filtered;
      });
    },
    [idsOrdered],
  );

  const displayModelIds = useMemo(() => {
    const base = idsOrdered;
    const picked = comparisonColumnIds.filter((id) => base.includes(id));
    return picked.length > 0 ? picked : base;
  }, [idsOrdered, comparisonColumnIds]);

  const parseQuestions = useCallback((): string[] => {
    return input
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  }, [input]);

  const onExcelFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const matrix = XLSX.utils.sheet_to_json<(string | number | undefined)[]>(sheet, {
        header: 1,
        defval: "",
      });
      const qs = matrix
        .map((row) => String(row[0] ?? "").trim())
        .filter((s) => s.length > 0);
      if (!qs.length) {
        setError("No text found in the first column of the spreadsheet");
        return;
      }
      setInput(qs.join("\n"));
    } catch {
      setError("Could not read the Excel file");
    }
  };

  const runCompare = async () => {
    const questions = parseQuestions();
    setError(null);
    if (questions.length < 1) {
      setError("Add at least one question (one per line) or upload an .xlsx file");
      return;
    }
    if (questions.length > 20) {
      setError("Maximum 20 questions");
      return;
    }
    const answerIds = answerModelIds.filter((id) => models.some((m) => m.id === id));
    if (answerIds.length < 1) {
      setError("Select at least one model to answer");
      return;
    }
    setLoading(true);
    setEvalMatrix(null);
    setEvaluatorLabels(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions,
          modelIds: answerIds,
          systemPrompt: systemPrompt.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }
      setRows(data.rows);
      setLabels(data.modelLabels ?? {});
      setActiveModelIds(data.modelIds ?? null);
      setComparisonColumnIds((prev) => {
        const base = (data.modelIds as string[]) ?? [];
        const picked = prev.filter((id) => base.includes(id));
        return picked.length > 0 ? picked : base;
      });
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const runEvaluate = async () => {
    if (!rows?.length) return;
    setError(null);
    const answerIds = answerModelIds.filter((id) => models.some((m) => m.id === id));
    const evalIds = evaluatorModelIds.filter((id) => models.some((m) => m.id === id));
    if (evalIds.length < 1) {
      setError("Select at least one model to run cross evaluation");
      return;
    }
    const hasPair = evalIds.some((eid) => answerIds.some((tid) => tid !== eid));
    if (!hasPair) {
      setError("Cross evaluation needs an evaluator and at least one other model with answers to score");
      return;
    }
    setEvalLoading(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows,
          answerModelIds: answerIds,
          evaluatorModelIds: evalIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Evaluation failed");
        return;
      }
      setEvalMatrix(data.matrix);
      setEvaluatorLabels(data.evaluatorLabels ?? null);
    } catch {
      setError("Network error during evaluation");
    } finally {
      setEvalLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-10 space-y-10">
      <HomeHeader />

      <QuestionInputPanel
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        onResetSystemPrompt={() => setSystemPrompt(WELLBEING_ASSISTANT_SYSTEM_PROMPT)}
        input={input}
        onInputChange={setInput}
        onExcelFile={onExcelFile}
        onRunCompare={runCompare}
        loading={loading}
        view={view}
        onViewChange={setView}
        error={error}
        models={models}
        answerModelIds={answerModelIds}
        onToggleAnswerModel={toggleAnswerModel}
        evaluatorModelIds={evaluatorModelIds}
        onToggleEvaluatorModel={toggleEvaluatorModel}
      />

      {rows && (
        <AnswersResultsSection
          rows={rows}
          view={view}
          displayModelIds={displayModelIds}
          resultModelIds={idsOrdered}
          comparisonColumnIds={comparisonColumnIds}
          onToggleComparisonColumn={toggleComparisonColumn}
          labels={labels}
          evalLoading={evalLoading}
          onEvaluate={runEvaluate}
          evalMatrix={evalMatrix}
          evaluatorLabels={evaluatorLabels}
        />
      )}
    </div>
  );
}
