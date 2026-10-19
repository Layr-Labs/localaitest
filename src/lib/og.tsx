import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { laurelDataUri } from "./laurel";
import { leadFor, roastFor, TIERS, type Tier } from "./score";
import { SITE_DOMAIN } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };

const INK = "#0a0a0a";
const SITE_GREEN = "#16a34a";
const WREATH = 540;

export async function ogFonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [regular, bold, inter, interRegular] = await Promise.all([
    readFile(join(dir, "GeistMono-Regular.ttf")),
    readFile(join(dir, "GeistMono-Bold.ttf")),
    readFile(join(dir, "Inter-Bold.ttf")),
    readFile(join(dir, "Inter-Regular.ttf")),
  ]);
  return [
    { name: "Geist Mono", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Geist Mono", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: inter, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: interRegular, weight: 400 as const, style: "normal" as const },
  ];
}

type Palette = {
  bg: string;
  ink: string;
  accent: string;
  quiet: string;
  highlight: string;
  /** Wreath colors; defaults to `accent`. */
  wreath?: string | string[];
  /** The square after the headline; any CSS background, defaults to `accent`. */
  square?: string;
};

/** The shared layout: a laurel wreath around a big number, and a headline beside it. */
function WreathCard({
  palette,
  number,
  numberSize,
  lead,
  leadSize = 48,
  headline,
  footnote,
}: {
  palette: Palette;
  number: string;
  numberSize: number;
  lead: string;
  leadSize?: number;
  headline: React.ReactNode;
  footnote?: string;
}) {
  const { bg, ink, accent, quiet, highlight } = palette;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        padding: "0 56px",
        background: bg,
        color: ink,
        fontFamily: "Inter",
        fontWeight: 700,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            width: WREATH,
            height: WREATH,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={laurelDataUri(palette.wreath ?? accent)}
            alt=""
            width={WREATH}
            height={WREATH}
            style={{ position: "absolute", top: 0, left: 0 }}
          />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -14 }}>
            <span style={{ fontSize: numberSize, lineHeight: 0.9, letterSpacing: -8, color: highlight }}>{number}</span>
            <span style={{ marginTop: 4, fontSize: 48, lineHeight: 1, color: quiet, letterSpacing: -1 }}>/100</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: leadSize, lineHeight: 1.15, letterSpacing: -1, color: quiet }}>{lead}</span>
          {headline}
          {footnote && (
            // One span per word, so lines only break at spaces (never inside "r/LocalLLaMA").
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                marginTop: 22,
                maxWidth: 512,
                fontSize: 32,
                fontWeight: 400,
                lineHeight: 1.3,
                letterSpacing: -0.3,
                color: ink,
                opacity: 0.82,
              }}
            >
              {footnote.split(" ").map((word, i) => (
                <span key={i} style={{ marginRight: 8 }}>
                  {word}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <span
        style={{
          position: "absolute",
          right: 56,
          bottom: 40,
          fontFamily: "Geist Mono",
          fontWeight: 400,
          fontSize: 24,
          color: quiet,
        }}
      >
        {SITE_DOMAIN}
      </span>
    </div>
  );
}

function Headline({ text, size, color, square }: { text: string; size: number; color: string; square: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        fontSize: size,
        lineHeight: 1,
        letterSpacing: -4,
        whiteSpace: "nowrap",
        color,
      }}
    >
      {text}
      <div
        style={{
          width: size * 0.17,
          height: size * 0.17,
          marginLeft: size * 0.05,
          marginBottom: size * 0.06,
          borderRadius: 6,
          background: square,
        }}
      />
    </div>
  );
}

/** The share card: your score inside a laurel wreath, in your rank's color, and who that makes you. */
export function RankCard({ score, tier }: { score: number; tier: Tier }) {
  const palette = paletteFor(tier);
  // Sized so the longest ranks ("Enthusiast", "Power User") still fit on one line.
  const rankSize = tier.rank.length >= 10 ? 88 : tier.rank.length >= 8 ? 106 : 122;
  return (
    <WreathCard
      palette={palette}
      number={String(score)}
      numberSize={score >= 100 ? 132 : 196}
      lead={leadFor(tier)}
      headline={
        <Headline text={tier.rank} size={rankSize} color={palette.ink} square={palette.square ?? palette.accent} />
      }
      footnote={roastFor(score)}
    />
  );
}

const RANK_COLORS = TIERS.filter((t) => t.card === "poster").map((t) => t.color);

function paletteFor(tier: Tier): Palette {
  if (tier.card === "god") {
    // The secret 100/100 card: a wreath in every rank's color, so it reads as the set completed.
    return {
      bg: INK,
      ink: "#ffffff",
      accent: "#ffffff",
      quiet: "#a1a1aa",
      highlight: "#ffffff",
      wreath: ["#f5c542", ...RANK_COLORS],
      square: `linear-gradient(135deg, ${RANK_COLORS.join(", ")})`,
    };
  }
  if (tier.card === "legend") {
    // Legend inverts the poster: a black card with gold, so the top rank looks rarer.
    return { bg: INK, ink: tier.color, accent: tier.color, quiet: "#71717a", highlight: tier.color };
  }
  return { bg: tier.color, ink: INK, accent: INK, quiet: "rgba(10,10,10,0.55)", highlight: INK };
}

/** The card for the homepage link: the same wreath, waiting for your score. */
export function HomeCard() {
  const palette: Palette = {
    bg: SITE_GREEN,
    ink: "#ffffff",
    accent: "#ffffff",
    quiet: "rgba(255,255,255,0.7)",
    highlight: "#ffffff",
  };
  return (
    <WreathCard
      palette={palette}
      number="??"
      numberSize={196}
      lead="The Local AI Purity Test"
      leadSize={36}
      headline={
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 106, lineHeight: 1, letterSpacing: -4 }}>How local</span>
          <span style={{ fontSize: 106, lineHeight: 1, letterSpacing: -4 }}>are you?</span>
        </div>
      }
    />
  );
}
