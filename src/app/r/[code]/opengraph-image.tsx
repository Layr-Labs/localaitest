import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { OG_SIZE, ogFonts, ScoreCard } from "@/lib/og";
import { allCodes, parseCode, RIG_CLASSES, roastFor, tierFor } from "@/lib/score";

export const alt = "A Local AI Purity Test score card";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return allCodes().map((code) => ({ code }));
}

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const result = parseCode((await params).code);
  if (!result) notFound();
  const { score, rig } = result;
  return new ImageResponse(
    <ScoreCard score={score} tier={tierFor(score).name} roast={roastFor(score)} rigLabel={rig ? RIG_CLASSES[rig].label : null} />,
    { ...OG_SIZE, fonts: await ogFonts() },
  );
}
