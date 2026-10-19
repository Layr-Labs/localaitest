import type { Rig } from "./rig";

export type DetectSource = "Hugging Face" | "GitHub" | "your rig";

export type SavedState = {
  checked: number[];
  detected: Record<number, DetectSource>;
  rig: Rig | null;
  /** Usernames of connected accounts, shown in the autofill panel. Kept on this device only. */
  connected: { github?: string; huggingface?: string };
};

const STATE_KEY = "localaitest:v1";
const LAST_RESULT_KEY = "localaitest:last";

export const EMPTY_STATE: SavedState = { checked: [], detected: {}, rig: null, connected: {} };

export function loadState(): SavedState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    return {
      checked: Array.isArray(parsed.checked) ? parsed.checked.filter(Number.isInteger) : [],
      detected: parsed.detected && typeof parsed.detected === "object" ? parsed.detected : {},
      rig: parsed.rig && Array.isArray(parsed.rig.devices) ? parsed.rig : null,
      connected: parsed.connected && typeof parsed.connected === "object" ? parsed.connected : {},
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveState(state: SavedState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or full storage: the test still works, it just won't survive a reload.
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STATE_KEY);
    localStorage.removeItem(LAST_RESULT_KEY);
  } catch {}
}

/** Remembers which result this browser produced, so a shared link opened by a friend looks different. */
export function saveLastResult(code: string): void {
  try {
    localStorage.setItem(LAST_RESULT_KEY, code);
  } catch {}
}

export function loadLastResult(): string | null {
  try {
    return localStorage.getItem(LAST_RESULT_KEY);
  } catch {
    return null;
  }
}
