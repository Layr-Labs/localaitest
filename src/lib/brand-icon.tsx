import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Same green as the site's accent color.
const GREEN = "#16a34a";
const TEXT = "#ffffff";

export async function brandIconFonts() {
  const bold = await readFile(join(process.cwd(), "assets/fonts/Inter-Bold.ttf"));
  return [{ name: "Inter", data: bold, weight: 700 as const, style: "normal" as const }];
}

/**
 * The stacked wordmark on the site green. The favicon uses "Local / AI" so it stays readable at
 * tab size; the login-screen logo adds "Test" because it's shown much larger.
 */
export function BrandIcon({ size, lines = ["Local", "AI"] }: { size: number; lines?: string[] }) {
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
        fontSize: size * (lines.length > 2 ? 0.27 : 0.34),
        lineHeight: 0.95,
        letterSpacing: "-0.05em",
      }}
    >
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  );
}
