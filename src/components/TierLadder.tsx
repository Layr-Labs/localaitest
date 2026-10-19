import { TIERS } from "@/lib/score";

/**
 * The scoring reference: every rank from Curious to Legend. God Mode stays a mystery row
 * until you unlock it. Pass `score` to highlight the reader's tier.
 */
export function TierLadder({ score, dark = false }: { score?: number; dark?: boolean }) {
  const muted = "text-zinc-500";
  return (
    <div className="font-mono text-sm">
      <p className={`mb-1.5 flex justify-between text-xs ${muted}`}>
        <span>rank</span>
        <span>score</span>
      </p>
      <ol className="space-y-0.5">
        {TIERS.map((tier) => {
          const mine = score !== undefined && score >= tier.min && score <= tier.max;
          const hidden = tier.card === "god" && !mine;
          const row = mine
            ? dark
              ? "bg-term-green/15 text-term-green ring-1 ring-term-green/40"
              : "bg-green-50 text-accent-dark ring-1 ring-green-200"
            : dark
              ? "text-zinc-400"
              : "text-zinc-600";
          return (
            <li
              key={tier.name}
              className={`flex items-center gap-3 rounded-md px-2.5 py-1.5 ${row}`}
              aria-current={mine ? "true" : undefined}
            >
              <span className="w-16 shrink-0 font-semibold">{hidden ? "???" : tier.name}</span>
              <span className="min-w-0 flex-1 truncate font-sans">
                {hidden ? "???" : tier.rank}
                {mine && <span className="ml-2 font-mono text-xs">← you</span>}
              </span>
              <span className="shrink-0 tabular-nums">
                {tier.min === tier.max ? tier.min : `${tier.min}–${tier.max}`}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
