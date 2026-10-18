import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_DOMAIN } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };

const BG = "#0b0f0c";
const GREEN = "#4ade80";

export async function ogFonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [regular, bold] = await Promise.all([
    readFile(join(dir, "GeistMono-Regular.ttf")),
    readFile(join(dir, "GeistMono-Bold.ttf")),
  ]);
  return [
    { name: "Geist Mono", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Geist Mono", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}

function Frame({ children, prompt }: { children: React.ReactNode; prompt: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BG,
        color: "#e4e4e7",
        fontFamily: "Geist Mono",
        padding: 64,
        border: `8px solid ${GREEN}`,
      }}
    >
      <div style={{ display: "flex", fontSize: 28, color: GREEN }}>{prompt}</div>
      {children}
    </div>
  );
}

export function ScoreCard({ score, tier, roast, rigLabel }: { score: number; tier: string; roast: string; rigLabel: string | null }) {
  return (
    <Frame prompt="$ localaitest --score">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 48 }}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ fontSize: 200, fontWeight: 700, color: "#ffffff", lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 56, color: "#71717a" }}>/100</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", paddingBottom: 12 }}>
            <span style={{ fontSize: 28, color: "#a1a1aa" }}>running at</span>
            <span style={{ fontSize: 88, fontWeight: 700, color: GREEN, lineHeight: 1 }}>{tier}</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 32, fontSize: 34, lineHeight: 1.35, color: "#d4d4d8", maxWidth: 1060 }}>
          {roast}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28 }}>
        {rigLabel ? (
          <div style={{ display: "flex", border: `2px solid ${GREEN}`, color: GREEN, borderRadius: 999, padding: "8px 24px" }}>
            {rigLabel}
          </div>
        ) : (
          <div style={{ display: "flex", color: "#71717a" }}>The Local AI Purity Test</div>
        )}
        <div style={{ display: "flex", color: "#a1a1aa" }}>{SITE_DOMAIN}</div>
      </div>
    </Frame>
  );
}

export function HomeCard() {
  return (
    <Frame prompt="$ ollama run local-ai-purity-test">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 96, fontWeight: 700, color: "#ffffff", lineHeight: 1.05 }}>
          <span>The Local AI</span>
          <span>Purity Test</span>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 44, color: GREEN }}>How quantized are you?</div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 26, color: "#a1a1aa" }}>
          100 questions for people who run open-weight models at home.
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#a1a1aa" }}>
        <span>FP32 → Q4_K_M → IQ1_S</span>
        <span>{SITE_DOMAIN}</span>
      </div>
    </Frame>
  );
}
