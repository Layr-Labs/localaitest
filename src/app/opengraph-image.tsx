import { ImageResponse } from "next/og";
import { HomeCard, OG_SIZE, ogFonts } from "@/lib/og";

export const alt = "The Local AI Purity Test: how quantized are you?";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(<HomeCard />, { ...OG_SIZE, fonts: await ogFonts() });
}
