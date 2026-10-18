/**
 * Full-screen "loading your score" overlay. Shown by the checklist when the result page is slow,
 * and by the result page while it streams in, so the hand-off between the two looks like one screen.
 */
export function ScoreLoading() {
  return (
    <div
      role="status"
      className="fade-in fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-term/95"
    >
      <span
        className="spinner size-10 rounded-full border-[3px] border-term-green/25 border-t-term-green"
        aria-hidden="true"
      />
      <p className="font-mono text-sm text-term-green">llama_model_load: loading your score…</p>
    </div>
  );
}
