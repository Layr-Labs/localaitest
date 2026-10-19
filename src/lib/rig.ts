import type { DetectRule } from "@/data/items";

/** One line of a rig, in the same shape Hugging Face uses for profile hardware. */
export type Device = { name: string; kind: "gpu" | "apple" | "unified" | "other"; mem: number; num: number };

export type Rig = { source: "hf" | "manual"; devices: Device[] };

export function totalMemory(devices: Device[]): number {
  return devices.reduce((sum, d) => sum + d.mem * d.num, 0);
}

export function describeRig(devices: Device[]): string {
  return devices.map((d) => (d.num > 1 ? `${d.num}× ${d.name}` : d.name)).join(" + ");
}

type HfHardwareItem = { sku?: unknown; mem?: unknown; num?: unknown };

/** Converts Hugging Face `hardwareItems`, skipping CPUs since their RAM isn't what runs the model. */
export function devicesFromHf(items: unknown): Device[] {
  if (!Array.isArray(items)) return [];
  const devices: Device[] = [];
  for (const raw of items as HfHardwareItem[]) {
    const sku = Array.isArray(raw?.sku) ? raw.sku.map(String) : [];
    const mem = Number(raw?.mem);
    const num = Number(raw?.num ?? 1);
    if (!sku.length || !Number.isFinite(mem) || mem <= 0 || !Number.isFinite(num) || num <= 0) continue;
    const [category] = sku;
    if (category === "CPU") continue;
    const name = sku[sku.length - 1];
    const kind: Device["kind"] =
      category === "Apple Silicon" ? "apple" : /GB10|Ryzen AI Max/i.test(name) ? "unified" : category === "GPU" ? "gpu" : "other";
    devices.push({ name, kind, mem, num });
  }
  return devices;
}

/** Hardware-based detection rules, shared by Hugging Face hardware and the manual rig picker. */
export function hardwareMatches(devices: Device[]): DetectRule[] {
  const rules: DetectRule[] = [];
  const count3090 = devices.filter((d) => /RTX 3090/i.test(d.name)).reduce((n, d) => n + d.num, 0);
  if (count3090 >= 2) rules.push("hw-two-3090s");
  if (devices.some((d) => d.kind === "apple" && d.mem >= 64)) rules.push("hw-mac-64");
  if (devices.some((d) => d.kind === "apple" && d.mem >= 512)) rules.push("hw-mac-512");
  if (devices.some((d) => /GB10|DGX Spark|Ryzen AI Max/i.test(d.name))) rules.push("hw-spark-or-strix");
  // Hugging Face lists a DGX Spark by its chip, GB10.
  const sparks = devices.filter((d) => /GB10|DGX Spark/i.test(d.name)).reduce((n, d) => n + d.num, 0);
  if (sparks >= 2) rules.push("hw-two-sparks");
  if (sparks >= 4) rules.push("hw-four-sparks");
  return rules;
}

export type DeviceGroup = "Apple Silicon" | "NVIDIA" | "AMD" | "Other";

export type DeviceOption = { name: string; group: DeviceGroup; kind: Device["kind"]; mem: number; memOptions?: number[] };

const apple = (name: string, memOptions: number[]): DeviceOption => ({
  name: `Apple ${name}`,
  group: "Apple Silicon",
  kind: "apple",
  mem: memOptions[0],
  memOptions,
});

/**
 * Curated list for the manual picker, newest Apple chips first.
 * Apple memory options are the configurations each chip shipped with.
 */
export const DEVICE_OPTIONS: DeviceOption[] = [
  apple("M5 Ultra", [96, 256, 512]),
  apple("M5 Max", [36, 48, 64, 128]),
  apple("M5 Pro", [24, 48, 64]),
  apple("M5", [16, 24, 32]),
  apple("M4 Max", [36, 48, 64, 128]),
  apple("M4 Pro", [24, 48, 64]),
  apple("M4", [16, 24, 32]),
  apple("M3 Ultra", [96, 256, 512]),
  apple("M3 Max", [36, 48, 64, 96, 128]),
  apple("M3 Pro", [18, 36]),
  apple("M3", [8, 16, 24]),
  apple("M2 Ultra", [64, 128, 192]),
  apple("M2 Max", [32, 64, 96]),
  apple("M2 Pro", [16, 32]),
  apple("M2", [8, 16, 24]),
  apple("M1 Ultra", [64, 128]),
  apple("M1 Max", [32, 64]),
  apple("M1 Pro", [16, 32]),
  apple("M1", [8, 16]),
  { name: "RTX 3060", group: "NVIDIA", kind: "gpu", mem: 12 },
  { name: "RTX 3080", group: "NVIDIA", kind: "gpu", mem: 10 },
  { name: "RTX 3090", group: "NVIDIA", kind: "gpu", mem: 24 },
  { name: "RTX 4060 Ti", group: "NVIDIA", kind: "gpu", mem: 16 },
  { name: "RTX 4070", group: "NVIDIA", kind: "gpu", mem: 12 },
  { name: "RTX 4080", group: "NVIDIA", kind: "gpu", mem: 16 },
  { name: "RTX 4090", group: "NVIDIA", kind: "gpu", mem: 24 },
  { name: "RTX 5080", group: "NVIDIA", kind: "gpu", mem: 16 },
  { name: "RTX 5090", group: "NVIDIA", kind: "gpu", mem: 32 },
  { name: "RTX Pro 6000", group: "NVIDIA", kind: "gpu", mem: 96 },
  { name: "Tesla P40", group: "NVIDIA", kind: "gpu", mem: 24 },
  { name: "A100 80GB", group: "NVIDIA", kind: "gpu", mem: 80 },
  { name: "H100 80GB", group: "NVIDIA", kind: "gpu", mem: 80 },
  { name: "DGX Spark", group: "NVIDIA", kind: "unified", mem: 128 },
  { name: "RX 7900 XTX", group: "AMD", kind: "gpu", mem: 24 },
  { name: "Ryzen AI Max+ 395", group: "AMD", kind: "unified", mem: 128, memOptions: [32, 64, 96, 128] },
  { name: "Something else", group: "Other", kind: "other", mem: 8, memOptions: [4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128] },
];

export const DEVICE_GROUPS: DeviceGroup[] = ["Apple Silicon", "NVIDIA", "AMD", "Other"];
