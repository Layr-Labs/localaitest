import { RIG_CLASSES, rigClassFor } from "@/lib/score";
import { totalMemory, type Rig } from "@/lib/rig";

const DEFAULT_VRAM_GB = 24;
// The bar overflows once this many items are checked, whatever the rig size.
const ITEMS_TO_FILL = 40;


export function StatusBar({ checked, rig }: { checked: number; rig: Rig | null }) {
  const capacity = rig && rig.devices.length ? totalMemory(rig.devices) : DEFAULT_VRAM_GB;
  const used = (checked * capacity) / ITEMS_TO_FILL;
  const overflow = used > capacity;
  const fill = Math.min(used / capacity, 1) * 100;
  const rigLabel = rig && rig.devices.length ? RIG_CLASSES[rigClassFor(capacity)].label : null;

  const gb = (n: number) => (n >= 100 ? n.toFixed(0) : n.toFixed(1));

  return (
    <div className="sticky top-0 z-20 bg-term text-white/70 font-mono text-xs sm:text-sm shadow-md">
      <div className="mx-auto max-w-[720px] px-4 py-2 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap justify-between gap-x-3 mb-1">
            <span className={`whitespace-nowrap ${overflow ? "text-red-400" : "text-white"}`}>
              VRAM {gb(used)} / {gb(capacity)} GB
            </span>
            <span className={`truncate ${overflow ? "text-red-400" : "text-white/40 light:text-black/40"}`}>
              {overflow ? "offloading to CPU… 0.4 tok/s" : (rigLabel ?? "assuming one 24GB card")}
            </span>
          </div>
          <div
            className="h-2 rounded-sm bg-white/10 light:bg-black/10 overflow-hidden"
            role="meter"
            aria-label="VRAM used"
            aria-valuemin={0}
            aria-valuemax={capacity}
            aria-valuenow={Math.min(used, capacity)}
          >
            <div
              className={`h-full transition-all duration-300 ${overflow ? "bg-red-500" : "bg-white"}`}
              style={{ width: `${fill}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
