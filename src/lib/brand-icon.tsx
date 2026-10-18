import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Same green as the site's accent color.
const GREEN = "#16a34a";
const TEXT = "#ffffff";

export async function brandIconFonts() {
  const bold = await readFile(join(process.cwd(), "assets/fonts/Inter-Bold.ttf"));
  return [{ name: "Inter", data: bold, weight: 700 as const, style: "normal" as const }];
}

/** "Local / AI" stacked, so the text stays large enough to read at tab size. */
export function BrandIcon({ size }: { size: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingLeft: size * 0.09,
        background: GREEN,
        color: TEXT,
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize: size * 0.34,
        lineHeight: 0.95,
        letterSpacing: "-0.05em",
      }}
    >
      <span>Local</span>
      <span>AI</span>
    </div>
  );
}
