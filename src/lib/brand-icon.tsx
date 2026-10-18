import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Colors sampled from the Local AI Builders banner.
const BLUE = "#2d3be6";
const CREAM = "#f1efe0";
const YELLOW = "#f4b51c";

export async function brandIconFonts() {
  const bold = await readFile(join(process.cwd(), "assets/fonts/Inter-Bold.ttf"));
  return [{ name: "Inter", data: bold, weight: 700 as const, style: "normal" as const }];
}

/** "Local AI / Builders." with the yellow square, sized to fill a square icon. */
export function BrandIcon({ size }: { size: number }) {
  const fontSize = size * 0.205;
  const square = fontSize * 0.26;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingLeft: size * 0.09,
        background: BLUE,
        color: CREAM,
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize,
        lineHeight: 1,
        letterSpacing: "-0.045em",
      }}
    >
      <span>Local AI</span>
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <span>Builders</span>
        <span
          style={{
            width: square,
            height: square,
            marginLeft: fontSize * 0.06,
            marginBottom: fontSize * 0.12,
            background: YELLOW,
            borderRadius: square * 0.12,
          }}
        />
      </div>
    </div>
  );
}
