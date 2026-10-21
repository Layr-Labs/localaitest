import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { OG_SIZE } from "@/lib/og";
import { allCodes, parseCode, tierFor } from "@/lib/score";

export const alt = "A Local AI Purity Test rank card";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return allCodes().map((code) => ({ code }));
}

function frameNameFor(score: number, rank: string): string {
  if (score === 0) return "score-zero";
  return rank.toLowerCase().replace(" ", "-");
}

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const result = parseCode((await params).code);
  if (!result) notFound();
  const { score } = result;
  const tier = tierFor(score);
  const name = frameNameFor(score, tier.rank);
  const png = await readFile(join(process.cwd(), "public/cards/frames", `${name}.png`));
  return new Response(png, { headers: { "Content-Type": "image/png" } });
}
