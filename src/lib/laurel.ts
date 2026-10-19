// A laurel wreath drawn as SVG, so it can take each rank's color and be used both in the
// server-rendered share card and in the image the browser draws for download.
// Shape: two branches rising from the bottom center, pointed leaves in pairs that shrink toward
// the tips, and a wide opening at the top.

const SIZE = 400;
const CENTER = SIZE / 2;
const RADIUS = 150;

// Angles are measured clockwise from the top of the circle, so 180 is the bottom.
const STEM_START = 187;
const LEAF_START = 197;
const STEM_END = 322;
const PAIRS = 10;

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function point(deg: number, r = RADIUS) {
  const t = (deg * Math.PI) / 180;
  return { x: CENTER + r * Math.sin(t), y: CENTER - r * Math.cos(t) };
}

/** A pointed leaf whose base sits at the origin and whose tip points along +x. */
function leafPath(length: number, width: number): string {
  const l = round(length);
  const w = round(width);
  // Quadratic curves give an almond: pointed at both the base and the tip.
  return `M0 0 Q${round(l * 0.5)} ${-w} ${l} 0 Q${round(l * 0.5)} ${w} 0 0 Z`;
}

/** The left branch. The right one is its mirror image. Leaf pairs cycle through `leaves`. */
function branch(stem: string, leaves: string[]): string {
  const parts: string[] = [];
  const a = point(STEM_START);
  const b = point(STEM_END);
  parts.push(
    `<path d="M${round(a.x)} ${round(a.y)} A${RADIUS} ${RADIUS} 0 0 1 ${round(b.x)} ${round(b.y)}" fill="none" stroke="${stem}" stroke-width="3.5" stroke-linecap="round"/>`,
  );

  for (let i = 0; i < PAIRS; i++) {
    const deg = LEAF_START + ((STEM_END - LEAF_START) * i) / (PAIRS - 1);
    // Leaves are largest at the bottom of the branch and shrink toward the tip.
    const scale = 1 - (i / (PAIRS - 1)) * 0.45;
    const length = 52 * scale;
    const width = 22 * scale;
    const base = point(deg);
    // Moving up the left side, the branch heads in direction `deg`; leaves angle up and out, and up and in.
    const color = leaves[i % leaves.length];
    for (const tilt of [-38, 34]) {
      parts.push(
        `<path d="${leafPath(length, width)}" fill="${color}" transform="translate(${round(base.x)} ${round(base.y)}) rotate(${round(deg + tilt)})"/>`,
      );
    }
  }
  // A single leaf caps the tip of the branch.
  const tip = point(STEM_END);
  parts.push(
    `<path d="${leafPath(28, 13)}" fill="${leaves[PAIRS % leaves.length]}" transform="translate(${round(tip.x)} ${round(tip.y)}) rotate(${STEM_END})"/>`,
  );
  return parts.join("");
}

export const LAUREL_SIZE = SIZE;

/** The full wreath as an SVG string: one color, or several for the leaves to cycle through. */
export function laurelSvg(color: string | string[]): string {
  const leaves = Array.isArray(color) ? color : [color];
  const left = branch(leaves[0], leaves);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}"><g>${left}</g><g transform="translate(${SIZE} 0) scale(-1 1)">${left}</g></svg>`;
}

/** The wreath as a data URI, usable as an <img> source on the server or in the browser. */
export function laurelDataUri(color: string | string[]): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(laurelSvg(color))}`;
}
