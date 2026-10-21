"use client";

import { useEffect, useRef, useState } from "react";
import type { DetectRule } from "@/data/items";
import { lookupGitHubConnected, lookupHuggingFace } from "@/lib/detect";
import {
  connectGitHub,
  connectHuggingFace,
  finishConnect,
  huggingFaceConfigured,
  revokeGitHubToken,
} from "@/lib/oauth";
import { DEVICE_GROUPS, DEVICE_OPTIONS, describeRig, totalMemory, type Device, type Rig } from "@/lib/rig";
import { RIG_CLASSES, rigClassFor } from "@/lib/score";
import type { DetectSource, SavedState } from "@/lib/storage";

type Provider = "github" | "huggingface";

type Props = {
  rig: Rig | null;
  connected: SavedState["connected"];
  onDetected: (rules: DetectRule[], source: DetectSource) => number;
  onRigChange: (rig: Rig | null) => void;
  onConnected: (provider: Provider, username: string) => void;
};

type Status = { tone: "ok" | "error"; text: string };

const inputClass =
  "w-full min-w-0 h-10 rounded-md border border-white/20 light:border-black/20 bg-white/10 light:bg-black/5 px-3 text-sm text-white light:text-black focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";
const selectClass = `${inputClass} appearance-none pr-10`;

function Chevron() {
  return (
    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 light:text-black/40" aria-hidden="true">
      <svg viewBox="0 0 10 6" width="10" height="6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 1l4 4 4-4" />
      </svg>
    </span>
  );
}

function ticked(n: number): string {
  return n === 1 ? "ticked 1 item" : `ticked ${n} items`;
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function HuggingFaceMark() {
  // Hugging Face's official logo, from huggingface.co/front/assets.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brands/huggingface.svg" alt="" width={17} height={16} aria-hidden="true" />;
}

function Check() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ConnectButton({
  label,
  icon,
  username,
  busy,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  username?: string;
  busy: boolean;
  onClick: () => void;
}) {
  const base = "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium";
  if (username) {
    return (
      <span className={`${base} border-accent/40 bg-accent/10 text-accent light:text-accent`} title={`Connected as @${username}`}>
        {icon}
        <span className="max-w-[10rem] truncate">@{username}</span>
        <Check />
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`${base} border-white/20 light:border-black/20 bg-white/5 light:bg-black/5 text-white light:text-black transition hover:border-white/40 light:hover:border-black/40 hover:bg-white/10 light:hover:bg-black/5 active:scale-[0.98] disabled:cursor-progress disabled:opacity-60`}
    >
      {busy ? (
        <span className="spinner size-3.5 rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
      ) : (
        icon
      )}
      {busy ? (
        "Connecting…"
      ) : (
        <span>
          {/* On phones the panel's subtitle already says "Connect", so the buttons fit on one row. */}
          <span className="hidden sm:inline">Connect </span>
          {label}
        </span>
      )}
    </button>
  );
}

export function AutofillPanel({ rig, connected, onDetected, onRigChange, onConnected }: Props) {
  const [busy, setBusy] = useState<Provider | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const finishing = useRef(false);

  const [deviceIndex, setDeviceIndex] = useState(0);
  const [mem, setMem] = useState(DEVICE_OPTIONS[0].mem);
  const [count, setCount] = useState(1);
  const option = DEVICE_OPTIONS[deviceIndex];

  // When Hugging Face or GitHub sends the browser back here, finish the login and autofill.
  useEffect(() => {
    if (finishing.current) return;
    finishing.current = true;
    (async () => {
      const result = await finishConnect();
      if (!result) return;
      if ("error" in result) {
        setStatuses([{ tone: "error", text: result.error }]);
        return;
      }
      setBusy(result.provider);
      if (result.provider === "huggingface") {
        const hf = await lookupHuggingFace(result.username);
        const n = onDetected(hf.rules, "Hugging Face");
        if (hf.devices.length) onRigChange({ source: "hf", devices: hf.devices });
        onConnected("huggingface", result.username);
        setStatuses([
          hf.error
            ? { tone: "error", text: `Hugging Face: ${hf.error}` }
            : {
                tone: "ok",
                text: `Hugging Face ${ticked(n)}. ${
                  hf.devices.length
                    ? `Found your rig: ${describeRig(hf.devices)}.`
                    : "No hardware on your profile, so pick your rig below."
                }`,
              },
        ]);
      } else {
        const gh = await lookupGitHubConnected(result.token);
        revokeGitHubToken(result.token);
        const n = onDetected(gh.rules, "GitHub");
        if (gh.username) onConnected("github", gh.username);
        setStatuses([
          gh.error && n === 0
            ? { tone: "error", text: `GitHub: ${gh.error}` }
            : { tone: "ok", text: `GitHub ${ticked(n)}.` },
        ]);
      }
      setBusy(null);
    })();
  }, [onConnected, onDetected, onRigChange]);

  function startHuggingFace() {
    if (!huggingFaceConfigured()) {
      setStatuses([{ tone: "error", text: "Hugging Face connect isn't set up yet." }]);
      return;
    }
    setBusy("huggingface");
    connectHuggingFace();
  }

  function startGitHub() {
    setBusy("github");
    connectGitHub();
  }

  function chooseDevice(index: number) {
    setDeviceIndex(index);
    setMem(DEVICE_OPTIONS[index].mem);
  }

  function addDevice() {
    const device: Device = { name: option.name, kind: option.kind, mem, num: Math.min(Math.max(count, 1), 64) };
    onRigChange({ source: "manual", devices: [...(rig?.devices ?? []), device] });
  }

  function removeDevice(index: number) {
    const devices = rig?.devices.filter((_, i) => i !== index) ?? [];
    onRigChange(devices.length ? { source: rig?.source ?? "manual", devices } : null);
  }

  const total = rig ? totalMemory(rig.devices) : 0;

  return (
    <section
      aria-labelledby="autofill-heading"
      className="mt-6 rounded-xl border border-white/10 light:border-black/10 bg-white/5 light:bg-black/5 p-4"
    >
      <h2 id="autofill-heading" className="text-sm font-semibold text-white light:text-black">
        Autofill your answers
      </h2>
      <p className="mt-0.5 text-sm text-white/50 light:text-black/50">Connect an account and we&apos;ll tick what we can prove.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <ConnectButton
          label="GitHub"
          icon={<GitHubMark />}
          username={connected.github}
          busy={busy === "github"}
          onClick={startGitHub}
        />
        <ConnectButton
          label="Hugging Face"
          icon={<HuggingFaceMark />}
          username={connected.huggingface}
          busy={busy === "huggingface"}
          onClick={startHuggingFace}
        />
      </div>

      {statuses.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm" aria-live="polite">
          {statuses.map((s, i) => (
            <li key={i} className={s.tone === "error" ? "text-red-400" : "text-accent"}>
              {s.text}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-xs text-white/50 light:text-black/50">
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        We only read your public profile and don&apos;t keep anything ourselves. Your answers stay in your browser.
      </p>

      <div className="mt-4 space-y-3 border-t border-white/10 light:border-black/10 pt-4 text-sm">
        <h3 className="font-medium text-white light:text-black">Your rig</h3>
        {rig && rig.devices.length > 0 ? (
          <div className="rounded-md border border-white/10 light:border-black/10 p-3 space-y-2">
            <ul className="space-y-1 font-mono text-xs">
              {rig.devices.map((d, i) => (
                <li key={i} className="flex items-center justify-between gap-2">
                  <span>
                    {d.num}× {d.name} · {d.mem}GB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDevice(i)}
                    className="text-white/40 light:text-black/40 hover:text-red-400"
                    aria-label={`Remove ${d.name}`}
                  >
                    remove
                  </button>
                </li>
              ))}
            </ul>
            <p className="font-mono text-sm">
              Total {total}GB → <strong className="text-accent">{RIG_CLASSES[rigClassFor(total)].label}</strong>
            </p>
            <button type="button" onClick={() => onRigChange(null)} className="text-xs text-white/50 light:text-black/50 underline">
              Clear rig
            </button>
          </div>
        ) : (
          <p className="text-white/50 light:text-black/50">No rig yet. Connect Hugging Face to fill it in or pick it by hand.</p>
        )}

        <div className="flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[150px] max-w-xs">
            <span className="mb-1 block text-xs text-white/60 light:text-black/60">Device</span>
            <div className="relative">
              <select className={selectClass} value={deviceIndex} onChange={(e) => chooseDevice(Number(e.target.value))}>
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
              <Chevron />
            </div>
          </label>
          {option.memOptions && (
            <label className="w-24">
              <span className="mb-1 block text-xs text-white/60 light:text-black/60">Memory</span>
              <div className="relative">
                <select className={selectClass} value={mem} onChange={(e) => setMem(Number(e.target.value))}>
                  {option.memOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}GB
                    </option>
                  ))}
                </select>
                <Chevron />
              </div>
            </label>
          )}
          <label className="w-16">
            <span className="mb-1 block text-xs text-white/60 light:text-black/60">How many</span>
            <input
              type="number"
              min={1}
              max={64}
              className={inputClass}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </label>
          <button
            type="button"
            onClick={addDevice}
            className="rounded-md border border-white/20 light:border-black/20 px-3 py-2 font-medium text-white light:text-black hover:border-white/50 light:hover:border-black/40"
          >
            Add
          </button>
        </div>
      </div>
    </section>
  );
}
