import { test } from "node:test";
import assert from "node:assert/strict";
import { devicesFromHf, hardwareMatches, totalMemory } from "./rig.ts";

// Shape copied from a real Hugging Face /api/users/{user}/overview response.
const HF_HARDWARE = [
  { sku: ["GPU", "NVIDIA", "RTX 3090"], mem: 24, num: 2 },
  { sku: ["Apple Silicon", "-", "Apple M1 Pro"], mem: 32, num: 1 },
  { sku: ["Apple Silicon", "-", "Apple M5 Max"], mem: 128, num: 1, isPrimary: true },
  { sku: ["GPU", "NVIDIA", "GB10"], mem: 128, num: 1 },
  { sku: ["GPU", "AMD", "Ryzen AI Max+ 395"], mem: 128, num: 1 },
  { sku: ["CPU", "Intel", "Xeon"], mem: 256, num: 1 },
];

test("converts Hugging Face hardware and skips CPUs", () => {
  const devices = devicesFromHf(HF_HARDWARE);
  assert.equal(devices.length, 5);
  assert.equal(totalMemory(devices), 48 + 32 + 128 + 128 + 128);
  assert.deepEqual(devices[1], { name: "Apple M1 Pro", kind: "apple", mem: 32, num: 1 });
  assert.equal(devices[3].kind, "unified");
});

test("ignores malformed hardware", () => {
  assert.deepEqual(devicesFromHf(undefined), []);
  assert.deepEqual(devicesFromHf([{ sku: "nope" }, { sku: ["GPU", "X", "Y"], mem: "lots" }, null]), []);
});

test("hardware rules", () => {
  assert.deepEqual(hardwareMatches(devicesFromHf(HF_HARDWARE)).sort(), ["hw-mac-64", "hw-spark-or-strix", "hw-two-3090s"]);
  assert.deepEqual(hardwareMatches([{ name: "RTX 3090", kind: "gpu", mem: 24, num: 1 }]), []);
  assert.deepEqual(hardwareMatches([{ name: "Apple Silicon Mac (512GB)", kind: "apple", mem: 512, num: 1 }]).sort(), ["hw-mac-512", "hw-mac-64"]);
  assert.deepEqual(hardwareMatches([{ name: "DGX Spark", kind: "unified", mem: 128, num: 1 }]), ["hw-spark-or-strix"]);
});

test("picker lists Apple Silicon first and every option has a valid default memory", async () => {
  const { DEVICE_OPTIONS, DEVICE_GROUPS } = await import("./rig.ts");
  assert.equal(DEVICE_OPTIONS[0].group, "Apple Silicon");
  assert.equal(DEVICE_GROUPS[0], "Apple Silicon");
  for (const o of DEVICE_OPTIONS) {
    assert.ok(o.mem > 0, o.name);
    if (o.memOptions) assert.ok(o.memOptions.includes(o.mem), o.name);
  }
  const m3Ultra = DEVICE_OPTIONS.find((o) => o.name === "Apple M3 Ultra")!;
  assert.deepEqual(hardwareMatches([{ name: m3Ultra.name, kind: m3Ultra.kind, mem: 512, num: 1 }]).sort(), ["hw-mac-512", "hw-mac-64"]);
});
