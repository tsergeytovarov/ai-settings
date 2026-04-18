import { test } from "node:test";
import assert from "node:assert/strict";
import { computeFontSize } from "../lib/title.ts";

test("computeFontSize: ≤30 символов → 128px", () => {
  assert.equal(computeFontSize("Короткий тезис"), 128);
  assert.equal(computeFontSize("а".repeat(30)), 128);
});

test("computeFontSize: 31-60 символов → 104px", () => {
  assert.equal(computeFontSize("а".repeat(31)), 104);
  assert.equal(computeFontSize("а".repeat(60)), 104);
});

test("computeFontSize: 61-100 символов → 80px", () => {
  assert.equal(computeFontSize("а".repeat(61)), 80);
  assert.equal(computeFontSize("а".repeat(100)), 80);
});

test("computeFontSize: 101-140 символов → 64px", () => {
  assert.equal(computeFontSize("а".repeat(101)), 64);
  assert.equal(computeFontSize("а".repeat(140)), 64);
});

test("computeFontSize: длина считается в Unicode code points, не UTF-16 units", () => {
  const str = "a".repeat(29) + "🎉"; // 30 code points
  assert.equal(computeFontSize(str), 128);
});
