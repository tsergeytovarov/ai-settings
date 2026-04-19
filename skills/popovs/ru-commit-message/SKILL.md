---
name: ru-commit-message
version: 1.0.0
description: |
  Use when the user asks "напиши коммит / сгенерь commit message / опиши этот diff as commit".
  Also trigger automatically before `git commit` if no message was provided.
  SKIP: if the user already wrote a commit message, or for trivial merge/revert commits.
category: code
tags: [git, conventional-commits, russian]
---

# Purpose

Generate a conventional-commit message in Russian from the current staged diff.

# Process

1. Run `git diff --staged` to read what's actually being committed.
2. Classify the change: `feat` / `fix` / `chore` / `refactor` / `docs` / `test` / `style` / `perf` / `ci` / `build`.
3. Pick scope (optional) — module or component name, lowercase, English, from changed file paths.
4. Write the description in Russian, imperative mood, lowercase start, no trailing period, ≤72 chars.
5. If the change is non-trivial — add a body paragraph in Russian explaining **WHY**, not WHAT. Wrap at ~72 chars.
6. Output the message ready to paste into `git commit -m`.

# Format

```
<type>(<scope>): <описание на русском>

<опциональное тело на русском, объясняет ПОЧЕМУ>
```

# Examples

See `references/examples.md`.

# Anti-patterns

- Body explaining WHAT changed (diff already shows that).
- Description in English.
- Description over 72 chars.
- Including file paths in the description when scope already covers it.
