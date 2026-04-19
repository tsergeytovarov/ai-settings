# CHANGELOG

Все значимые изменения в этом репозитории фиксируются здесь.
Формат — [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/), версионирование по [Semantic Versioning](https://semver.org/lang/ru/).

## [Unreleased]

## [0.2.2] — 2026-04-20

### Добавлено
- Секция `## Codex Skills` в `AGENTS.md` — объясняет модели, что скиллы из `.claude/skills/` не видны Codex нативно; как использовать их вручную и как устанавливать в `~/.agents/skills/`; предупреждение про namespace (`popovs:write-meridian-article` → `write-meridian-article`).
- `scripts/install.sh` — новая секция: создаёт `~/.agents/skills/` и симлинкует каждый скилл из репо без namespace-префикса. Идемпотентно, работает с `--dry-run`.

## [0.2.1] — 2026-04-19

### Добавлено
- Раздел Compression в `docs/ai/style.md` — тёрсный стиль для ответов AI, не затрагивает генерируемый контент (коммиты, посты, docs).
- Интеграция RTK (Rust Token Killer): PreToolUse hook `settings/hooks/rtk-rewrite.sh` сжимает вывод bash-команд на 60–90%; awareness-документ `docs/ai/rtk-awareness.md` с мета-командами и предупреждением про коллизию пакетов; автоустановка в `scripts/install.sh`.
- Compact Instructions в `AGENTS.md` — директива для auto-compaction: что сохранять, что выбрасывать при сжатии контекста.
- Windows-инструкции во всех setup-доках `docs/setup/` — пути, команды, установка зависимостей.
- Проверка rtk-бинарника в `settings/hooks/session-start-reminder.sh` — предупреждение, если rtk не установлен.

### Изменено
- `docs/ai/writing-voice.md` — сокращён с 6.8KB до ~3KB: убрано дублирование с tg-post-writer style-guide.
- `AGENTS.md` — `ml.md` вынесен из постоянной цепочки (загружать вручную для ML-проектов через `@./docs/ai/ml.md`); добавлен импорт `rtk-awareness.md`; добавлена секция Compact Instructions.
- `settings/claude-settings.json` — добавлен PreToolUse hook для rtk-rewrite.
- `scripts/install.sh` — Windows-детекция; автоустановка rtk; авто-мерж `permissions` и `hooks` в существующий `~/.claude/settings.json` через jq.

### Исправлено
- `scripts/install.sh` — `_generate_skill_commands` больше не завершалась с exit 1 при `--dry-run`.

## [0.2.0] — 2026-04-19

### Добавлено
- Скилл `skills/popovs/boilerplate` — одна команда (`/popovs:boilerplate`) разворачивает новый проект: скачивает актуальный шаблон из публичного репо `tsergeytovarov/popovs-boilerplate`, подставляет плейсхолдеры, копирует снэпшот AI-правил, генерирует `docs/DEPLOY.md` с точными командами для VM, создаёт GitHub репо и делает начальный коммит. Поддерживает 4 стека: `nextjs-fastapi`, `fastapi-only`, `landing`, `docs`.
- Репо `tsergeytovarov/popovs-boilerplate` (публичный) — рабочие шаблоны для всех четырёх стеков. Каждый стек верифицирован: docker-compose up поднимается, `/health` отдаёт 200, mkdocs build проходит, HTML валиден.
- `scripts/deploy-skills.sh` — одна команда разворачивает скиллы на все платформы: прогоняет `install.sh` (Claude Code + Codex + Gemini + Cursor), пакует скиллы в zip для Claude Desktop и **авто-синкает обновления** в уже загруженные скиллы через rsync. Режим щадящий (без `--delete`) — чужие файлы не трогаются. Первая загрузка через UI (zip в `dist/claude-desktop-skills/`), последующие апдейты — автоматически.
- `docs/ai/writing-voice.md` — модуль голоса для всего **генерируемого контента**: коммиты, PR, CHANGELOG, TODO, документация, TG-посты, статьи. Явно прописано, где **не** применяется: UI-строки продукта, ошибки для конечных пользователей, формальная API-дока, чат-ответы (на них действует `style.md`). Содержит правила: присутствие автора, разделение факта и мнения, гипербола как приём, стоп-лист канцелярита/инфобиза, жёсткое правило про кавычки, руководство по тону коммитов.
- Скилл `skills/popovs/tg-post-writer` поднят до **1.1.0**: полный стайл-гайд канала, 10 эталонных постов по жанрам, блок required reading и вызов чек-листа перед возвратом в `SKILL.md`.

### Изменено
- `AGENTS.md` — добавлена секция **3. Writing Voice** с импортом `docs/ai/writing-voice.md`. Секции сдвинуты.
- README — предупреждение о кастомизации перенесено **перед** блоком установки.

## [0.1.2] — 2026-04-18

### Добавлено
- `docs/setup/customization.md` — гайд для тех, кто клонирует репо: что надо поправить под себя (персона, стиль, стек, скиллы) и чего не трогать (генерируемые файлы, симлинки). Ссылка добавлена в README со статусом «начни отсюда».
- В `docs/setup/customization.md` — готовые промпты под каждую редактируемую секцию (persona, style, стек, commands, git-workflow, язык-специфичные модули, скиллы, субагенты, safety-rules). Промпт задаёт 4–6 вопросов по одному и возвращает готовый markdown на английском.

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
