#!/usr/bin/env node
import { parseArgs } from "node:util";
import { isAbsolute } from "node:path";
import { validateTitle } from "./lib/title.ts";
import { renderCover } from "./lib/render.ts";

function die(code: 1 | 2, message: string): never {
  process.stderr.write(`render-cover: ${message}\n`);
  process.exit(code);
}

async function main(): Promise<void> {
  let values: { title?: string; out?: string };
  try {
    ({ values } = parseArgs({
      options: {
        title: { type: "string" },
        out: { type: "string" },
      },
      strict: true,
    }));
  } catch (err) {
    die(1, err instanceof Error ? err.message : String(err));
  }

  const title = values.title;
  const outArg = values.out;

  if (title === undefined) die(1, "--title обязателен");
  if (!outArg) die(1, "--out обязателен");
  if (!isAbsolute(outArg)) die(1, "--out должен быть абсолютным путём");

  const validation = validateTitle(title);
  if (!validation.ok) die(1, validation.error);

  try {
    await renderCover(title, outArg);
  } catch (err) {
    const msg = err instanceof Error ? err.stack ?? err.message : String(err);
    die(2, `ошибка рендера:\n${msg}`);
  }

  process.stdout.write(`${outArg}\n`);
}

main().catch((err) => {
  const msg = err instanceof Error ? err.stack ?? err.message : String(err);
  process.stderr.write(`render-cover: неожиданная ошибка:\n${msg}\n`);
  process.exit(2);
});
