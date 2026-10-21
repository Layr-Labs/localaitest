"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ITEMS, type DetectRule } from "@/data/items";
import { hardwareMatches, totalMemory, type Rig } from "@/lib/rig";
import { RIG_CLASSES, formatCode, rigClassFor } from "@/lib/score";
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
import { Footer } from "./Footer";
import { Joke } from "./Joke";
import { ScoreLoading } from "./ScoreLoading";
import { GpuTemp, StatusBar } from "./StatusBar";

const SECRET = "gguf when";
const VRAM_ITEMS_TO_FILL = 40;
const VRAM_DEFAULT_GB = 24;

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

  function markConnected(provider: "github" | "huggingface", username: string) {
    update((s) => ({ ...s, connected: { ...s.connected, [provider]: username } }));
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

  const checkedCount = state.checked.length;
  const vramCapacity = rigGb !== null ? rigGb : VRAM_DEFAULT_GB;
  const vramUsed = (checkedCount * vramCapacity) / VRAM_ITEMS_TO_FILL;
  const vramOverflow = vramUsed > vramCapacity;
  const vramFill = Math.min(vramUsed / vramCapacity, 1) * 100;
  const vramGb = (n: number) => (n >= 100 ? n.toFixed(0) : n.toFixed(1));
  const vramLabel = state.rig && state.rig.devices.length ? RIG_CLASSES[rigClassFor(vramCapacity)].label : null;

  const calcButton = (extraClass = "") => (
    <button
      type="button"
      onClick={calculate}
      onPointerEnter={prefetchResult}
      onFocus={prefetchResult}
      onTouchStart={prefetchResult}
      aria-busy={calculating !== "idle"}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow transition-transform duration-100 active:scale-95 ${extraClass} ${
        calculating === "idle" ? "bg-accent hover:bg-accent-dark" : "cursor-progress bg-accent-dark"
      }`}
    >
      {calculating !== "idle" && (
        <span className="spinner size-3.5 rounded-full border-2 border-white/35 border-t-white" aria-hidden="true" />
      )}
      {calculating === "idle" ? "Calculate My Score" : "Quantizing…"}
    </button>
  );

  return (
    <>
      {/* Sticky status bar: mobile only */}
      <div className="md:hidden">
        <StatusBar checked={checkedCount} rig={state.rig} />
      </div>

      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-16 md:grid md:grid-cols-[280px_1fr] md:gap-14 lg:grid-cols-[320px_1fr] lg:gap-16 xl:grid-cols-[360px_1fr] xl:gap-20 md:items-start">

          {/* Left rail: desktop / tablet only */}
          <aside className="hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen md:overflow-y-auto md:pt-10 md:pb-6">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-headline font-bold tracking-tight text-accent text-balance leading-tight">
              The Local AI <span className="text-white light:text-black">Purity Test</span>
            </h1>

            {/* VRAM readout */}
            <div className="mt-4 font-mono text-xs">
              <div className="flex justify-between gap-2 mb-1.5">
                <span className={vramOverflow ? "text-red-400" : "text-accent"}>
                  VRAM {vramGb(vramUsed)} / {vramGb(vramCapacity)} GB
                </span>
                <span className={`truncate ${vramOverflow ? "text-red-400" : "text-white/40 light:text-black/40"}`}>
                  {vramOverflow ? "offloading…" : (vramLabel ?? "24 GB card")}
                </span>
              </div>
              <div className="h-1.5 rounded-sm bg-white/10 light:bg-black/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${vramOverflow ? "bg-red-500" : "bg-accent"}`}
                  style={{ width: `${vramFill}%` }}
                />
              </div>
              <div className="mt-2">
                <GpuTemp checked={checkedCount} />
              </div>
            </div>

            <p className="mt-6 text-sm text-white/70 light:text-black/70">
              The official purity test for people who run open-weight models. Tick everything you&apos;ve done.
            </p>
            <p className="mt-2 text-sm font-semibold text-white light:text-black">
              Caution: This is not a bucket list. Your electricity bill can&apos;t take it.
            </p>

            <div className="mt-auto pt-8 flex gap-3">
              {calcButton("flex-1")}
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md border border-white/25 light:border-black/25 px-4 py-2.5 text-sm font-semibold text-white/70 light:text-black/70 hover:border-white/50 light:hover:border-black/50 hover:text-white light:hover:text-black transition-colors"
              >
                Reset
              </button>
            </div>
          </aside>

          {/* Right column */}
          <div className="pt-8 md:pt-10 md:pb-10">
            {/* Mobile header */}
            <div className="md:hidden">
              <h1 className="text-4xl font-headline font-bold tracking-tight text-accent sm:text-5xl text-balance">
                The Local AI <span className="text-white light:text-black">Purity Test</span>
              </h1>
              <p className="mt-3 text-sm text-white/70 light:text-black/70">
                The official purity test for people who run open-weight models. Tick everything you&apos;ve done.
              </p>
              <p className="mt-2 text-sm font-semibold text-white light:text-black">
                Caution: This is not a bucket list. Your electricity bill can&apos;t take it.
              </p>
            </div>

            <AutofillPanel
              rig={state.rig}
              connected={state.connected}
              onDetected={applyRules}
              onRigChange={changeRig}
              onConnected={markConnected}
            />

            <ul className="mt-8">
              {ITEMS.map((item) => {
                const isChecked = checkedSet.has(item.id);
                const source = isChecked ? state.detected[item.id] : undefined;
                return (
                  <li key={item.id} className="group">
                    <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2.5 hover:bg-white/5 light:hover:bg-black/5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(item.id)}
                        className="mt-1 size-4 shrink-0 accent-accent"
                      />
                      <span className="min-w-0">
                        <span className={`text-sm ${isChecked ? "text-white light:text-black" : "text-white/80 light:text-black/80"}`}>
                          {item.id}. {item.text}
                        </span>
                        {source && (
                          <span className="ml-2 inline-block rounded-full bg-accent/10 px-2 py-0.5 align-middle text-[11px] font-medium text-accent ring-1 ring-accent/30">
                            detected via {source}
                          </span>
                        )}
                        {item.joke && (
                          <span
                            className={`mt-1 text-sm text-white/50 light:text-black/50 italic ${
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

            {/* Mobile CTA */}
            <div className="mt-10 flex flex-wrap items-center gap-4 md:hidden">
              {calcButton("")}
              <span className="font-mono text-sm text-white/50 light:text-black/50">{checkedCount} checked</span>
              <button
                type="button"
                onClick={reset}
                className="ml-auto text-sm text-white/50 light:text-black/50 underline hover:text-white light:hover:text-black"
              >
                Reset
              </button>
            </div>

            <Footer fullWidth />
          </div>
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
