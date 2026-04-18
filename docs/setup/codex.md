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

## Нюанс: скиллы и субагенты

У Codex нет нативной системы скиллов и субагентов как у Claude Code. Но плоский `AGENTS.md` содержит ссылки на `agents/*/AGENT.md` и `skills/*/SKILL.md` в репе — модель может имитировать роли при ручном запросе:

> «ты сейчас code-reviewer, проверь этот diff по правилам из `~/ai-settings/agents/code-reviewer/AGENT.md`»

## Проверка

Запусти Codex в произвольной папке, задай:

> «напиши коммит»

Если модель предлагает Conventional Commits с русским описанием (`feat(scope): ...`) и не ломает персону Бориса — правила подхвачены. Если выдаёт generic английский — значит плоский файл не прогрузился; проверь `head ~/.codex/AGENTS.md` и перегенерируй через `sync-cursor.sh --codex`.
