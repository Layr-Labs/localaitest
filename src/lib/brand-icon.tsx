import { readFile } from "node:fs/promises";
import { join } from "node:path";

const BG = "#0b44ff";
const TEXT = "#ffffff";
const LINES = ["Local", "AI", "Test"];

export async function brandIconFonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const repro = await readFile(join(dir, "ABCReproVariable.ttf"));
  return [
    { name: "ABC Repro", data: repro, weight: 700 as const, style: "normal" as const },
    { name: "ABC Repro", data: repro, weight: 900 as const, style: "normal" as const },
  ];
}

/**
 * The stacked "Local / AI / Test" wordmark on the site green.
 *
 * At tab size (32px) each line only gets about 10 pixels, so small icons use the heaviest weight,
 * fill the square almost edge to edge, and pack the lines tightly. Larger sizes have room to
 * breathe. `rounded` gives the modern rounded-square shape; the Apple icon stays square because
 * iOS rounds it itself.
 */
export function BrandIcon({ size, rounded = true }: { size: number; rounded?: boolean }) {
  const small = size <= 64;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingLeft: size * (small ? 0.075 : 0.1),
        paddingBottom: size * 0.02,
        background: BG,
        borderRadius: rounded ? size * 0.22 : 0,
        color: TEXT,
        fontFamily: "ABC Repro",
        fontWeight: small ? 900 : 700,
        fontSize: size * (small ? 0.305 : 0.27),
        lineHeight: small ? 0.84 : 0.95,
        letterSpacing: small ? "-0.06em" : "-0.05em",
      }}
    >
      {LINES.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  );
}
