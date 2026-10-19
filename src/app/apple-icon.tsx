import { ImageResponse } from "next/og";
import { BrandIcon, brandIconFonts } from "@/lib/brand-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(<BrandIcon size={180} rounded={false} />, { ...size, fonts: await brandIconFonts() });
}
