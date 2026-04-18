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

  if (title === undefined) die(1, "--title обязателен");
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
