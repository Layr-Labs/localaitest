"use client";

import { useEffect, useRef, useState } from "react";

const MODEL = "ai-assistant-405B-Q4_K_M.gguf";

function logLines(haveGb: number, needGb: number): string[] {
  return [
    `$ ./llama-cli -m ${MODEL}`,
    `llama_model_load: loading model '${MODEL}'`,
    `llama_model_load: model size = ${needGb.toFixed(2)} GiB`,
    `ggml_cuda_init: found 1 device with ${haveGb.toFixed(2)} GiB free`,
    `alloc_buffer: allocating ${needGb.toFixed(2)} GiB on device 0... failed`,
    "CUDA error: out of memory",
  ];
}

export function AskAssistant({ rigGb }: { rigGb: number | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState(0);
  const [cloud, setCloud] = useState(false);

  const haveGb = rigGb ?? 24;
  const needGb = Math.max(243.1, haveGb * 1.7);
  const lines = logLines(haveGb, needGb);
  const done = shown >= lines.length;

  useEffect(() => {
    if (shown === 0 || done) return;
    const timer = setTimeout(() => setShown((n) => n + 1), 320);
    return () => clearTimeout(timer);
  }, [shown, done]);

  function open() {
    setCloud(false);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setShown(reduced ? lines.length : 1);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="fixed bottom-4 right-4 z-30 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Ask an AI Assistant ✨
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="ask-title"
        className="m-auto w-[min(92vw,620px)] rounded-xl bg-term p-0 text-zinc-200 shadow-2xl"
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 font-mono text-xs text-zinc-500">
          <span>~/models — llama-cli</span>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="rounded px-2 py-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="p-5">
          {cloud ? (
            <div className="py-6">
              <h2 id="ask-title" className="text-2xl font-bold text-white">
                Bruh.
              </h2>
              <p className="mt-3 text-lg text-zinc-300">Not your weights, not your answers.</p>
            </div>
          ) : (
            <>
              <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-relaxed sm:text-sm" aria-live="polite">
                {lines.slice(0, shown).map((line, i) => (
                  <div key={i} className={line.startsWith("CUDA error") ? "text-red-400" : i === 0 ? "text-term-green" : ""}>
                    {line}
                  </div>
                ))}
                {!done && <span className="cursor" />}
              </pre>
              {done && (
                <div className="mt-5">
                  <h2 id="ask-title" className="text-2xl font-bold text-white">
                    Bruh.
                  </h2>
                  <p className="mt-2 text-lg text-zinc-300">
                    {rigGb === null
                      ? "You don't have the VRAM for this."
                      : `You have ${haveGb.toFixed(0)}GB. This needs ${needGb.toFixed(0)}GB. Go buy another 3090.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCloud(true)}
                    className="mt-5 rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
                  >
                    Ask ChatGPT instead
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
