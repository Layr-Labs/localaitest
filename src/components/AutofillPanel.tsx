"use client";

import { useState } from "react";
import type { DetectRule } from "@/data/items";
import { lookupGitHub, lookupHuggingFace } from "@/lib/detect";
import { DEVICE_GROUPS, DEVICE_OPTIONS, describeRig, totalMemory, type Device, type Rig } from "@/lib/rig";
import { RIG_CLASSES, rigClassFor } from "@/lib/score";
import type { DetectSource } from "@/lib/storage";

type Props = {
  rig: Rig | null;
  onDetected: (rules: DetectRule[], source: DetectSource) => number;
  onRigChange: (rig: Rig | null) => void;
};

type Status = { tone: "ok" | "error"; text: string };

const inputClass =
  "w-full min-w-0 rounded-md border border-zinc-300 bg-white px-2.5 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

function ticked(n: number): string {
  return n === 1 ? "ticked 1 item" : `ticked ${n} items`;
}

export function AutofillPanel({ rig, onDetected, onRigChange }: Props) {
  const [hfUser, setHfUser] = useState("");
  const [ghUser, setGhUser] = useState("");
  const [busy, setBusy] = useState(false);
  const [statuses, setStatuses] = useState<Status[]>([]);

  const [deviceIndex, setDeviceIndex] = useState(0);
  const [mem, setMem] = useState(DEVICE_OPTIONS[0].mem);
  const [count, setCount] = useState(1);
  const option = DEVICE_OPTIONS[deviceIndex];

  async function detect(e: React.FormEvent) {
    e.preventDefault();
    if (!hfUser.trim() && !ghUser.trim()) return;
    setBusy(true);
    setStatuses([]);
    const [hf, gh] = await Promise.all([
      hfUser.trim() ? lookupHuggingFace(hfUser) : null,
      ghUser.trim() ? lookupGitHub(ghUser) : null,
    ]);
    const next: Status[] = [];
    if (hf) {
      const n = onDetected(hf.rules, "Hugging Face");
      if (hf.devices.length) onRigChange({ source: "hf", devices: hf.devices });
      if (hf.error) next.push({ tone: "error", text: `Hugging Face: ${hf.error}` });
      else
        next.push({
          tone: "ok",
          text: `Hugging Face: ${ticked(n)}. ${
            hf.devices.length ? `Found your rig: ${describeRig(hf.devices)}.` : "No hardware listed on your profile, so pick your rig below."
          }`,
        });
    }
    if (gh) {
      const n = onDetected(gh.rules, "GitHub");
      next.push(
        gh.error && n === 0
          ? { tone: "error", text: `GitHub: ${gh.error}` }
          : { tone: "ok", text: `GitHub: ${ticked(n)}.${gh.error ? ` (${gh.error})` : ""}` },
      );
    }
    setStatuses(next);
    setBusy(false);
  }

  function chooseDevice(index: number) {
    setDeviceIndex(index);
    setMem(DEVICE_OPTIONS[index].mem);
  }

  function addDevice() {
    const device: Device = { name: option.name, kind: option.kind, mem, num: Math.min(Math.max(count, 1), 16) };
    onRigChange({ source: "manual", devices: [...(rig?.devices ?? []), device] });
  }

  function removeDevice(index: number) {
    const devices = rig?.devices.filter((_, i) => i !== index) ?? [];
    onRigChange(devices.length ? { source: rig?.source ?? "manual", devices } : null);
  }

  const total = rig ? totalMemory(rig.devices) : 0;

  return (
    <details className="group mt-6 rounded-lg border border-zinc-200 bg-zinc-50 open:bg-white">
      <summary className="cursor-pointer select-none list-none px-4 py-3 font-medium text-zinc-800 flex items-center justify-between">
        <span>⚡ Autofill from your profiles &amp; build your rig card</span>
        <span className="text-xs text-zinc-500 group-open:hidden">optional</span>
      </summary>
      <div className="border-t border-zinc-200 px-4 py-4 space-y-6 text-sm">
        <p className="text-zinc-600">
          🔒 Lookups run in your browser, so we never see your username. Hugging Face and GitHub see the request.
        </p>

        <form onSubmit={detect} className="space-y-3">
          <label className="block">
            <span className="mb-1 block font-medium text-zinc-700">Hugging Face username</span>
            <span className="flex items-center gap-1">
              <span className="font-mono text-xs text-zinc-500 shrink-0">huggingface.co/</span>
              <input
                className={inputClass}
                value={hfUser}
                onChange={(e) => setHfUser(e.target.value)}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="bartowski"
              />
            </span>
          </label>
          <label className="block">
            <span className="mb-1 block font-medium text-zinc-700">GitHub username</span>
            <span className="flex items-center gap-1">
              <span className="font-mono text-xs text-zinc-500 shrink-0">github.com/</span>
              <input
                className={inputClass}
                value={ghUser}
                onChange={(e) => setGhUser(e.target.value)}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="ggerganov"
              />
            </span>
          </label>
          <button
            type="submit"
            disabled={busy || (!hfUser.trim() && !ghUser.trim())}
            className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Detecting…" : "Detect"}
          </button>
          {statuses.length > 0 && (
            <ul className="space-y-1" aria-live="polite">
              {statuses.map((s, i) => (
                <li key={i} className={s.tone === "error" ? "text-red-600" : "text-accent-dark"}>
                  {s.text}
                </li>
              ))}
            </ul>
          )}
        </form>

        <div className="space-y-3">
          <h3 className="font-medium text-zinc-800">Your rig</h3>
          {rig && rig.devices.length > 0 ? (
            <div className="rounded-md border border-zinc-200 p-3 space-y-2">
              <ul className="space-y-1 font-mono text-xs">
                {rig.devices.map((d, i) => (
                  <li key={i} className="flex items-center justify-between gap-2">
                    <span>
                      {d.num}× {d.name} · {d.mem}GB
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDevice(i)}
                      className="text-zinc-400 hover:text-red-600"
                      aria-label={`Remove ${d.name}`}
                    >
                      remove
                    </button>
                  </li>
                ))}
              </ul>
              <p className="font-mono text-sm">
                Total {total}GB → <strong className="text-accent-dark">{RIG_CLASSES[rigClassFor(total)].label}</strong>
              </p>
              <button type="button" onClick={() => onRigChange(null)} className="text-xs text-zinc-500 underline">
                Clear rig
              </button>
            </div>
          ) : (
            <p className="text-zinc-500">No rig yet. Detect it from Hugging Face, or pick it by hand.</p>
          )}

          <div className="flex flex-wrap items-end gap-2">
            <label className="flex-1 min-w-[150px]">
              <span className="mb-1 block text-xs text-zinc-600">Device</span>
              <select className={inputClass} value={deviceIndex} onChange={(e) => chooseDevice(Number(e.target.value))}>
                {DEVICE_GROUPS.map((group) => (
                  <optgroup key={group} label={group}>
                    {DEVICE_OPTIONS.map((o, i) =>
                      o.group === group ? (
                        <option key={o.name} value={i}>
                          {o.name}
                          {o.memOptions ? "" : ` (${o.mem}GB)`}
                        </option>
                      ) : null,
                    )}
                  </optgroup>
                ))}
              </select>
            </label>
            {option.memOptions && (
              <label className="w-24">
                <span className="mb-1 block text-xs text-zinc-600">Memory</span>
                <select className={inputClass} value={mem} onChange={(e) => setMem(Number(e.target.value))}>
                  {option.memOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}GB
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="w-16">
              <span className="mb-1 block text-xs text-zinc-600">How many</span>
              <input
                type="number"
                min={1}
                max={16}
                className={inputClass}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </label>
            <button
              type="button"
              onClick={addDevice}
              className="rounded-md border border-zinc-300 px-3 py-2 font-medium hover:border-zinc-500"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </details>
  );
}
