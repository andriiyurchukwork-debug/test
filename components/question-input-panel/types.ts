export type ViewMode = "matrix" | "byModel";

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
};
