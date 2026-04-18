# CHANGELOG

Все значимые изменения в этом репозитории фиксируются здесь.
Формат — [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/), версионирование по [Semantic Versioning](https://semver.org/lang/ru/).

## [Unreleased]

(ничего)

## [0.1.1] — 2026-04-18

### Изменено
- `~/.codex/AGENTS.md` теперь не симлинк, а плоский файл с развёрнутыми `@imports`. Codex CLI не резолвит `@imports` в стиле Claude/Gemini и при симлинке видел только верхний уровень — модули `docs/ai/*.md` до модели не доходили. `install.sh` вызывает `sync-cursor.sh --codex` для генерации.
- `sync-cursor.sh` получил флаг `--codex` (плоский вывод без Cursor frontmatter в `~/.codex/AGENTS.md`). Путь к скрипту и семантика `--global` / `--project` не изменились.

### Удалено
- `.github/workflows/ci.yml` — GitHub Actions на аккаунте заблокирован биллингом, а для личной библиотеки CI не нужен. Локальный `pytest tests/` остаётся основным способом проверки.
- `settings/codex-config.toml` — содержал выдуманные `[agents]/[behavior]` поля, которых в реальной схеме Codex CLI нет. Codex читает `~/.codex/AGENTS.md` без доп. настроек, эталон не нужен.

### Исправлено
- `docs/setup/codex.md` — описание теперь соответствует фактической логике (flat-файл, а не симлинк).
- `docs/setup/cursor.md` — убрано упоминание удалённого CI в разделе про `--check`.

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
