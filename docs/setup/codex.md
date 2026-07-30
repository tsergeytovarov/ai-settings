# Codex CLI — подключение `ai-settings`

## После `scripts/install.sh`

Проверь, что на месте плоский AGENTS.md с развёрнутыми импортами:

```bash
ls -la ~/.codex/AGENTS.md
# -> обычный файл, ~20 КБ (не симлинк)
```

Почему не симлинк: Codex **не резолвит `@imports`** в стиле Claude/Gemini. Если положить туда симлинк на исходный `AGENTS.md` с `@docs/ai/persona.md`, Codex увидит только строку `@docs/ai/persona.md` как текст и не загрузит содержимое. Поэтому `install.sh` вызывает `sync-cursor.sh --codex`, который разворачивает все `@imports` прямо в тело файла.

## Обновление после `git pull`

```bash
cd ~/ai-settings && git pull
~/ai-settings/scripts/install.sh
```

`install.sh` перегенерирует плоский `~/.codex/AGENTS.md`. Вручную прогонять ничего не надо.

Если хочется обновить только Codex без остального — напрямую:

```bash
~/ai-settings/scripts/sync-cursor.sh --codex
```

## `config.toml`

`~/.codex/config.toml` **не трогается** установщиком — там твои настройки модели, плагинов, trusted projects. В репе эталона больше нет — было фиктивное содержимое, удалено в v0.1.1.

## Скиллы

`install.sh` создаёт симлинки личных скиллов в `~/.agents/skills/<skill-name>/`.
Codex читает их как personal skills после перезапуска приложения.

Проверка:

```bash
find -L ~/.agents/skills -maxdepth 2 -name SKILL.md -print
```

Если добавил или переименовал скилл в `skills/`, запусти:

```bash
~/ai-settings/scripts/install.sh
```

Потом перезапусти Codex. Без перезапуска список скиллов может остаться старым.

## Субагенты

У Codex нет такой же системы субагентов, как у Claude Code. Но плоский `AGENTS.md` содержит ссылки на `agents/*/AGENT.md` в репе — модель может имитировать роли при ручном запросе:

> «ты сейчас code-reviewer, проверь этот diff по правилам из `~/ai-settings/agents/code-reviewer/AGENT.md`»

## Что глобально применено к Codex

После `install.sh` Codex получает:

- плоский `~/.codex/AGENTS.md` со всеми правилами общения, персоной Бориса, hard gates, git workflow и platform-wide notes;
- personal skills из `~/.agents/skills/`;
- текущий `~/.codex/config.toml` остаётся пользовательским: модель, плагины и trusted projects не перезаписываются.

## Проверка

Запусти Codex в произвольной папке, задай:

> «напиши коммит»

Если модель предлагает Conventional Commits с русским описанием (`feat(scope): ...`) и не ломает персону Бориса — правила подхвачены. Если выдаёт generic английский — значит плоский файл не прогрузился; проверь `head ~/.codex/AGENTS.md` и перегенерируй через `sync-cursor.sh --codex`.

## Windows

`install.sh` требует bash (macOS/Linux или WSL).

**WSL (рекомендуется):** запустить `./scripts/install.sh` из WSL-терминала.

**Без WSL (вручную):**
```powershell
# В PowerShell:
Copy-Item "AGENTS.md" "$env:USERPROFILE\.codex\AGENTS.md"
```

> Путь на Windows: `%USERPROFILE%\.codex\AGENTS.md`
