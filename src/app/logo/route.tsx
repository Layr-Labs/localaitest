import { ImageResponse } from "next/og";
import { BrandIcon, brandIconFonts } from "@/lib/brand-icon";

/** The "Local / AI / Test" logo for the GitHub and Hugging Face login screens, at /logo. */
export async function GET() {
  return new ImageResponse(<BrandIcon size={512} lines={["Local", "AI", "Test"]} />, {
    width: 512,
    height: 512,
    fonts: await brandIconFonts(),
  });
}
