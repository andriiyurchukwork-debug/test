export type ViewMode = "matrix" | "byModel";

export type ModelOption = { id: string; label: string };

export type QuestionInputPanelProps = {
  systemPrompt: string;
  onSystemPromptChange: (value: string) => void;
  onResetSystemPrompt: () => void;
  input: string;
  onInputChange: (value: string) => void;
  onExcelFile: (file: File | null) => void;
  onRunCompare: () => void;
  loading: boolean;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  error: string | null;
  models: ModelOption[];
  answerModelIds: string[];
  onToggleAnswerModel: (id: string) => void;
  evaluatorModelIds: string[];
  onToggleEvaluatorModel: (id: string) => void;
};
