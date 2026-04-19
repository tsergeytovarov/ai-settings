# ai-settings

Централизованная библиотека настроек для AI coding-ассистентов: **Claude Code**, **Codex CLI**, **Cursor** и **Gemini CLI**. Единое место, где живут персона агента, стандарты кода, стилистика общения, специализированные субагенты и переиспользуемые скиллы.

Подробный дизайн: [`docs/superpowers/specs/2026-04-18-ai-settings-design.md`](docs/superpowers/specs/2026-04-18-ai-settings-design.md).

## Установка

> ⚠️ **СТОП. Прочитай это перед `install.sh`.**
>
> Это мой личный пресет: персона «Борис», русский язык, мой стек (Python/TypeScript/Next.js/FastAPI/Yandex Cloud), мои скиллы (русские коммиты, посты в TG).
>
> **Сначала** клонируй репо и пройди [docs/setup/customization.md](docs/setup/customization.md) — там чеклист, что править (persona, style, стек) и готовые промпты под каждую секцию (LLM задаст 4–6 вопросов и вернёт готовый файл).
>
> **Потом** запускай `install.sh`. Иначе ассистент будет вести себя как я, а не как ты.

```bash
git clone https://github.com/tsergeytovarov/ai-settings.git ~/ai-settings
cd ~/ai-settings

# 1. Кастомизируй под себя — см. docs/setup/customization.md
# 2. Установи:
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
├── skills/                      # скиллы в skills/<namespace>/, с semver-версионированием
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

## Скиллы в Claude Desktop

Claude Desktop не читает `~/.claude/skills/` (это канал Claude Code CLI). Нативного watched-folder у него тоже нет — скиллы добавляются только через Upload в Settings. Но после первой загрузки Desktop разворачивает скилл в открытую папку в `Library/Application Support/Claude/...`, куда можно класть обновления напрямую. На этом построена схема `deploy-skills.sh`:

```bash
./scripts/deploy-skills.sh
```

Скрипт:
- прогоняет `install.sh` (Claude Code + Codex + Gemini + Cursor);
- пакует каждый скилл в zip в `dist/claude-desktop-skills/` — для **первой** загрузки через UI;
- для скиллов, которые **уже** загружены, делает rsync из репы прямо в папку Desktop (щадящий режим, без `--delete` — ничего чужого не удаляется).

Порядок работы:

1. Первый раз — Settings → Capabilities → Skills → Upload, перетащи zip'ы из открывшейся папки, включи тумблеры.
2. Дальше — просто `./scripts/deploy-skills.sh` после правок в репе, перезапусти Desktop, обновления подхватываются.

Если в репе появляется новый скилл, которого ещё нет в Desktop, — скрипт подсветит его в списке «требует первой загрузки».

## Документация

- [Кастомизация под себя](docs/setup/customization.md) ← **начни отсюда**
- [Подключение Claude Code](docs/setup/claude-code.md)
- [Подключение Codex CLI](docs/setup/codex.md)
- [Подключение Cursor](docs/setup/cursor.md)
- [Подключение Gemini CLI](docs/setup/gemini.md)
- [Новый проект](docs/setup/new-project.md)

## Лицензия

MIT — см. [LICENSE](LICENSE).
