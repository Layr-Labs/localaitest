import { test } from "node:test";
import assert from "node:assert/strict";
import { allCodes, formatCode, parseCode, rigClassFor, roastFor, shareText, theyAre, tierFor, TIERS, youAre } from "./score.ts";

test("tier boundaries", () => {
  const expected: [number, string][] = [
    [0, "Curious"], [5, "Curious"], [6, "Enthusiast"], [15, "Enthusiast"], [16, "Explorer"], [30, "Explorer"],
    [31, "Regular"], [45, "Regular"], [46, "Builder"], [60, "Builder"], [61, "Quantizer"], [75, "Quantizer"],
    [76, "Power User"], [90, "Power User"], [91, "Legend"], [99, "Legend"], [100, "God Mode"],
  ];
  for (const [score, rank] of expected) assert.equal(tierFor(score).rank, rank, `score ${score}`);
  assert.throws(() => tierFor(101));
  assert.throws(() => tierFor(-1));
});

test("more ticks means a higher rank", () => {
  assert.equal(tierFor(0).rank, "Curious");
  assert.equal(tierFor(99).rank, "Legend");
  assert.equal(tierFor(100).rank, "God Mode");
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

test("ranks run from Curious to God Mode with levels 1 to 9", () => {
  assert.deepEqual(
    TIERS.map((t) => t.rank),
    ["Curious", "Enthusiast", "Explorer", "Regular", "Builder", "Quantizer", "Power User", "Legend", "God Mode"],
  );
  assert.deepEqual(TIERS.map((t) => t.level), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test("rank phrases use the right article", () => {
  assert.deepEqual(TIERS.map(youAre), [
    "You're Curious",
    "You're an Enthusiast",
    "You're an Explorer",
    "You're a Regular",
    "You're a Builder",
    "You're a Quantizer",
    "You're a Power User",
    "You're a Legend",
    "You've unlocked God Mode",
  ]);
});

test("share text", () => {
  assert.equal(shareText(66), "I'm a Quantizer on the Local AI Purity Test: 66/100.");
  assert.equal(shareText(3), "I'm Curious on the Local AI Purity Test: 3/100.");
  assert.equal(shareText(12), "I'm an Enthusiast on the Local AI Purity Test: 12/100.");
  assert.equal(shareText(100), "I've unlocked God Mode on the Local AI Purity Test: 100/100.");
  assert.equal(theyAre(tierFor(100)), "Your friend has unlocked God Mode");
  assert.equal(theyAre(tierFor(66)), "Your friend is a Quantizer");
});
