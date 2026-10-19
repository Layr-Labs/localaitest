import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { laurelDataUri } from "./laurel";
import { TIERS, youAre, type Tier } from "./score";
import { SITE_DOMAIN } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };

const INK = "#0a0a0a";
const SITE_GREEN = "#16a34a";
const WREATH = 540;

export async function ogFonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [regular, bold, inter] = await Promise.all([
    readFile(join(dir, "GeistMono-Regular.ttf")),
    readFile(join(dir, "GeistMono-Bold.ttf")),
    readFile(join(dir, "Inter-Bold.ttf")),
  ]);
  return [
    { name: "Geist Mono", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Geist Mono", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: inter, weight: 700 as const, style: "normal" as const },
  ];
}

type Palette = { bg: string; ink: string; accent: string; quiet: string; highlight: string };

/** The shared layout: a laurel wreath around a big number, and a headline beside it. */
function WreathCard({
  palette,
  number,
  numberSize,
  lead,
  leadSize = 48,
  headline,
}: {
  palette: Palette;
  number: string;
  numberSize: number;
  lead: string;
  leadSize?: number;
  headline: React.ReactNode;
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
            src={laurelDataUri(accent)}
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
  // Legend inverts the colors: a black card with gold, so the rarest rank looks rarest.
  const legend = tier.level === TIERS.length;
  const palette: Palette = legend
    ? { bg: INK, ink: tier.color, accent: tier.color, quiet: "#71717a", highlight: tier.color }
    : { bg: tier.color, ink: INK, accent: INK, quiet: "rgba(10,10,10,0.55)", highlight: INK };
  // Sized so the longest ranks ("Enthusiast", "Power User") still fit on one line.
  const rankSize = tier.rank.length >= 10 ? 88 : tier.rank.length >= 8 ? 106 : 122;
  const lead = youAre(tier).slice(0, -tier.rank.length).trim();
  return (
    <WreathCard
      palette={palette}
      number={String(score)}
      numberSize={score >= 100 ? 132 : 196}
      lead={lead}
      headline={<Headline text={tier.rank} size={rankSize} color={palette.ink} square={palette.accent} />}
    />
  );
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
