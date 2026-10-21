"use client";

// A mechanical key click, synthesized rather than loaded, so there's no audio file to fetch.
// The AudioContext is created on the first click (a user gesture), so autoplay rules never block it,
// and a missing or refused Web Audio implementation must never break the toggle itself.
let audioCtx: AudioContext | null = null;

// A percussive noise burst. High-passed it reads as a sharp tick, low-passed as a dull thud;
// layering the two is what makes it sound like a real key.
function burst(ctx: AudioContext, seconds: number, type: BiquadFilterType, cutoff: number, gain: number) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = cutoff;
  filter.Q.value = 0.7;
  const volume = ctx.createGain();
  volume.gain.value = gain;
  source.connect(filter).connect(volume).connect(ctx.destination);
  source.start();
}

function click() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    audioCtx ??= new AC();
    burst(audioCtx, 0.008, "highpass", 1100, 0.22); // the tick
    burst(audioCtx, 0.03, "lowpass", 320, 0.16); // the body under it
  } catch {}
}

/**
 * One button that flips between dark (the default) and light, with a key click.
 * It shows the sun in dark mode and the moon in light mode, chosen by CSS from the class on
 * <html>, so the right icon is there on first paint with no flicker.
 */
export function ThemeToggle() {
  function toggle() {
    const light = document.documentElement.classList.toggle("light");
    try {
      localStorage.setItem("theme", light ? "light" : "dark");
    } catch {}
    click();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="flex size-9 items-center justify-center rounded-full text-white/50 transition-colors hover:text-white light:text-black/50 light:hover:text-black"
    >
      <svg viewBox="0 0 16 16" className="size-[18px] light:hidden" aria-hidden="true">
        <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      <svg viewBox="0 0 16 16" className="hidden size-[18px] light:block" aria-hidden="true">
        <path
          d="M13.5 9.8A6 6 0 0 1 6.2 2.5a6 6 0 1 0 7.3 7.3z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
