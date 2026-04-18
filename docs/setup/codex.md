# Codex CLI — подключение `ai-settings`

## После `scripts/install.sh`

Проверь симлинк:

```bash
ls -la ~/.codex/AGENTS.md
# -> ~/ai-settings/AGENTS.md
```

## `config.toml`

`~/.codex/config.toml` **не перезаписывается** установщиком. Эталон лежит в `settings/codex-config.toml` — сравни и вручную смерджи нужное:

```bash
diff ~/.codex/config.toml ~/ai-settings/settings/codex-config.toml
```

## Нюанс: скиллы и субагенты

У Codex нет нативной системы скиллов и субагентов как у Claude Code. Но `AGENTS.md` читается как обычный текст — роли и триггеры из `agents/*/AGENT.md` модель может имитировать при ручном запросе:

> «ты сейчас code-reviewer, проверь этот diff по правилам из agents/code-reviewer/AGENT.md»

## @imports

Codex не резолвит `@docs/ai/*.md` автоматически — видит их как ссылки в тексте. Два варианта:

1. **Довериться модели** — она увидит путь `@docs/ai/persona.md` и при необходимости сама «сходит» в файл. Работает для Claude-style моделей прилично.
2. **Inline-копия критичного** — если нужно максимальное compliance, добавь в `~/.codex/AGENTS.md` inline-копию важного (persona, hard-gates). Минус: дрейф при обновлении глобальных правил.

Гибкость на твоё усмотрение. Для старта — вариант 1.

## Обновление

```bash
cd ~/ai-settings && git pull
```

Симлинк остаётся валидным. Если менял `~/.codex/config.toml` — пересмотри diff с эталоном после pull.
