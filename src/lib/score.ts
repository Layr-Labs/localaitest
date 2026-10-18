export const TOTAL_ITEMS = 100;

export type Tier = { min: number; max: number; name: string; roast: string };

// Ordered from most pure to most quantized.
export const TIERS: Tier[] = [
  { min: 95, max: 100, name: "FP32", roast: "You think a GGUF is a Pokémon. Stay pure. Touch grass, not GPUs." },
  { min: 85, max: 94, name: "FP16", roast: "You've heard of Ollama once, from a coworker, and nodded politely." },
  { min: 70, max: 84, name: "Q8_0", roast: "Barely compressed. You have one model on your laptop and you mention it at parties." },
  { min: 55, max: 69, name: "Q6_K", roast: "Still mostly coherent. Your browser has a Hugging Face tab that never closes." },
  { min: 40, max: 54, name: "Q5_K_M", roast: "Noticeable quality loss. You now say \"tokens per second\" in normal conversation." },
  { min: 25, max: 39, name: "Q4_K_M", roast: "The default quant, just like you. Good enough for everyone, great for no one." },
  { min: 10, max: 24, name: "Q2_K", roast: "Heavily quantized. You speak only in benchmark scores and your fans never stop spinning." },
  { min: 0, max: 9, name: "IQ1_S", roast: "You are the weights now. Please go outside. The sun is free compute." },
];

export function tierFor(score: number): Tier {
  const tier = TIERS.find((t) => score >= t.min && score <= t.max);
  if (!tier) throw new Error(`score out of range: ${score}`);
  return tier;
}

/** The two extremes get their own line instead of the tier roast. */
export function roastFor(score: number): string {
  if (score === 100) return "Are you lost? The cloud is that way. ☁️";
  if (score === 0) return "You don't run local models. You ARE r/LocalLLaMA.";
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

export function shareText(score: number, rig: RigClass | null): string {
  const rigSuffix = rig ? ` on a ${RIG_CLASSES[rig].label} rig` : "";
  return `I got ${score}/100 on the Local AI Purity Test. I'm running at ${tierFor(score).name}${rigSuffix}.`;
}
