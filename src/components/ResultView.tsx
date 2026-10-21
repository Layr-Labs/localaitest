"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  RIG_CLASSES,
  shareText,
  theyAre,
  tierFor,
  youAre,
  type RigClass,
} from "@/lib/score";
import { resultUrl } from "@/lib/site";
import { loadLastResult } from "@/lib/storage";

type Props = { code: string; score: number; rig: RigClass | null };

const buttonBase = "inline-flex items-center justify-center rounded-md px-4 py-2.5 font-medium";

function videoSrcFor(score: number, rank: string): string {
  if (score === 0) return "/cards/score-zero.mp4";
  return `/cards/${rank.toLowerCase().replace(" ", "-")}.mp4`;
}

function frameSrcFor(score: number, rank: string): string {
  if (score === 0) return "/cards/frames/score-zero.png";
  return `/cards/frames/${rank.toLowerCase().replace(" ", "-")}.png`;
}

function ScoreReveal({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(eased * score));
      setBarWidth(eased * score);
      if (t < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-7xl font-headline font-bold text-accent tabular-nums leading-none">{displayed}</span>
        <span className="text-2xl text-white/40 light:text-black/40 font-mono">/100</span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-white/10 light:bg-black/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${barWidth}%`, transition: "none" }}
        />
      </div>
    </div>
  );
}

export function ResultView({ code, score, rig }: Props) {
  const tier = tierFor(score);
  const videoSrc = videoSrcFor(score, tier.rank);
  const frameSrc = frameSrcFor(score, tier.rank);
  const videoBlobRef = useRef<Blob | null>(null);
  const cardBlobRef = useRef<Blob | null>(null);

  const [mine, setMine] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareHint, setShareHint] = useState("");
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    // Both read the browser, so they have to wait until after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMine(loadLastResult() === code);
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, [code]);

  // Pre-fetch video and card frame so sharing feels instant.
  useEffect(() => {
    let cancelled = false;
    fetch(videoSrc)
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => { if (!cancelled) videoBlobRef.current = blob; })
      .catch(() => {});
    fetch(frameSrc)
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => { if (!cancelled) cardBlobRef.current = blob; })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [videoSrc, frameSrc]);

  const url = resultUrl(code);
  const fileName = `localaitest-${tier.rank.toLowerCase().replace(" ", "-")}-${score}.mp4`;
  const intent = `https://x.com/intent/post?text=${encodeURIComponent(`${shareText(score)} ${url}`)}`;

  async function shareOnX() {
    setShareHint("");
    // Mobile: share the card image via the native share sheet.
    const blob = cardBlobRef.current;
    if (blob && touch && navigator.canShare) {
      const file = new File([blob], `localaitest-${score}.png`, { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: `${shareText(score)} ${url}` });
          return;
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
        }
      }
    }
    // Desktop: copy the card to clipboard then open X so the user can paste it.
    let imageCopied = false;
    if (blob && typeof ClipboardItem !== "undefined") {
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        imageCopied = true;
      } catch {}
    }
    window.open(intent, "_blank", "noopener,noreferrer");
    if (imageCopied) setShareHint("Card copied. Paste it into the post with ⌘V (Ctrl+V on Windows).");
  }

  async function shareVideo() {
    const blob = videoBlobRef.current ?? await fetch(videoSrc).then((r) => r.blob()).catch(() => null);
    if (blob && navigator.canShare) {
      const file = new File([blob], fileName, { type: "video/mp4" });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: `${shareText(score)} ${url}` });
          return;
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
        }
      }
    }
    // Fallback: trigger download.
    downloadVideo();
  }

  function downloadVideo() {
    const a = document.createElement("a");
    a.href = videoSrc;
    a.download = fileName;
    a.click();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="mx-auto w-full max-w-[720px] px-4 pt-10">
      {mine === false && (
        <div className="mb-6 rounded-lg border border-white/10 light:border-black/10 bg-white/5 light:bg-black/5 p-4">
          <p className="text-lg font-semibold text-white light:text-black">{theyAre(tier)}. Are you more local?</p>
          <Link href="/" className={`${buttonBase} mt-3 bg-accent text-white hover:bg-accent-dark`}>
            Take the test
          </Link>
        </div>
      )}

      {/* Score reveal */}
      <ScoreReveal score={score} />

      <p className="mt-3 text-sm font-semibold text-white/70 light:text-black/70">{youAre(tier)}</p>

      {/* Tier video */}
      <video
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        className="mt-6 w-full rounded-2xl shadow-lg aspect-[1200/630] bg-black"
      />

      {rig && (
        <p className="mt-4 text-sm text-white/60 light:text-black/60">
          <span className="mr-2 inline-block rounded-full border border-white/20 light:border-black/20 px-2.5 py-0.5 font-mono text-xs text-white light:text-black">
            {RIG_CLASSES[rig].label}
          </span>
          {RIG_CLASSES[rig].advice}
        </p>
      )}

      {mine !== false && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={shareOnX}
            className={`${buttonBase} bg-white light:bg-black text-black light:text-white hover:bg-white/90 light:hover:bg-black/90`}
          >
            Share on 𝕏
          </button>
          <button
            type="button"
            onClick={shareVideo}
            className={`${buttonBase} border border-white/20 light:border-black/20 text-white light:text-black hover:border-white/50 light:hover:border-black/40`}
          >
            {touch ? "Share video" : "Download video"}
          </button>
          <button
            type="button"
            onClick={copyLink}
            className={`${buttonBase} border border-white/20 light:border-black/20 text-white light:text-black hover:border-white/50 light:hover:border-black/40`}
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
          <Link
            href="/"
            className={`${buttonBase} border border-white/20 light:border-black/20 text-white light:text-black hover:border-white/50 light:hover:border-black/40`}
          >
            Re-quantize
          </Link>
        </div>
      )}
      {shareHint && (
        <p role="status" className="mt-3 rounded-md bg-white/5 light:bg-black/5 px-3 py-2 text-sm text-accent ring-1 ring-accent/30">
          {shareHint}
        </p>
      )}
    </main>
  );
}
