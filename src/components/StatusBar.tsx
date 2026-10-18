import { RIG_CLASSES, rigClassFor } from "@/lib/score";
import { totalMemory, type Rig } from "@/lib/rig";

const DEFAULT_VRAM_GB = 24;
// The bar overflows once this many items are checked, whatever the rig size.
const ITEMS_TO_FILL = 40;

function Fan({ checked }: { checked: number }) {
  const seconds = Math.max(0.12, 2.4 - checked * 0.03);
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      className={checked > 0 ? "fan" : undefined}
      style={{ animationDuration: `${seconds}s` }}
    >
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      {[0, 120, 240].map((angle) => (
        <path
          key={angle}
          d="M12 10 C10 4, 15 2, 16 6 C16.5 8, 14 10, 12 10 Z"
          fill="currentColor"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  );
}

export function StatusBar({ checked, rig }: { checked: number; rig: Rig | null }) {
  const capacity = rig && rig.devices.length ? totalMemory(rig.devices) : DEFAULT_VRAM_GB;
  const used = (checked * capacity) / ITEMS_TO_FILL;
  const overflow = used > capacity;
  const fill = Math.min(used / capacity, 1) * 100;
  const temp = Math.min(95, Math.round(38 + checked * 0.55));
  const rigLabel = rig && rig.devices.length ? RIG_CLASSES[rigClassFor(capacity)].label : null;

  const gb = (n: number) => (n >= 100 ? n.toFixed(0) : n.toFixed(1));

  return (
    <div className="sticky top-0 z-20 bg-term text-zinc-300 font-mono text-xs sm:text-sm shadow-md">
      <div className="mx-auto max-w-[720px] px-4 py-2 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap justify-between gap-x-3 mb-1">
            <span className={`whitespace-nowrap ${overflow ? "text-red-400" : "text-term-green"}`}>
              VRAM {gb(used)} / {gb(capacity)} GB
            </span>
            <span className={`truncate ${overflow ? "text-red-400" : "text-zinc-500"}`}>
              {overflow ? "offloading to CPU… 0.4 tok/s" : rigLabel ?? "assuming one 24GB card"}
            </span>
          </div>
          <div
            className="h-2 rounded-sm bg-zinc-800 overflow-hidden"
            role="meter"
            aria-label="VRAM used"
            aria-valuemin={0}
            aria-valuemax={capacity}
            aria-valuenow={Math.min(used, capacity)}
          >
            <div
              className={`h-full transition-all duration-300 ${overflow ? "bg-red-500" : "bg-term-green"}`}
              style={{ width: `${fill}%` }}
            />
          </div>
        </div>
        <div className={`flex items-center gap-1.5 shrink-0 ${temp >= 80 ? "text-red-400" : "text-zinc-300"}`}>
          <Fan checked={checked} />
          <span aria-label={`GPU temperature ${temp} degrees`}>{temp}°C</span>
        </div>
      </div>
    </div>
  );
}
