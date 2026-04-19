---
name: ru-pr-description
version: 1.0.0
description: |
  Use when the user asks "напиши PR / сгенерь PR description / опиши что я делал в этой ветке".
  Also trigger automatically before `gh pr create` when no `--body` argument was provided.
  SKIP: if the PR already has a description, or for draft PRs explicitly marked "wip".
category: code
tags: [git, github, pr, russian]
---

# Purpose

Generate a Russian PR title + description from the branch diff and commit history.

# Process

1. Determine the base branch (`main` by default, or from a user-supplied argument).
2. `git log --oneline <base>..HEAD` — list commits in this branch.
3. `git diff <base>...HEAD --stat` — files changed.
4. `git diff <base>...HEAD` — full diff if under ~500 lines; otherwise summarize from stat + commit messages.
5. Write the **title** in Russian: one line, under 70 chars.
6. Write the **body** using the template below.

# Template (Russian)

```markdown
## TL;DR
<1–2 предложения: что и зачем>

## Что изменилось
- <пункт>
- <пункт>

## Как тестировал
- <команды или ручные шаги>
- <результат>

## Чек-лист
- [x] Тесты проходят
- [x] Линтер чист
- [ ] Changelog обновлён (если есть user-visible изменения)
- [ ] Документация обновлена (если изменился публичный API)
```

# Output

Full title + body text, ready to paste into `gh pr create --title "..." --body "..."` or the GitHub UI.

# Anti-patterns

- Description in English.
- TL;DR that just lists commit types ("добавлены feat, fix").
- Copying the full diff into the description.
- Skipping the checklist.
