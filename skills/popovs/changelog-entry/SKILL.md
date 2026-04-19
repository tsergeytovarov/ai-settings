---
name: changelog-entry
version: 1.0.0
description: |
  Use when the user asks "обнови changelog / добавь запись в changelog", or after a
  user-visible change is committed.
  Also trigger automatically after a `feat:` or `fix:` commit.
  SKIP: for `chore:`, `docs:`, `test:`, `refactor:`, `style:`, `ci:`, `build:` commits
  unless the change is user-facing.
category: code
tags: [changelog, keep-a-changelog, russian]
---

# Purpose

Add an entry to the repo's root `CHANGELOG.md` following Keep a Changelog format, in Russian.

# Process

1. Read the root `CHANGELOG.md`.
2. Find or create the `## [Unreleased]` section.
3. Determine the sub-section from the commit type:
   - `feat:` → `### Добавлено`
   - `fix:` → `### Исправлено`
   - breaking / removal → `### Удалено`
   - behavior change that isn't add/fix/remove → `### Изменено`
4. Add one line in Russian, active voice, describing what the **user** sees change.
5. Preserve all other entries and sections exactly.

# Anti-patterns

- Mentioning implementation details (file names, function renames) unless user-visible.
- Duplicating an entry that already exists.
- Writing "added new feature" without specifics.
- Editing entries under a released version (only `[Unreleased]` is mutable).

# Output

Updated `CHANGELOG.md` content (full file) or a unified diff.
Ask the user to confirm before writing.
