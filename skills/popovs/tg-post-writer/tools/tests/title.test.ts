import { test } from "node:test";
import assert from "node:assert/strict";
import { computeFontSize, truncateTitle, validateTitle } from "../lib/title.ts";

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

test("truncateTitle: ≤140 символов возвращается как есть", () => {
  const s = "а".repeat(140);
  assert.equal(truncateTitle(s), s);
});

test("truncateTitle: >140 символов обрезается на границе слова", () => {
  const long = "один два три четыре пять шесть семь " + "слово ".repeat(30);
  const result = truncateTitle(long);
  assert.ok([...result].length <= 140);
  assert.ok(result.endsWith("…"));
  // Обрезка на пробеле: последний символ перед «…» не должен быть половиной слова
  const beforeEllipsis = result.slice(0, -1);
  assert.ok(!beforeEllipsis.endsWith(" "), "нет хвостового пробела перед …");
});

test("truncateTitle: строка >140 без пробелов режется по 139 + …", () => {
  const s = "а".repeat(200);
  const result = truncateTitle(s);
  assert.equal([...result].length, 140);
  assert.ok(result.endsWith("…"));
});

test("truncateTitle: пустая строка возвращается как есть", () => {
  assert.equal(truncateTitle(""), "");
});

test("validateTitle: непустая строка → ok", () => {
  const r = validateTitle("Нормальный заголовок");
  assert.equal(r.ok, true);
});

test("validateTitle: пустая строка → error", () => {
  const r = validateTitle("");
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /пуст/i);
});

test("validateTitle: только пробелы → error", () => {
  const r = validateTitle("   ");
  assert.equal(r.ok, false);
});

test("validateTitle: эмоджи → error", () => {
  const r = validateTitle("Заголовок с 🎉 эмоджи");
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /эмоджи/i);
});

test("validateTitle: тире и кавычки-елочки разрешены", () => {
  assert.equal(validateTitle("AI — это серьёзно").ok, true);
  assert.equal(validateTitle("Он сказал «нет»").ok, true);
});
