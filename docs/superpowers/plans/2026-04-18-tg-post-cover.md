# tg-post-writer: обложки в стилистике Meridian — план имплементации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить в скил `tg-post-writer` опциональную генерацию обложек 1080×1080 в стилистике Meridian (фон `#F7F4EE`, оранжевый акцент `#C0632A`, Literata SemiBold для title).

**Architecture:** Локальный Node-скрипт в `skills/work/tg-post-writer/tools/`, запускается через `tsx`. Satori рендерит JSX-подобное дерево в SVG, `@resvg/resvg-js` конвертирует SVG в PNG. Шрифт Literata бандлится в `assets/fonts/`. Скил вызывает скрипт как опциональный шаг 8 после написания поста.

**Tech Stack:** Node 20+, TypeScript, `tsx`, `satori`, `@resvg/resvg-js`, `node:test` (встроенный раннер, без vitest/jest).

**Спека:** `/Users/sergeypopov/Desktop/projects/ai-settings/docs/superpowers/specs/2026-04-18-tg-post-cover-design.md`

**Рабочая директория:** `/Users/sergeypopov/Desktop/projects/ai-settings` (репозиторий ai-settings, не ai-knowlege-base).

---

## Структура файлов

**Новые:**
- `skills/work/tg-post-writer/assets/fonts/Literata-Variable.ttf` — вариативный TTF с Google Fonts
- `skills/work/tg-post-writer/tools/package.json` — локальные зависимости
- `skills/work/tg-post-writer/tools/tsconfig.json` — TS-конфиг
- `skills/work/tg-post-writer/tools/render-cover.ts` — CLI-точка входа
- `skills/work/tg-post-writer/tools/lib/title.ts` — чистые функции для работы с title (compute font size, truncate, validate)
- `skills/work/tg-post-writer/tools/lib/render.ts` — satori + resvg pipeline, JSX-template как plain object
- `skills/work/tg-post-writer/tools/tests/title.test.ts` — тесты для title.ts

**Изменяемые:**
- `skills/work/tg-post-writer/SKILL.md` — добавить шаг 8, блок про cover_title, поднять version до 1.2.0
- `skills/work/tg-post-writer/CHANGELOG.md` — запись 1.2.0
- `skills/work/tg-post-writer/README.md` — раздел «Обложки»

**Почему такая разбивка:**
- `title.ts` — чистая логика без I/O, легко тестируется, живёт отдельно от рендера.
- `render.ts` — всё, что касается satori/resvg и JSX-шаблона, в одном месте. Шаблон в виде plain object, чтобы не тянуть JSX-трансформатор и React.
- `render-cover.ts` в корне `tools/` — CLI-entry с парсингом аргументов и exit-кодами, ничего больше. Делает import из `lib/`.
- `slug.ts` из спеки §4.5 не материализуется как отдельный модуль: CLI требует `--out` абсолютным путём, slug в коде нигде не нужен. Имя файла составляет вызывающая сторона (скил в SKILL.md), ей достаточно таймстемпа.

---

## Task 1: Скелет `tools/` (package.json, tsconfig.json, пустой render-cover.ts)

**Files:**
- Create: `skills/work/tg-post-writer/tools/package.json`
- Create: `skills/work/tg-post-writer/tools/tsconfig.json`
- Create: `skills/work/tg-post-writer/tools/render-cover.ts` (заглушка)
- Create: `skills/work/tg-post-writer/tools/.gitignore`

- [ ] **Step 1.1: Создать директорию и package.json**

Создать файл `skills/work/tg-post-writer/tools/package.json`:

```json
{
  "name": "tg-post-writer-tools",
  "version": "1.0.0",
  "private": true,
  "description": "CLI tool to render Meridian-style TG cover images",
  "type": "module",
  "scripts": {
    "render": "tsx render-cover.ts",
    "test": "node --import tsx --test tests/*.test.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "satori": "^0.10.13",
    "@resvg/resvg-js": "^2.6.2"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 1.2: Создать tsconfig.json**

Создать файл `skills/work/tg-post-writer/tools/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "lib": ["ES2022"]
  },
  "include": ["**/*.ts"]
}
```

- [ ] **Step 1.3: Создать .gitignore**

Создать файл `skills/work/tg-post-writer/tools/.gitignore`:

```
node_modules/
*.log
.DS_Store
```

- [ ] **Step 1.4: Создать заглушку render-cover.ts**

Создать файл `skills/work/tg-post-writer/tools/render-cover.ts`:

```ts
#!/usr/bin/env node
console.error("render-cover.ts: not implemented");
process.exit(2);
```

- [ ] **Step 1.5: Установить зависимости**

Run: `cd skills/work/tg-post-writer/tools && npm install`
Expected: `node_modules/` создаётся, lock-файл `package-lock.json` появляется, exit 0.

- [ ] **Step 1.6: Проверить typecheck**

Run: `cd skills/work/tg-post-writer/tools && npm run typecheck`
Expected: exit 0, ошибок нет.

- [ ] **Step 1.7: Коммит**

```bash
cd /Users/sergeypopov/Desktop/projects/ai-settings
git add skills/work/tg-post-writer/tools/package.json \
        skills/work/tg-post-writer/tools/package-lock.json \
        skills/work/tg-post-writer/tools/tsconfig.json \
        skills/work/tg-post-writer/tools/.gitignore \
        skills/work/tg-post-writer/tools/render-cover.ts
git commit -m "chore(tg-post-writer): поднять скелет tools/ под рендер обложек"
```

---

## Task 2: Шрифт Literata SemiBold

**Files:**
- Create: `skills/work/tg-post-writer/assets/fonts/Literata-Variable.ttf`
- Create: `skills/work/tg-post-writer/assets/fonts/LICENSE.txt`

- [ ] **Step 2.1: Скачать вариативный TTF Literata**

Run:
```bash
mkdir -p skills/work/tg-post-writer/assets/fonts
curl -fSL -o skills/work/tg-post-writer/assets/fonts/Literata-Variable.ttf \
  "https://github.com/googlefonts/literata/raw/main/fonts/ttf/Literata%5Bopsz%2Cwght%5D.ttf"
```

Expected: exit 0. Файл `.ttf` появляется, размер ~400-600 KB.

- [ ] **Step 2.2: Проверить, что файл — валидный TTF**

Run:
```bash
file skills/work/tg-post-writer/assets/fonts/Literata-Variable.ttf
```

Expected: вывод содержит `TrueType Font data` или `OpenType font` (Satori ест оба).

- [ ] **Step 2.3: Скачать SIL OFL лицензию**

Run:
```bash
curl -fSL -o skills/work/tg-post-writer/assets/fonts/LICENSE.txt \
  "https://github.com/googlefonts/literata/raw/main/OFL.txt"
```

Expected: файл `LICENSE.txt` содержит «SIL OPEN FONT LICENSE» в первой строке.

- [ ] **Step 2.4: Коммит**

```bash
git add skills/work/tg-post-writer/assets/fonts/
git commit -m "chore(tg-post-writer): добавить литерату (variable ttf) под обложки"
```

---

## Task 3: `computeFontSize()` — скейл title по длине

**Files:**
- Create: `skills/work/tg-post-writer/tools/lib/title.ts`
- Create: `skills/work/tg-post-writer/tools/tests/title.test.ts`

- [ ] **Step 3.1: Написать падающий тест для computeFontSize**

Создать файл `skills/work/tg-post-writer/tools/tests/title.test.ts`:

```ts
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
  // Эмоджи занимает 2 UTF-16 units, но 1 code point — как символ
  // (Тест на принцип; эмоджи в title валидатором отсеются, но функция должна быть корректной)
  const str = "a".repeat(29) + "🎉"; // 30 code points
  assert.equal(computeFontSize(str), 128);
});
```

- [ ] **Step 3.2: Запустить тест, убедиться что падает**

Run: `cd skills/work/tg-post-writer/tools && npm test`
Expected: FAIL, ошибка вида `Cannot find module '../lib/title.ts'`.

- [ ] **Step 3.3: Реализовать computeFontSize**

Создать файл `skills/work/tg-post-writer/tools/lib/title.ts`:

```ts
export function computeFontSize(title: string): number {
  const length = [...title].length;
  if (length <= 30) return 128;
  if (length <= 60) return 104;
  if (length <= 100) return 80;
  return 64;
}
```

- [ ] **Step 3.4: Запустить тест, убедиться что проходит**

Run: `cd skills/work/tg-post-writer/tools && npm test`
Expected: PASS, все 5 тестов зелёные.

- [ ] **Step 3.5: Коммит**

```bash
git add skills/work/tg-post-writer/tools/lib/title.ts \
        skills/work/tg-post-writer/tools/tests/title.test.ts
git commit -m "feat(tg-post-writer): скейл font-size по длине title"
```

---

## Task 4: `truncateTitle()` — обрезка длинных title до 140

**Files:**
- Modify: `skills/work/tg-post-writer/tools/lib/title.ts`
- Modify: `skills/work/tg-post-writer/tools/tests/title.test.ts`

- [ ] **Step 4.1: Добавить падающие тесты для truncateTitle**

В конец файла `skills/work/tg-post-writer/tools/tests/title.test.ts` добавить:

```ts
import { truncateTitle } from "../lib/title.ts";

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
```

- [ ] **Step 4.2: Запустить тесты, убедиться что падают**

Run: `cd skills/work/tg-post-writer/tools && npm test`
Expected: FAIL — `truncateTitle is not a function` или `Cannot find module`.

- [ ] **Step 4.3: Реализовать truncateTitle**

В файл `skills/work/tg-post-writer/tools/lib/title.ts` дописать:

```ts
const MAX_LEN = 140;

export function truncateTitle(title: string): string {
  const chars = [...title];
  if (chars.length <= MAX_LEN) return title;

  // Режем до 139 и откатываемся до последнего пробела
  const head = chars.slice(0, MAX_LEN - 1);
  const lastSpace = head.lastIndexOf(" ");
  if (lastSpace > 0) {
    return head.slice(0, lastSpace).join("") + "…";
  }
  // Нет пробела в первых 139 — режем жёстко
  return head.join("") + "…";
}
```

- [ ] **Step 4.4: Запустить тесты, убедиться что проходят**

Run: `cd skills/work/tg-post-writer/tools && npm test`
Expected: PASS, все тесты зелёные.

- [ ] **Step 4.5: Коммит**

```bash
git add skills/work/tg-post-writer/tools/lib/title.ts \
        skills/work/tg-post-writer/tools/tests/title.test.ts
git commit -m "feat(tg-post-writer): обрезка длинных title на границе слова"
```

---

## Task 5: `validateTitle()` — валидация входного title

**Files:**
- Modify: `skills/work/tg-post-writer/tools/lib/title.ts`
- Modify: `skills/work/tg-post-writer/tools/tests/title.test.ts`

- [ ] **Step 5.1: Добавить падающие тесты для validateTitle**

В конец `skills/work/tg-post-writer/tools/tests/title.test.ts`:

```ts
import { validateTitle } from "../lib/title.ts";

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
```

- [ ] **Step 5.2: Запустить тесты, убедиться что падают**

Run: `cd skills/work/tg-post-writer/tools && npm test`
Expected: FAIL.

- [ ] **Step 5.3: Реализовать validateTitle**

В `skills/work/tg-post-writer/tools/lib/title.ts` дописать:

```ts
export type ValidationResult = { ok: true } | { ok: false; error: string };

// Regex для базовых эмоджи (covers Emoji_Presentation + most pictographs)
const EMOJI_RE = /\p{Extended_Pictographic}/u;

export function validateTitle(title: string): ValidationResult {
  if (title.trim().length === 0) {
    return { ok: false, error: "title пуст или состоит только из пробелов" };
  }
  if (EMOJI_RE.test(title)) {
    return { ok: false, error: "title содержит эмоджи — по правилам бренда запрещено" };
  }
  return { ok: true };
}
```

- [ ] **Step 5.4: Запустить тесты, убедиться что проходят**

Run: `cd skills/work/tg-post-writer/tools && npm test`
Expected: PASS.

- [ ] **Step 5.5: Коммит**

```bash
git add skills/work/tg-post-writer/tools/lib/title.ts \
        skills/work/tg-post-writer/tools/tests/title.test.ts
git commit -m "feat(tg-post-writer): валидация title (пустой, эмоджи)"
```

---

## Task 6: Рендер — satori + resvg, JSX-template как plain object

**Files:**
- Create: `skills/work/tg-post-writer/tools/lib/render.ts`

- [ ] **Step 6.1: Написать render.ts — сборка template, satori, resvg**

Создать файл `skills/work/tg-post-writer/tools/lib/render.ts`:

```ts
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { computeFontSize, truncateTitle } from "./title.ts";

const CANVAS = 1080;
const PADDING = 88;
const STRIPE_WIDTH = 8;
const TITLE_TOP = 120;
const DOTS_SIZE_SMALL = 24;
const DOTS_SIZE_LARGE = 36;
const DOTS_GAP = 20;

const COLORS = {
  bg: "#F7F4EE",
  accent: "#C0632A",
  textPrimary: "#1A1510",
} as const;

type JSXNode = {
  type: string;
  props: {
    style?: Record<string, unknown>;
    children?: JSXNode | JSXNode[] | string;
  };
};

function buildElement(displayTitle: string, fontSize: number): JSXNode {
  return {
    type: "div",
    props: {
      style: {
        width: CANVAS,
        height: CANVAS,
        background: COLORS.bg,
        display: "flex",
        position: "relative",
        fontFamily: "Literata",
      },
      children: [
        // Левая полоска
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              position: "absolute",
              left: 0,
              top: 0,
              width: STRIPE_WIDTH,
              height: "100%",
              background: COLORS.accent,
            },
          },
        },
        // Title-блок
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              position: "absolute",
              top: TITLE_TOP,
              left: PADDING,
              right: PADDING,
              width: CANVAS - PADDING * 2,
              fontSize: fontSize,
              fontWeight: 600,
              color: COLORS.textPrimary,
              letterSpacing: -1,
              lineHeight: 1.08,
            },
            children: displayTitle,
          },
        },
        // Нижние точки-акценты справа
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              position: "absolute",
              right: PADDING,
              bottom: PADDING,
              alignItems: "center",
              gap: DOTS_GAP,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    width: DOTS_SIZE_SMALL,
                    height: DOTS_SIZE_SMALL,
                    borderRadius: "50%",
                    background: COLORS.accent,
                    opacity: 0.25,
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    width: DOTS_SIZE_LARGE,
                    height: DOTS_SIZE_LARGE,
                    borderRadius: "50%",
                    background: COLORS.accent,
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function loadFont(): Promise<ArrayBuffer> {
  const here = dirname(fileURLToPath(import.meta.url));
  const fontPath = resolve(here, "../../assets/fonts/Literata-Variable.ttf");
  const buf = await readFile(fontPath);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

export async function renderCover(title: string, outPath: string): Promise<void> {
  const displayTitle = truncateTitle(title);
  const fontSize = computeFontSize(displayTitle);

  const fontData = await loadFont();

  const svg = await satori(buildElement(displayTitle, fontSize) as never, {
    width: CANVAS,
    height: CANVAS,
    fonts: [
      {
        name: "Literata",
        data: fontData,
        weight: 600,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, {
    background: COLORS.bg,
    fitTo: { mode: "width", value: CANVAS },
  });
  const png = resvg.render().asPng();

  await writeFile(outPath, png);
}
```

- [ ] **Step 6.2: Проверить typecheck**

Run: `cd skills/work/tg-post-writer/tools && npm run typecheck`
Expected: exit 0, типы сходятся.

- [ ] **Step 6.3: Быстрая дым-проверка рендера**

Создать временный скрипт `/tmp/smoke-render.mjs`:
```js
import { renderCover } from "/Users/sergeypopov/Desktop/projects/ai-settings/skills/work/tg-post-writer/tools/lib/render.ts";
await renderCover("Smoke test обложки", "/tmp/smoke-cover.png");
console.log("ok");
```

Run:
```bash
cd skills/work/tg-post-writer/tools
npx tsx /tmp/smoke-render.mjs
```

Expected: stdout `ok`, файл `/tmp/smoke-cover.png` существует, размер >10 KB.

Дополнительно: `open /tmp/smoke-cover.png` — глазами проверить, что квадрат 1080, фон тёплый, слева оранжевая полоска, title сверху-слева, две точки снизу-справа.

- [ ] **Step 6.4: Коммит**

```bash
git add skills/work/tg-post-writer/tools/lib/render.ts
git commit -m "feat(tg-post-writer): рендер обложки через satori + resvg"
```

---

## Task 7: CLI — парсинг аргументов и exit-коды

**Files:**
- Modify: `skills/work/tg-post-writer/tools/render-cover.ts`

- [ ] **Step 7.1: Реализовать CLI в render-cover.ts**

Переписать файл `skills/work/tg-post-writer/tools/render-cover.ts`:

```ts
#!/usr/bin/env node
import { parseArgs } from "node:util";
import { resolve, isAbsolute } from "node:path";
import { validateTitle } from "./lib/title.ts";
import { renderCover } from "./lib/render.ts";

function die(code: 1 | 2, message: string): never {
  process.stderr.write(`render-cover: ${message}\n`);
  process.exit(code);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      title: { type: "string" },
      out: { type: "string" },
    },
    strict: true,
  });

  const title = values.title;
  const outArg = values.out;

  if (!title) die(1, "--title обязателен");
  if (!outArg) die(1, "--out обязателен");
  if (!isAbsolute(outArg)) die(1, "--out должен быть абсолютным путём");

  const validation = validateTitle(title);
  if (!validation.ok) die(1, validation.error);

  const outPath = resolve(outArg);

  try {
    await renderCover(title, outPath);
  } catch (err) {
    const msg = err instanceof Error ? err.stack ?? err.message : String(err);
    die(2, `ошибка рендера:\n${msg}`);
  }

  process.stdout.write(`${outPath}\n`);
}

main().catch((err) => {
  const msg = err instanceof Error ? err.stack ?? err.message : String(err);
  process.stderr.write(`render-cover: неожиданная ошибка:\n${msg}\n`);
  process.exit(2);
});
```

- [ ] **Step 7.2: Typecheck**

Run: `cd skills/work/tg-post-writer/tools && npm run typecheck`
Expected: exit 0.

- [ ] **Step 7.3: Проверка happy-path через CLI**

Run:
```bash
cd skills/work/tg-post-writer/tools
npx tsx render-cover.ts --title "Claude 4.7: тихий апгрейд в reasoning" --out /tmp/cli-test-1.png
echo "exit: $?"
ls -la /tmp/cli-test-1.png
```

Expected:
- stdout: `/tmp/cli-test-1.png`
- `exit: 0`
- Файл существует, >10 KB.

- [ ] **Step 7.4: Проверка валидации (пустой title → exit 1)**

Run:
```bash
cd skills/work/tg-post-writer/tools
npx tsx render-cover.ts --title "" --out /tmp/nope.png
echo "exit: $?"
```

Expected: stderr содержит «пуст», `exit: 1`.

- [ ] **Step 7.5: Проверка валидации (out не абсолютный → exit 1)**

Run:
```bash
cd skills/work/tg-post-writer/tools
npx tsx render-cover.ts --title "Test" --out ./relative.png
echo "exit: $?"
```

Expected: stderr содержит «абсолютным», `exit: 1`.

- [ ] **Step 7.6: Коммит**

```bash
git add skills/work/tg-post-writer/tools/render-cover.ts
git commit -m "feat(tg-post-writer): cli для render-cover с exit-кодами"
```

---

## Task 8: Golden-path визуальная проверка

**Files:** (без изменений в коде)

Цель — прогнать 5 тест-кейсов из спеки §6.1, глазами убедиться, что макет не разваливается на разных длинах title.

- [ ] **Step 8.1: Рендер 5 тест-кейсов**

Run:
```bash
cd skills/work/tg-post-writer/tools

npx tsx render-cover.ts --title "Короткий тезис" --out /tmp/gold-1-short.png
npx tsx render-cover.ts --title "Claude 4.7: тихий апгрейд в reasoning" --out /tmp/gold-2-medium.png
npx tsx render-cover.ts --title "AI ломает воронку найма, и вот почему это надолго" --out /tmp/gold-3-50.png
npx tsx render-cover.ts --title "Длинный заголовок на границе шестидесяти двух символов нужен для проверки" --out /tmp/gold-4-long.png
npx tsx render-cover.ts --title "$(python3 -c 'print("очень длинный заголовок для проверки обрезки " * 5)')" --out /tmp/gold-5-truncate.png
```

Expected: все 5 команд exit 0, файлы появляются в /tmp.

- [ ] **Step 8.2: Визуальная проверка**

Run: `open /tmp/gold-*.png`

Проверить глазами, отмечая в голове для каждой картинки:
- [ ] квадрат 1080×1080
- [ ] фон `#F7F4EE` (не белый, не серый, тёплый)
- [ ] слева тонкая оранжевая полоска до верха и низа
- [ ] title читается, не выходит за safe-area 88px
- [ ] на короткой (`gold-1`) title — большой, ~128px
- [ ] на `gold-4` title — мельче, ~80px, но всё ещё читаем
- [ ] на `gold-5` заголовок обрезан с `…` в конце, обрезка на границе слова
- [ ] в правом нижнем углу — две оранжевые точки (маленькая полупрозрачная + крупная сплошная)

Если что-то не так — записать в `/tmp/gold-issues.txt` и чинить в отдельной задаче, не в текущей. Если всё ок — пометить шаг выполненным.

- [ ] **Step 8.3: Коммит (без изменений, просто чекпоинт)**

Коммит не нужен — изменений нет. Пометить шаг выполненным и перейти дальше.

---

## Task 9: Интеграция в SKILL.md — шаг 8 и правила cover_title

**Files:**
- Modify: `skills/work/tg-post-writer/SKILL.md`

- [ ] **Step 9.1: Прочитать текущий SKILL.md**

Run: прочитать `skills/work/tg-post-writer/SKILL.md` целиком через Read. Убедиться, что знаешь номера строк текущих разделов.

- [ ] **Step 9.2: Обновить frontmatter (version 1.1.0 → 1.2.0)**

Найти в `SKILL.md` строку `version: 1.1.0` и заменить на `version: 1.2.0`.

- [ ] **Step 9.3: Добавить шаг 8 в секцию Process**

В секции `# Process`, сразу после шага 7 (pre-send checklist), добавить новый пункт:

```markdown
8. **Cover image (опционально).** Если пост длиннее 100 символов — спроси пользователя: «Сгенерить обложку для поста?». Если да:
   - Сформулируй `cover_title` по правилам в секции "Cover title rules" ниже.
   - Покажи `cover_title` пользователю: «Обложка будет с заголовком: `<title>`. Так ок или поправить?». Пользователь может утвердить, попросить переделать или дать свой вариант.
   - После подтверждения вызови скрипт:
     ```
     cd tools && npx tsx render-cover.ts \
       --title "<cover_title>" \
       --out /tmp/meridian-tg-$(date +%Y%m%d-%H%M%S).png
     ```
   - Верни путь к PNG пользователю в формате `file:///tmp/...` для быстрого открытия.
   Если пост короче 100 символов — не предлагай, короткие заметки обходятся без обложки.
```

- [ ] **Step 9.4: Добавить новый раздел "Cover title rules"**

После `# Output` (в конце файла) добавить:

```markdown
# Cover title rules

Title для обложки формулируется **отдельно** от текста поста. В текст поста не попадает — живёт только на картинке.

**Формальные требования:**
- 3-8 слов
- не предложение, не хук-фраза — **тезис**
- третье лицо, нейтральный падеж (не «Смотрите сами…», не «Я думаю…»)
- первая буква заглавная, остальные как в обычном предложении
- без завершающих знаков (`.`, `!`, `?`, `…`)
- без кавычек (правило Meridian: кавычки только для прямой речи)
- без эмоджи, без хэштегов

**Калибровочные примеры:**

| Жанр поста | cover_title |
|---|---|
| Новость про модель | `Claude 4.7: тихий апгрейд в reasoning` |
| Размышление про найм | `AI ломает воронку найма` |
| Разбор инструмента | `Cursor больше не единственный выбор` |
| Опыт / ретроспектива | `Год на AI-агентах: что сломалось` |

**Анти-примеры:**

- «Смотрите сами, Claude 4.7 умнее Opus» — хук-фраза, не тезис
- «Что я думаю про AI-найм» — первое лицо, пустой смысл
- «Claude 4.7 — это новый король reasoning!» — восклицательный
- «Новая модель от Anthropic доступна в API с ценой 3/15 долларов за миллион токенов и контекстом 1 миллион» — не тезис, а простыня

Если пользователь просит переделать — перегенерировать по тем же правилам, не спорить. Если пользователь даёт свой title — использовать как есть (правила — для автогенерации, не для пользовательского ввода).
```

- [ ] **Step 9.5: Быстрая проверка SKILL.md**

Run: прочитать `skills/work/tg-post-writer/SKILL.md` целиком ещё раз. Убедиться, что:
- version 1.2.0 во фронтматтере
- шаг 8 встал после шага 7 до секции "Hard rules"
- раздел "Cover title rules" присутствует в конце
- нет сломанной markdown-разметки

- [ ] **Step 9.6: Коммит**

```bash
git add skills/work/tg-post-writer/SKILL.md
git commit -m "feat(tg-post-writer): шаг 8 — генерация обложки к посту

Добавлен опциональный шаг генерации обложки через
tools/render-cover.ts для постов >100 символов. Правила
формулировки cover_title — в новом разделе SKILL.md.

Bump до 1.2.0."
```

---

## Task 10: CHANGELOG + README + финал

**Files:**
- Modify: `skills/work/tg-post-writer/CHANGELOG.md`
- Modify: `skills/work/tg-post-writer/README.md`

- [ ] **Step 10.1: Добавить запись в CHANGELOG**

В файле `skills/work/tg-post-writer/CHANGELOG.md` сразу после строки `семантическое версионирование.` вставить блок:

```markdown
## [1.2.0] — 2026-04-18

### Добавлено
- `tools/render-cover.ts` — CLI-скрипт для генерации обложек 1080×1080 в стилистике Meridian (тёплый фон `#F7F4EE`, оранжевый акцент `#C0632A`, Literata SemiBold для title). Стек: satori + @resvg/resvg-js.
- `tools/lib/title.ts` — скейл font-size по длине, обрезка длинных title на границе слова, валидация (пустой / эмоджи).
- `tools/lib/render.ts` — JSX-подобное дерево (plain object, без React), рендер через satori → svg → png.
- `tools/tests/` — юнит-тесты через `node:test` для чистой логики title (скейл, обрезка, валидация).
- `assets/fonts/Literata-Variable.ttf` — вариативный TTF из google/literata, SIL OFL.
- В `SKILL.md` — новый опциональный шаг 8 «Cover image» и раздел «Cover title rules» с формальными требованиями, примерами и анти-примерами.

### Изменено
- `SKILL.md` — версия поднята до 1.2.0.
```

- [ ] **Step 10.2: Обновить README**

В файле `skills/work/tg-post-writer/README.md` добавить раздел (в конец файла):

```markdown
## Обложки

Скил может сгенерить квадратную обложку 1080×1080 в стилистике Meridian для поста. Автоматически предлагается после шага 7 (pre-send checklist) для постов длиннее 100 символов.

### Ручной вызов

```bash
cd skills/work/tg-post-writer/tools
npm install  # первый раз
npx tsx render-cover.ts \
  --title "Claude 4.7: тихий апгрейд в reasoning" \
  --out /tmp/meridian-tg-cover.png
```

Вывод на stdout — абсолютный путь к PNG. Exit 0 — успех, 1 — ошибка валидации, 2 — ошибка рендера.

### Структура

- `tools/render-cover.ts` — CLI-точка входа
- `tools/lib/title.ts` — скейл + обрезка + валидация title
- `tools/lib/render.ts` — satori + resvg pipeline
- `assets/fonts/Literata-Variable.ttf` — шрифт (SIL OFL)

Дизайн-спека: `ai-settings/docs/superpowers/specs/2026-04-18-tg-post-cover-design.md`.
```

(Если в существующем README уже есть раздел с похожим заголовком — заменить, не дублировать.)

- [ ] **Step 10.3: Прогнать все тесты ещё раз**

Run: `cd skills/work/tg-post-writer/tools && npm test && npm run typecheck`
Expected: оба зелёные.

- [ ] **Step 10.4: Финальный коммит**

```bash
git add skills/work/tg-post-writer/CHANGELOG.md \
        skills/work/tg-post-writer/README.md
git commit -m "docs(tg-post-writer): changelog 1.2.0 + раздел про обложки в readme"
```

- [ ] **Step 10.5: Проверить git status**

Run: `cd /Users/sergeypopov/Desktop/projects/ai-settings && git status && git log --oneline -15`

Expected:
- `git status` — clean (нет неотслеженных и неподтверждённых изменений).
- `git log` показывает серию коммитов этого плана в правильном порядке.
