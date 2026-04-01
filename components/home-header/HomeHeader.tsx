export function HomeHeader() {
  return (
    <header className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">AI Shock Tester</h1>
      <p className="text-[var(--muted)] max-w-2xl text-sm leading-relaxed">
        Enter 5–10 questions (one per line) or upload Excel — the first column is treated as the question list. Five models answer each
        question; then you can run cross-model evaluation.
      </p>
    </header>
  );
}
