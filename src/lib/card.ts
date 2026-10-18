// Draws the score card on a canvas so the optional X handle never leaves the browser.
// Mirrors the layout of ScoreCard in og.tsx.

const BG = "#0b0f0c";
const GREEN = "#4ade80";

type CardInput = { score: number; tier: string; roast: string; rigLabel: string | null; handle: string; domain: string };

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const attempt = line ? `${line} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = attempt;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function drawCard(canvas: HTMLCanvasElement, input: CardInput, fontFamily: string): void {
  const W = 1200;
  const H = 630;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const font = (size: number, weight = 400) => `${weight} ${size}px ${fontFamily}`;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 16;
  ctx.strokeRect(0, 0, W, H);

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = GREEN;
  ctx.font = font(28);
  ctx.fillText("$ localaitest --score", 72, 110);

  ctx.fillStyle = "#ffffff";
  ctx.font = font(200, 700);
  const scoreText = String(input.score);
  ctx.fillText(scoreText, 72, 320);
  const scoreWidth = ctx.measureText(scoreText).width;
  ctx.fillStyle = "#71717a";
  ctx.font = font(56);
  ctx.fillText("/100", 72 + scoreWidth, 320);
  const slashWidth = ctx.measureText("/100").width;

  const tierX = 72 + scoreWidth + slashWidth + 48;
  ctx.fillStyle = "#a1a1aa";
  ctx.font = font(28);
  ctx.fillText("running at", tierX, 236);
  ctx.fillStyle = GREEN;
  ctx.font = font(88, 700);
  ctx.fillText(input.tier, tierX, 310);

  ctx.fillStyle = "#d4d4d8";
  ctx.font = font(34);
  wrap(ctx, input.roast, 1056)
    .slice(0, 3)
    .forEach((line, i) => ctx.fillText(line, 72, 392 + i * 46));

  ctx.font = font(28);
  const bottom = 560;
  let left = 72;
  if (input.rigLabel) {
    const w = ctx.measureText(input.rigLabel).width + 48;
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(left, bottom - 36, w, 52, 26);
    ctx.stroke();
    ctx.fillStyle = GREEN;
    ctx.fillText(input.rigLabel, left + 24, bottom);
    left += w + 24;
  }
  if (input.handle) {
    ctx.fillStyle = "#ffffff";
    ctx.fillText(input.handle, left, bottom);
  }
  ctx.fillStyle = "#a1a1aa";
  ctx.textAlign = "right";
  ctx.fillText(input.domain, W - 72, bottom);
  ctx.textAlign = "left";
}
