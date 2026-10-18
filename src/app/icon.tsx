import { ImageResponse } from "next/og";
import { BrandIcon, brandIconFonts } from "@/lib/brand-icon";

export const contentType = "image/png";

const SIZES = [32, 192, 512];

export function generateImageMetadata() {
  return SIZES.map((size) => ({ id: String(size), size: { width: size, height: size }, contentType }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const size = Number(await id);
  return new ImageResponse(<BrandIcon size={size} />, { width: size, height: size, fonts: await brandIconFonts() });
}
