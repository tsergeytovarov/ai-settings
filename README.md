# ai-settings

Централизованная библиотека настроек для AI coding-ассистентов: **Claude Code**, **Codex CLI**, **Cursor** и **Gemini CLI**. Единое место, где живут персона агента, стандарты кода, стилистика общения, специализированные субагенты и переиспользуемые скиллы.

Подробный дизайн: [`docs/superpowers/specs/2026-04-18-ai-settings-design.md`](docs/superpowers/specs/2026-04-18-ai-settings-design.md).

## Установка

```bash
git clone https://github.com/tsergeytovarov/ai-settings.git ~/ai-settings
cd ~/ai-settings
./scripts/install.sh
```

Установщик идемпотентный — безопасно запускать повторно. Существующие файлы бэкапятся в `backups/<timestamp>/`.

## Структура

```
ai-settings/
├── AGENTS.md                    # source of truth (читают все платформы)
├── CLAUDE.md / GEMINI.md        # тонкие обёртки с импортом AGENTS.md
├── docs/ai/                     # модули, подключаемые через @imports
├── docs/setup/                  # гайды по подключению (на русском)
├── agents/                      # 6 специализированных субагентов
├── skills/                      # скиллы (code/ и work/), с semver-версионированием
├── settings/                    # эталонные settings.json / config.toml / хуки
├── scripts/                     # install.sh, init-project.sh, sync-cursor.sh, ...
├── examples/                    # курируемые ссылки и промпты
└── tests/skill-lint/            # автопроверки качества скиллов
```

## Использование

**В новом проекте** — ничего делать не надо. Глобальные правила уже применяются автоматически через `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, `~/.gemini/GEMINI.md` (для Cursor — запусти `~/ai-settings/scripts/sync-cursor.sh --project .` один раз в проекте).

**Для проектной специфики** — в корне проекта:

```bash
~/ai-settings/scripts/init-project.sh
```

Положит локальный `AGENTS.md` (additive-слой поверх глобального), `.claude/settings.json` и обновит `.gitignore`.

## Обновление

```bash
cd ~/ai-settings
git pull
./scripts/install.sh
```

Симлинки не пересоздаются — новое содержимое подхватывается автоматически.

## Документация

- [Подключение Claude Code](docs/setup/claude-code.md)
- [Подключение Codex CLI](docs/setup/codex.md)
- [Подключение Cursor](docs/setup/cursor.md)
- [Подключение Gemini CLI](docs/setup/gemini.md)
- [Новый проект](docs/setup/new-project.md)

## Лицензия

MIT — см. [LICENSE](LICENSE).
