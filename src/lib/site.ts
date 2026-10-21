export const SITE_NAME = "The Local AI Purity Test";
export const SITE_DOMAIN = "localaitest.com";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE_DOMAIN}`).replace(/\/$/, "");
export const SITE_DESCRIPTION = "The official purity test for people who run open-weight models. How quantized are you?";

/** The business that runs the site, named in the footer as the FTC requires. */
export const OPERATOR = "Eigen Labs, Inc.";

/** Footer credits. */
export const CREATOR = { name: "Pratik", url: "https://x.com/pratikg" };
export const INSPIRED_BY = {
  people: [
    { name: "Tyler", url: "https://x.com/tyler_fong_" },
    { name: "Sarah", url: "https://x.com/MilksandMatcha" },
  ],
  site: { name: "sfpurity.com", url: "https://sfpurity.com/" },
  original: { name: "Rice Purity Test", url: "https://en.wikipedia.org/wiki/Rice_Purity_Test" },
};

export function resultUrl(code: string): string {
  return `${SITE_URL}/r/${code}`;
}
