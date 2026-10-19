import { test } from "node:test";
import assert from "node:assert/strict";
import { allCodes, formatCode, parseCode, rigClassFor, roastFor, shareText, tierFor, TIERS, youAre } from "./score.ts";

test("tier boundaries", () => {
  const expected: [number, string][] = [
    [0, "FP32"], [5, "FP32"], [6, "FP16"], [15, "FP16"], [16, "Q8_0"], [30, "Q8_0"],
    [31, "Q6_K"], [45, "Q6_K"], [46, "Q5_K_M"], [60, "Q5_K_M"], [61, "Q4_K_M"], [75, "Q4_K_M"],
    [76, "Q2_K"], [90, "Q2_K"], [91, "IQ1_S"], [100, "IQ1_S"],
  ];
  for (const [score, tier] of expected) assert.equal(tierFor(score).name, tier, `score ${score}`);
  assert.throws(() => tierFor(101));
  assert.throws(() => tierFor(-1));
});

test("more ticks means a higher rank", () => {
  assert.equal(tierFor(0).rank, "Curious");
  assert.equal(tierFor(100).rank, "Legend");
  for (let s = 1; s <= 100; s++) assert.ok(tierFor(s).level >= tierFor(s - 1).level, `score ${s}`);
});

test("every score from 0 to 100 has exactly one tier", () => {
  for (let s = 0; s <= 100; s++) assert.doesNotThrow(() => tierFor(s));
});

test("rig class boundaries", () => {
  const expected: [number, string][] = [
    [0, "poor"], [15, "poor"], [16, "middle"], [47, "middle"], [48, "rich"], [191, "rich"], [192, "datacenter"], [600, "datacenter"],
  ];
  for (const [gb, rig] of expected) assert.equal(rigClassFor(gb), rig, `${gb}GB`);
});

test("result codes round-trip and reject junk", () => {
  assert.deepEqual(parseCode("37"), { score: 37, rig: null });
  assert.deepEqual(parseCode("37-rich"), { score: 37, rig: "rich" });
  assert.equal(formatCode(0, "datacenter"), "0-datacenter");
  for (const bad of ["101", "-1", "037", "37-huge", "abc", "37-", "", "1000"]) assert.equal(parseCode(bad), null, bad);
  assert.equal(allCodes().length, 101 * 5);
  for (const code of allCodes()) assert.notEqual(parseCode(code), null, code);
});

test("special roasts at the extremes", () => {
  assert.match(roastFor(0), /cloud is that way/);
  assert.match(roastFor(100), /You ARE r\/LocalLLaMA/);
  assert.equal(roastFor(37), tierFor(37).roast);
});

test("ranks run from Curious to Legend with levels 1 to 8", () => {
  assert.deepEqual(
    TIERS.map((t) => t.rank),
    ["Curious", "Explorer", "Tinkerer", "Regular", "Enthusiast", "Builder", "Power User", "Legend"],
  );
  assert.deepEqual(TIERS.map((t) => t.level), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test("rank phrases use the right article", () => {
  assert.deepEqual(TIERS.map(youAre), [
    "You're Curious",
    "You're an Explorer",
    "You're a Tinkerer",
    "You're a Regular",
    "You're an Enthusiast",
    "You're a Builder",
    "You're a Power User",
    "You're a Legend",
  ]);
});

test("share text", () => {
  assert.equal(shareText(66), "I'm a Builder on the Local AI Purity Test: 66/100.");
  assert.equal(shareText(3), "I'm Curious on the Local AI Purity Test: 3/100.");
  assert.equal(shareText(12), "I'm an Explorer on the Local AI Purity Test: 12/100.");
});
