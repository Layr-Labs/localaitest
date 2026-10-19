export const TOTAL_ITEMS = 100;

/**
 * `rank` is the identity people share ("I'm a Builder"); `level` runs 1–8 as you get more local;
 * `color` is the rank's accent on the share card.
 */
export type Tier = {
  min: number;
  max: number;
  name: string;
  rank: string;
  /** Article for "You're ___": "an Explorer", "a Builder", or none for "Curious". */
  article: "" | "a" | "an";
  level: number;
  color: string;
  roast: string;
};

// Your score is how many items you ticked, so ranks run from Curious (0) up to Legend (100).
export const TIERS: Tier[] = [
  { min: 0, max: 5, name: "FP32", rank: "Curious", article: "", level: 1, color: "#7dd3fc", roast: "You think a GGUF is a Pokémon. Stay pure. Touch grass, not GPUs." },
  { min: 6, max: 15, name: "FP16", rank: "Explorer", article: "an", level: 2, color: "#5eead4", roast: "You've heard of Ollama once, from a coworker, and nodded politely." },
  { min: 16, max: 30, name: "Q8_0", rank: "Tinkerer", article: "a", level: 3, color: "#4ade80", roast: "Barely compressed. You have one model on your laptop and you mention it at parties." },
  { min: 31, max: 45, name: "Q6_K", rank: "Regular", article: "a", level: 4, color: "#a3e635", roast: "Still mostly coherent. Your browser has a Hugging Face tab that never closes." },
  { min: 46, max: 60, name: "Q5_K_M", rank: "Enthusiast", article: "an", level: 5, color: "#facc15", roast: "Noticeable quality loss. You now say \"tokens per second\" in normal conversation." },
  { min: 61, max: 75, name: "Q4_K_M", rank: "Builder", article: "a", level: 6, color: "#fb923c", roast: "The default quant, just like you. Good enough for everyone, great for no one." },
  { min: 76, max: 90, name: "Q2_K", rank: "Power User", article: "a", level: 7, color: "#f87171", roast: "Heavily quantized. You speak only in benchmark scores and your fans never stop spinning." },
  { min: 91, max: 100, name: "IQ1_S", rank: "Legend", article: "a", level: 8, color: "#f5c542", roast: "You are the weights now. Please go outside. The sun is free compute." },
];

/** "You're an Explorer", "You're Curious". */
export function youAre(tier: Tier): string {
  return tier.article ? `You're ${tier.article} ${tier.rank}` : `You're ${tier.rank}`;
}

/** The sharer's voice, for posts and link previews: "I'm an Explorer". */
export function iAm(tier: Tier): string {
  return youAre(tier).replace("You're", "I'm");
}

export function tierFor(score: number): Tier {
  const tier = TIERS.find((t) => score >= t.min && score <= t.max);
  if (!tier) throw new Error(`score out of range: ${score}`);
  return tier;
}

/** The two extremes get their own line instead of the tier roast. */
export function roastFor(score: number): string {
  if (score === 0) return "Are you lost? The cloud is that way. ☁️";
  if (score === 100) return "You don't run local models. You ARE r/LocalLLaMA.";
  return tierFor(score).roast;
}

export type RigClass = "poor" | "middle" | "rich" | "datacenter";

export const RIG_CLASSES: Record<RigClass, { label: string; advice: string }> = {
  poor: { label: "GPU poor", advice: "Recommended upgrade: literally anything." },
  middle: { label: "VRAM middle class", advice: "Recommended upgrade: a second 3090. You know you want to." },
  rich: { label: "GPU rich", advice: "Recommended upgrade: a 512GB Mac. For the vibes." },
  datacenter: { label: "Datacenter in a closet", advice: "Recommended upgrade: an electrician." },
};

export function rigClassFor(totalGb: number): RigClass {
  if (totalGb < 16) return "poor";
  if (totalGb < 48) return "middle";
  if (totalGb < 192) return "rich";
  return "datacenter";
}

export function isRigClass(value: string): value is RigClass {
  return value in RIG_CLASSES;
}

/** Result codes are the URL segment under /r: "37" or "37-rich". */
export function formatCode(score: number, rig?: RigClass | null): string {
  return rig ? `${score}-${rig}` : String(score);
}

export function parseCode(code: string): { score: number; rig: RigClass | null } | null {
  const match = /^(\d{1,3})(?:-([a-z]+))?$/.exec(code);
  if (!match) return null;
  const score = Number(match[1]);
  if (score < 0 || score > TOTAL_ITEMS || String(score) !== match[1]) return null;
  const rig = match[2];
  if (rig !== undefined && !isRigClass(rig)) return null;
  return { score, rig: rig ?? null };
}

export function allCodes(): string[] {
  const codes: string[] = [];
  for (let score = 0; score <= TOTAL_ITEMS; score++) {
    codes.push(formatCode(score));
    for (const rig of Object.keys(RIG_CLASSES) as RigClass[]) codes.push(formatCode(score, rig));
  }
  return codes;
}

export function shareText(score: number): string {
  const tier = tierFor(score);
  return `${iAm(tier)} on the Local AI Purity Test: ${score}/100.`;
}
