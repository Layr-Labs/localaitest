import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_DOMAIN } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };

// The image renderer (next/og) can't read variable fonts, so images use fixed-weight copies of
// Zalando Sans SemiExpanded, renamed "LAT Sans SemiExpanded" as its open font license requires.
export async function ogFonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [mono, regular] = await Promise.all([
    readFile(join(dir, "GeistMono-Regular.ttf")),
    readFile(join(dir, "LATSansSemiExpanded-Regular.ttf")),
  ]);
  return [
    { name: "Geist Mono", data: mono, weight: 400 as const, style: "normal" as const },
    { name: "LAT Sans", data: regular, weight: 400 as const, style: "normal" as const },
  ];
}

const BRAND_BLUE = "#0b44ff";
// A pixel "?", drawn on the same square grid as the rank cards.
const QUESTION_MARK = [
  ".####.",
  "##..##",
  "....##",
  "...##.",
  "..##..",
  "..##..",
  "......",
  "..##..",
  "..##..",
];
// Lit pixels are mostly white with a few pale blue ones, like the rank cards.
const PIXEL_TINTS = ["#ffffff", "#ffffff", "#ffffff", "#c7d4ff", "#ffffff", "#ffffff", "#dbe3ff"];
const PIXEL = 26;
const PIXEL_GAP = 5;

function PixelGlyph({ rows, seed }: { rows: string[]; seed: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: PIXEL_GAP }}>
      {rows.map((row, y) => (
        <div key={y} style={{ display: "flex", gap: PIXEL_GAP }}>
          {[...row].map((cell, x) => (
            <div
              key={x}
              style={{
                width: PIXEL,
                height: PIXEL,
                background:
                  cell === "#" ? PIXEL_TINTS[(x * 3 + y * 5 + seed) % PIXEL_TINTS.length] : "rgba(255,255,255,0.07)",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** The card for the homepage link: the rank cards' layout, with "??" waiting for your score. */
export function HomeCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        position: "relative",
        padding: "0 72px 0 96px",
        background: BRAND_BLUE,
        color: "#ffffff",
        fontFamily: "LAT Sans",
        fontWeight: 400,
      }}
    >
      <div style={{ display: "flex", gap: PIXEL * 1.2 }}>
        <PixelGlyph rows={QUESTION_MARK} seed={0} />
        <PixelGlyph rows={QUESTION_MARK} seed={2} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginLeft: 84 }}>
        <span style={{ fontSize: 30, lineHeight: 1.2 }}>The Local AI Test</span>
        <span style={{ marginTop: 14, fontSize: 96, lineHeight: 1, letterSpacing: -3 }}>How local</span>
        <span style={{ fontSize: 96, lineHeight: 1, letterSpacing: -3 }}>are you?</span>
      </div>

      <span
        style={{
          position: "absolute",
          right: 72,
          bottom: 44,
          fontFamily: "Geist Mono",
          fontSize: 24,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        {SITE_DOMAIN}
      </span>
    </div>
  );
}
