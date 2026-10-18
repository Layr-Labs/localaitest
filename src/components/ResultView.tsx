"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { drawCard } from "@/lib/card";
import { RIG_CLASSES, roastFor, shareText, tierFor, TIERS, type RigClass } from "@/lib/score";
import { resultUrl, SITE_DOMAIN } from "@/lib/site";
import { loadLastResult } from "@/lib/storage";

type Props = { code: string; score: number; rig: RigClass | null };

const buttonBase = "inline-flex items-center justify-center rounded-md px-4 py-2.5 font-medium";

function cleanHandle(input: string): string {
  const handle = input.trim().replace(/^@/, "").replace(/[^A-Za-z0-9_]/g, "").slice(0, 15);
  return handle ? `@${handle}` : "";
}

export function ResultView({ code, score, rig }: Props) {
  const tier = tierFor(score);
  const roast = roastFor(score);
  const words = roast.split(" ");
  const finalTierIndex = TIERS.indexOf(tier);
  // Fake but stable generation speed, so the same score always "ran" at the same speed.
  const tokPerSec = (11 + ((score * 37) % 70) / 10).toFixed(1);

  const [mine, setMine] = useState<boolean | null>(null);
  const [tierIndex, setTierIndex] = useState(finalTierIndex);
  const [shownWords, setShownWords] = useState(words.length);
  const [copied, setCopied] = useState(false);
  const [handle, setHandle] = useState("");
  const [shareHint, setShareHint] = useState("");
  const monoRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const isMine = loadLastResult() === code;
    // Both values depend on browser-only state (localStorage, reduced-motion preference).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMine(isMine);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setTierIndex(0);
    setShownWords(0);
  }, [code]);

  useEffect(() => {
    if (tierIndex < finalTierIndex) {
      const t = setTimeout(() => setTierIndex((i) => i + 1), 140);
      return () => clearTimeout(t);
    }
    if (shownWords < words.length) {
      const t = setTimeout(() => setShownWords((n) => n + 1), 70);
      return () => clearTimeout(t);
    }
  }, [tierIndex, finalTierIndex, shownWords, words.length]);

  const generating = tierIndex < finalTierIndex || shownWords < words.length;
  const url = resultUrl(code);
  const intent = `https://x.com/intent/post?text=${encodeURIComponent(shareText(score, rig))}&url=${encodeURIComponent(url)}`;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // The card is pre-rendered so the share sheet can open straight from the click,
  // which mobile browsers require.
  const cardRef = useRef<Blob | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      await document.fonts.ready;
      const fontFamily = monoRef.current ? getComputedStyle(monoRef.current).fontFamily : "monospace";
      const canvas = document.createElement("canvas");
      drawCard(
        canvas,
        { score, tier: tier.name, roast, rigLabel: rig ? RIG_CLASSES[rig].label : null, handle: cleanHandle(handle), domain: SITE_DOMAIN },
        fontFamily,
      );
      canvas.toBlob((blob) => {
        if (!cancelled) cardRef.current = blob;
      }, "image/png");
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [score, tier.name, roast, rig, handle]);

  const fileName = `localaitest-${code}.png`;

  function download() {
    if (!cardRef.current) return;
    const href = URL.createObjectURL(cardRef.current);
    const a = document.createElement("a");
    a.href = href;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(href);
  }

  async function shareOnX() {
    const blob = cardRef.current;
    setShareHint("");
    // Phones: the native share sheet attaches the image itself, so picking X posts it with the text.
    if (blob && window.matchMedia("(pointer: coarse)").matches && navigator.canShare) {
      const file = new File([blob], fileName, { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: `${shareText(score, rig)} ${url}` });
          return;
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
        }
      }
    }
    // Computers: X's share link can't carry a file, so copy the image for the user to paste.
    let imageCopied = false;
    if (blob && typeof ClipboardItem !== "undefined") {
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        imageCopied = true;
      } catch {}
    }
    window.open(intent, "_blank", "noopener,noreferrer");
    setShareHint(
      imageCopied
        ? "Your score image is copied. Paste it into the post with ⌘V (Ctrl+V on Windows)."
        : "Couldn't copy the image. Use Download image and attach it to your post.",
    );
  }

  return (
    <main className="mx-auto w-full max-w-[720px] px-4 pt-12">
      <span ref={monoRef} className="font-mono hidden" aria-hidden="true" />
      {mine === false && (
        <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-lg font-semibold text-zinc-900">
            Your friend runs at <span className="font-mono text-accent-dark">{tier.name}</span>. Are you more quantized?
          </p>
          <Link href="/" className={`${buttonBase} mt-3 bg-accent text-white hover:bg-accent-dark`}>
            Take the test
          </Link>
        </div>
      )}

      <p className="font-mono text-sm text-zinc-500">{mine === false ? "Their Local AI Purity Test score" : "Your Local AI Purity Test score"}</p>
      <div className="mt-2 rounded-xl bg-term p-6 sm:p-8 text-zinc-200 shadow-lg">
        <p className="font-mono text-sm text-term-green">$ localaitest --score</p>
        <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-2">
          <p className="font-mono font-bold text-white leading-none">
            <span className="text-7xl sm:text-8xl">{score}</span>
            <span className="text-2xl text-zinc-500">/100</span>
          </p>
          <p className="font-mono">
            <span className="block text-sm text-zinc-400">running at</span>
            <span className="block text-4xl sm:text-5xl font-bold text-term-green">{TIERS[tierIndex].name}</span>
          </p>
        </div>
        <p className={`mt-6 min-h-[3.5rem] text-lg text-zinc-300 ${generating ? "cursor" : ""}`} aria-live="polite">
          {words.slice(0, shownWords).join(" ")}
        </p>
        <p className="mt-4 font-mono text-xs text-zinc-500">
          {generating ? `generating… ${tokPerSec} tok/s` : `done · ${tokPerSec} tok/s · 0 cloud calls`}
        </p>
        {rig && (
          <div className="mt-5 border-t border-zinc-800 pt-4">
            <span className="inline-block rounded-full border border-term-green px-3 py-1 font-mono text-sm text-term-green">
              {RIG_CLASSES[rig].label}
            </span>
            <p className="mt-2 text-sm text-zinc-400">{RIG_CLASSES[rig].advice}</p>
          </div>
        )}
      </div>

      {mine !== false && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={shareOnX} className={`${buttonBase} bg-zinc-900 text-white hover:bg-zinc-700`}>
              Share on 𝕏
            </button>
            <button type="button" onClick={copyLink} className={`${buttonBase} border border-zinc-300 hover:border-zinc-500`}>
              {copied ? "Copied!" : "Copy link"}
            </button>
            <Link href="/" className={`${buttonBase} border border-zinc-300 hover:border-zinc-500`}>
              Re-quantize
            </Link>
          </div>
          {shareHint && (
            <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-accent-dark ring-1 ring-green-200">
              {shareHint}
            </p>
          )}
          <div className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 p-4">
            <label className="flex-1 min-w-[180px]">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Put your X handle on the image (optional)</span>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@yourhandle"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full rounded-md border border-zinc-300 px-2.5 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </label>
            <button type="button" onClick={download} className={`${buttonBase} bg-accent text-white hover:bg-accent-dark`}>
              Download image
            </button>
            <p className="w-full text-xs text-zinc-500">The image is drawn in your browser. Your handle isn&apos;t sent anywhere.</p>
          </div>
        </div>
      )}
    </main>
  );
}
