"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RIG_CLASSES, roastFor, shareText, tierFor, TOTAL_ITEMS, youAre, type RigClass } from "@/lib/score";
import { resultUrl } from "@/lib/site";
import { loadLastResult } from "@/lib/storage";
import { TierLadder } from "./TierLadder";

type Props = { code: string; score: number; rig: RigClass | null };

const buttonBase = "inline-flex items-center justify-center rounded-md px-4 py-2.5 font-medium";

export function ResultView({ code, score, rig }: Props) {
  const tier = tierFor(score);
  const roast = roastFor(score);
  const words = roast.split(" ");
  // Fake but stable generation speed, so the same score always "ran" at the same speed.
  const tokPerSec = (11 + ((score * 37) % 70) / 10).toFixed(1);
  // The same image the link preview uses, so the page, the download, and the post always match.
  const cardSrc = `/r/${code}/opengraph-image`;

  const [mine, setMine] = useState<boolean | null>(null);
  const [shownWords, setShownWords] = useState(words.length);
  const [copied, setCopied] = useState(false);
  const [shareHint, setShareHint] = useState("");
  const cardRef = useRef<Blob | null>(null);

  useEffect(() => {
    const isMine = loadLastResult() === code;
    // Both values depend on browser-only state (localStorage, reduced-motion preference).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMine(isMine);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShownWords(0);
  }, [code]);

  useEffect(() => {
    if (shownWords >= words.length) return;
    const t = setTimeout(() => setShownWords((n) => n + 1), 70);
    return () => clearTimeout(t);
  }, [shownWords, words.length]);

  // Fetch the card once up front, so the share sheet can open straight from the click,
  // which mobile browsers require.
  useEffect(() => {
    let cancelled = false;
    fetch(cardSrc)
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (!cancelled) cardRef.current = blob;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [cardSrc]);

  const generating = shownWords < words.length;
  const url = resultUrl(code);
  const intent = `https://x.com/intent/post?text=${encodeURIComponent(shareText(score))}&url=${encodeURIComponent(url)}`;
  const fileName = `localaitest-${code}.png`;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
          await navigator.share({ files: [file], text: `${shareText(score)} ${url}` });
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
        ? "Your card is copied. Paste it into the post with ⌘V (Ctrl+V on Windows)."
        : "Couldn't copy the image. Use Download image and attach it to your post.",
    );
  }

  return (
    <main className="mx-auto w-full max-w-[720px] px-4 pt-10">
      {mine === false && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-lg font-semibold text-zinc-900">
            Your friend is {tier.article ? `${tier.article} ` : ""}
            {tier.rank}. Are you more local?
          </p>
          <Link href="/" className={`${buttonBase} mt-3 bg-accent text-white hover:bg-accent-dark`}>
            Take the test
          </Link>
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cardSrc}
        alt={`${youAre(tier)}. ${score} out of ${TOTAL_ITEMS} on the Local AI Purity Test.`}
        width={1200}
        height={630}
        className="aspect-[1200/630] w-full rounded-2xl shadow-lg"
        style={{ backgroundColor: tier.level === 8 ? "#0a0a0a" : tier.color }}
      />

      <p className={`mt-5 min-h-[3.5rem] text-lg text-zinc-700 ${generating ? "cursor" : ""}`} aria-live="polite">
        {words.slice(0, shownWords).join(" ")}
      </p>
      <p className="mt-1 font-mono text-xs text-zinc-400">
        {generating ? `generating… ${tokPerSec} tok/s` : `done · ${tokPerSec} tok/s · 0 cloud calls`}
      </p>

      {rig && (
        <p className="mt-4 text-sm text-zinc-600">
          <span className="mr-2 inline-block rounded-full border border-zinc-300 px-2.5 py-0.5 font-mono text-xs text-zinc-800">
            {RIG_CLASSES[rig].label}
          </span>
          {RIG_CLASSES[rig].advice}
        </p>
      )}

      {mine !== false && (
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={shareOnX}
              className={`${buttonBase} bg-zinc-900 text-white hover:bg-zinc-700`}
            >
              Share on 𝕏
            </button>
            <button
              type="button"
              onClick={download}
              className={`${buttonBase} border border-zinc-300 hover:border-zinc-500`}
            >
              Download image
            </button>
            <button
              type="button"
              onClick={copyLink}
              className={`${buttonBase} border border-zinc-300 hover:border-zinc-500`}
            >
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
        </div>
      )}

      <section aria-labelledby="tiers-heading" className="mt-10 rounded-lg border border-zinc-200 p-4 sm:p-5">
        <h2 id="tiers-heading" className="mb-3 text-sm font-semibold text-zinc-900">
          Scoring reference
        </h2>
        <TierLadder score={score} />
      </section>
    </main>
  );
}
