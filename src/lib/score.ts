export const TOTAL_ITEMS = 100;

/**
 * `rank` is the identity people share ("I'm a Builder"), and `level` runs 1–9 as you get more local.
 * Each rank's card art lives in public/cards.
 */
export type Tier = {
  min: number;
  max: number;
  rank: string;
  /** Article for "You're ___": "an Enthusiast", "a Builder", or none for "Curious". */
  article: "" | "a" | "an";
  level: number;
  roast: string;
  /** Overrides "You're a ___" for ranks that don't read that way, like "You've unlocked God Mode". */
  you?: string;
};

// Your score is how many items you ticked, so ranks run from Curious (0) up to Legend, with a
// secret God Mode for a perfect 100.
export const TIERS: Tier[] = [
  { min: 0, max: 5, rank: "Curious", article: "", level: 1, roast: "You think a GGUF is a Pokémon and your GPU is for spreadsheets. Welcome to the rabbit hole." },
  { min: 6, max: 15, rank: "Enthusiast", article: "an", level: 2, roast: "You say \"tokens per second\" in normal conversation. Your friends have started nodding without listening." },
  { min: 16, max: 30, rank: "Explorer", article: "an", level: 3, roast: "You have exactly one model on your laptop and you bring it up at every dinner party." },
  { min: 31, max: 45, rank: "Regular", article: "a", level: 4, roast: "Your Hugging Face tab hasn't been closed in months and 80% of your disk is models you'll never run." },
  { min: 46, max: 60, rank: "Builder", article: "a", level: 5, roast: "Your rig has a name, its own circuit breaker and more RAM than your first three laptops combined." },
  { min: 61, max: 75, rank: "Quantizer", article: "a", level: 6, roast: "You'll argue Q4_K_M vs Q5_K_S for an hour, then run Q3 because it's the only one that fits." },
  { min: 76, max: 90, rank: "Power User", article: "a", level: 7, roast: "You've rebuilt llama.cpp more times than you've called your mom this year." },
  { min: 91, max: 99, rank: "Legend", article: "a", level: 8, roast: "You are the weights now. Please go outside. The sun is free compute." },
  { min: 100, max: 100, rank: "God Mode", article: "", level: 9, roast: "You don't run local models. You ARE r/LocalLLaMA.", you: "You've unlocked God Mode" },
];

/** "You're an Explorer", "You're Curious", "You've unlocked God Mode". */
export function youAre(tier: Tier): string {
  if (tier.you) return tier.you;
  return tier.article ? `You're ${tier.article} ${tier.rank}` : `You're ${tier.rank}`;
}

/** The sharer's voice, for posts and link previews: "I'm an Explorer", "I unlocked God Mode". */
export function iAm(tier: Tier): string {
  return youAre(tier).replace("You've", "I've").replace("You're", "I'm");
}

/** Someone else's result, for the banner a friend sees: "Your friend is an Explorer". */
export function theyAre(tier: Tier): string {
  return youAre(tier).replace("You've", "Your friend has").replace("You're", "Your friend is");
}

export function tierFor(score: number): Tier {
  const tier = TIERS.find((t) => score >= t.min && score <= t.max);
  if (!tier) throw new Error(`score out of range: ${score}`);
  return tier;
}

/** Ticking nothing gets its own line instead of the Curious roast. */
export function roastFor(score: number): string {
  if (score === 0) return "Are you lost? The cloud is that way. ☁️";
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
