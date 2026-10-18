import { test } from "node:test";
import assert from "node:assert/strict";
import { allCodes, formatCode, parseCode, rigClassFor, roastFor, shareText, tierFor } from "./score.ts";

test("tier boundaries", () => {
  const expected: [number, string][] = [
    [0, "IQ1_S"], [9, "IQ1_S"], [10, "Q2_K"], [24, "Q2_K"], [25, "Q4_K_M"], [39, "Q4_K_M"],
    [40, "Q5_K_M"], [54, "Q5_K_M"], [55, "Q6_K"], [69, "Q6_K"], [70, "Q8_0"], [84, "Q8_0"],
    [85, "FP16"], [94, "FP16"], [95, "FP32"], [100, "FP32"],
  ];
  for (const [score, tier] of expected) assert.equal(tierFor(score).name, tier, `score ${score}`);
  assert.throws(() => tierFor(101));
  assert.throws(() => tierFor(-1));
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
  assert.match(roastFor(100), /cloud is that way/);
  assert.match(roastFor(0), /You ARE r\/LocalLLaMA/);
  assert.equal(roastFor(37), tierFor(37).roast);
});

test("share text", () => {
  assert.equal(shareText(34, null), "I got 34/100 on the Local AI Purity Test. I'm running at Q4_K_M.");
  assert.equal(shareText(34, "rich"), "I got 34/100 on the Local AI Purity Test. I'm running at Q4_K_M on a GPU rich rig.");
});
