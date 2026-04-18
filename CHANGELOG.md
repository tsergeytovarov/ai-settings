# CHANGELOG

Все значимые изменения в этом репозитории фиксируются здесь.
Формат — [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/), версионирование по [Semantic Versioning](https://semver.org/lang/ru/).

## [Unreleased]

(ничего)

## [0.1.0] — 2026-04-18

### Первый релиз

- `AGENTS.md` с 13 секциями + 11 модулей `docs/ai/` (persona, style, commands, coding-standards, python, typescript, git-workflow, red-flags, three-tiers, hard-gates, ml).
- Персона «Борис» + 6 специализированных субагентов (`code-reviewer`, `debugger`, `fastapi-backend`, `next-frontend`, `ml-helper`, `pr-writer`).
- 4 скилла: `ru-commit-message`, `ru-pr-description`, `changelog-entry`, `tg-post-writer`.
- `skill-lint` (pytest, 9 проверок) с negative fixture — 37 тестов, все зелёные.
- Установщики: `install.sh`, `init-project.sh`, `sync-cursor.sh`, `bump-skill-version.sh`.
- GitHub Actions CI: `skill-lint`, `check-imports`, `markdown-lint` (warnings only).
- Setup-гайды для Claude Code / Codex / Cursor / Gemini CLI (русский, `docs/setup/`).
- `examples/` — курируемые ссылки (стандарты, практики, тулзы) и структура промптов.

### Известные нюансы

- CI на момент релиза не прогнан — GitHub Actions заблокирован верификацией биллинга владельца аккаунта. Локально `pytest` и `sync-cursor.sh --check` зелёные. Разблокировка отложена отдельной задачей.
