# Skills

Библиотека кастомных скиллов для AI-платформ (Claude Code, Codex, Cursor, Gemini CLI).

Разделение:
- `code/` — скиллы для кодинг-задач (commit-сообщения, PR-описания, changelog и т.д.).
- `work/` — скиллы для работы, не связанной напрямую с кодом (тексты, посты, research).

## Правила

1. Каждый скилл — отдельная папка с именем в `kebab-case`.
2. Имя папки совпадает с полем `name` в YAML frontmatter `SKILL.md`.
3. Обязательные файлы в папке скилла:
   - `SKILL.md` — основной файл на английском с YAML frontmatter.
   - `CHANGELOG.md` — история изменений скилла, на русском, формат Keep a Changelog.
   - `README.md` — человеко-читаемое описание на русском (что делает, как вызывается, примеры).
4. Опциональные файлы:
   - `references/` — справочные материалы (шаблоны, примеры вывода, выжимки из документации).
   - `tests/fixtures.md` — тестовые кейсы для skill-lint.

## Шаблон `SKILL.md`

```markdown
---
name: <kebab-case, совпадает с именем папки>
version: 1.0.0
description: |
  Use when <явный триггер: когда пользователь прямо просит>.
  Also trigger automatically when <автоматический триггер: паттерн в контексте>.
  SKIP: <явный анти-триггер: когда НЕ вызывать>.
category: code | work
tags: [git, markdown, russian, ...]
---

# Purpose
<Одно предложение: что делает скилл и зачем.>

# Process
1. ...
2. ...

# Output format
<Формат вывода — в идеале с коротким примером.>
```

## Требования к полю `description`

- **Минимум 100 символов** — модель должна понимать, когда вызывать скилл.
- Явно содержит фразу `Use when` или `Trigger`.
- Явно содержит фразу `SKIP` или `Do NOT use`.
- Даёт модели достаточно сигналов, чтобы самой решить — вызывать или нет.

Плохой description (не пройдёт skill-lint):
> `description: generates commits`

Хороший description:
> `description: "Use when the user asks 'напиши коммит' or before git commit with no message. SKIP: if the user already wrote a message, or for merge commits."`

## Версионирование

- Semver (`major.minor.patch`) в поле `version` frontmatter.
- `CHANGELOG.md` внутри папки скилла — запись для каждой версии.
- Помощник: `scripts/bump-skill-version.sh <skill-path> <major|minor|patch>` автоматизирует бамп + запись в CHANGELOG + commit.

## Skill-lint

Все скиллы автоматически проверяются через `pytest tests/skill-lint/`. Линт прогоняется локально перед коммитом — вручную или через pre-commit hook. Список проверок см. в `tests/skill-lint/README.md`.

## Стартовый набор

- `code/ru-commit-message` — conventional commit на русском из staged diff.
- `code/ru-pr-description` — PR-описание на русском по шаблону.
- `code/changelog-entry` — запись в корневой `CHANGELOG.md` проекта.
- `work/tg-post-writer` — Telegram-посты в личной стилистике.
