"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ITEMS, type DetectRule } from "@/data/items";
import { hardwareMatches, totalMemory, type Rig } from "@/lib/rig";
import { formatCode, rigClassFor } from "@/lib/score";
import {
  clearState,
  EMPTY_STATE,
  loadState,
  saveLastResult,
  saveState,
  type DetectSource,
  type SavedState,
} from "@/lib/storage";
import { AskAssistant } from "./AskAssistant";
import { AutofillPanel } from "./AutofillPanel";
import { Joke } from "./Joke";
import { ScoreLoading } from "./ScoreLoading";
import { StatusBar } from "./StatusBar";

const SECRET = "gguf when";

export function Checklist() {
  const router = useRouter();
  const [state, setState] = useState<SavedState>(EMPTY_STATE);
  const stateRef = useRef(state);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(false);
  // "busy" flips on click; the overlay only appears if the result page is slow to arrive.
  const [calculating, setCalculating] = useState<"idle" | "busy" | "overlay">("idle");
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Next.js keeps this page alive (hidden) after navigating to the result, and runs effect
  // cleanups when it hides it. Resetting here means Back never returns to a stuck loader.
  useEffect(
    () => () => {
      clearTimeout(overlayTimer.current);
      setCalculating("idle");
    },
    [],
  );

  function update(fn: (s: SavedState) => SavedState) {
    const next = fn(stateRef.current);
    stateRef.current = next;
    setState(next);
  }

  useEffect(() => {
    const saved = loadState();
    stateRef.current = saved;
    // Restoring from localStorage has to wait until after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(saved);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveState(state);
  }, [state, loaded]);

  // Type "gguf when" anywhere on the page.
  useEffect(() => {
    let typed = "";
    let hide: ReturnType<typeof setTimeout> | undefined;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT"))
        return;
      if (e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-SECRET.length);
      if (typed === SECRET) {
        setToast(true);
        clearTimeout(hide);
        hide = setTimeout(() => setToast(false), 4000);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(hide);
    };
  }, []);

  const checkedSet = new Set(state.checked);
  const rigGb = state.rig && state.rig.devices.length ? totalMemory(state.rig.devices) : null;

  function toggle(id: number) {
    update((s) => ({
      ...s,
      checked: s.checked.includes(id) ? s.checked.filter((x) => x !== id) : [...s.checked, id],
    }));
  }

  /** Ticks every item matching the rules and returns how many were newly ticked. */
  function applyRules(rules: DetectRule[], source: DetectSource): number {
    const ids = ITEMS.filter((item) => item.detect && rules.includes(item.detect)).map((item) => item.id);
    const fresh = ids.filter((id) => !stateRef.current.checked.includes(id));
    update((s) => ({
      ...s,
      checked: [...s.checked, ...fresh],
      detected: { ...s.detected, ...Object.fromEntries(ids.map((id) => [id, s.detected[id] ?? source])) },
    }));
    return fresh.length;
  }

  function changeRig(rig: Rig | null) {
    update((s) => ({ ...s, rig }));
    if (rig) applyRules(hardwareMatches(rig.devices), rig.source === "hf" ? "Hugging Face" : "your rig");
  }

  function reset() {
    if (state.checked.length > 0 && !window.confirm("Clear all your answers and your rig?")) return;
    clearState();
    stateRef.current = EMPTY_STATE;
    setState(EMPTY_STATE);
  }

  function resultCode() {
    const score = state.checked.length;
    return formatCode(score, rigGb !== null ? rigClassFor(rigGb) : null);
  }

  /** Starts loading the result page on hover, focus, or touch, so the click itself feels instant. */
  function prefetchResult() {
    router.prefetch(`/r/${resultCode()}`);
  }

  function calculate() {
    if (calculating !== "idle") return;
    const code = resultCode();
    saveLastResult(code);
    setCalculating("busy");
    overlayTimer.current = setTimeout(() => setCalculating((c) => (c === "busy" ? "overlay" : c)), 300);
    router.push(`/r/${code}`);
  }

  return (
    <>
      <StatusBar checked={state.checked.length} rig={state.rig} />
      <main className="mx-auto w-full max-w-[720px] px-4 pt-8">
        <h1 className="text-4xl font-bold tracking-tight text-accent sm:text-5xl text-balance">
          The Local AI Purity Test
        </h1>
        <p className="mt-3 text-zinc-700">
          The official purity test for people who run open-weight models at home. Tick everything you&apos;ve done.
        </p>
        <p className="mt-2 font-semibold text-zinc-900">
          Caution: This is not a bucket list. Your electricity bill can&apos;t take it.
        </p>

        <AutofillPanel rig={state.rig} onDetected={applyRules} onRigChange={changeRig} />

        <ul className="mt-8">
          {ITEMS.map((item) => {
            const isChecked = checkedSet.has(item.id);
            const source = isChecked ? state.detected[item.id] : undefined;
            return (
              <li key={item.id} className="group">
                <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2.5 hover:bg-zinc-50">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(item.id)}
                    className="mt-1 size-4 shrink-0 accent-accent"
                  />
                  <span className="min-w-0">
                    <span className={isChecked ? "text-zinc-900" : "text-zinc-800"}>
                      {item.id}. {item.text}
                    </span>
                    {source && (
                      <span className="ml-2 inline-block rounded-full bg-green-50 px-2 py-0.5 align-middle text-[11px] font-medium text-accent-dark ring-1 ring-green-200">
                        detected via {source}
                      </span>
                    )}
                    {item.joke && (
                      <span
                        className={`mt-1 text-sm text-zinc-500 italic ${
                          isChecked ? "block" : "hidden group-hover:block group-focus-within:block"
                        }`}
                      >
                        <Joke joke={item.joke} />
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={calculate}
            onPointerEnter={prefetchResult}
            onFocus={prefetchResult}
            onTouchStart={prefetchResult}
            aria-busy={calculating !== "idle"}
            className={`inline-flex items-center gap-2.5 rounded-md px-6 py-3 text-lg font-semibold text-white shadow transition-transform duration-100 active:scale-95 ${
              calculating === "idle" ? "bg-accent hover:bg-accent-dark" : "cursor-progress bg-accent-dark"
            }`}
          >
            {calculating !== "idle" && (
              <span
                className="spinner size-4 rounded-full border-2 border-white/35 border-t-white"
                aria-hidden="true"
              />
            )}
            {calculating === "idle" ? "Calculate My Score" : "Quantizing…"}
          </button>
          <span className="font-mono text-sm text-zinc-600">{state.checked.length} checked</span>
          <button type="button" onClick={reset} className="ml-auto text-sm text-zinc-500 underline hover:text-zinc-800">
            Reset
          </button>
        </div>
      </main>

      <AskAssistant rigGb={rigGb} />

      {calculating === "overlay" && <ScoreLoading />}

      {toast && (
        <div
          role="status"
          className="toast fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-term px-4 py-3 font-mono text-sm text-term-green shadow-xl"
        >
          Soon™. —bartowski, probably
        </div>
      )}
    </>
  );
}
