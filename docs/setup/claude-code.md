# Claude Code — подключение `ai-settings`

## После первого запуска `scripts/install.sh`

Проверь, что всё на месте:

```
ls -la ~/.claude/
# ожидаем:
# CLAUDE.md -> ~/ai-settings/CLAUDE.md
# agents   -> ~/ai-settings/agents
# skills   -> ~/ai-settings/skills
# hooks    -> ~/ai-settings/settings/hooks
# settings.json  (копия, не симлинк)
```

## Проверка загрузки

Запусти `claude` в любой папке. В начале сессии должен появиться hook-баннер:

```
[ai-settings] Loaded: N skill(s), M subagent(s).
```

Если не появился — либо выставлен `AI_SETTINGS_QUIET=1`, либо хуку не проставлен исполняемый бит.

## Обновление правил

```bash
cd ~/ai-settings && git pull && ./scripts/install.sh
```

Симлинки не трогаются — новое содержимое подхватывается автоматически.
Файл `~/.claude/settings.json` (он копия, не симлинк) **не перетирается** — сравни вручную:

```bash
diff ~/.claude/settings.json ~/ai-settings/settings/claude-settings.json
```

## Проектные переопределения

В корне проекта:

```bash
~/ai-settings/scripts/init-project.sh
```

Это создаст:
- локальный `AGENTS.md` (additive — поверх глобальных правил),
- `.claude/settings.json` с пустыми `allow/ask/deny` для project-специфичных permissions,
- обновит `.gitignore` AI-артефактами (`.claude/sessions/`, `.claude/cache/`).

## Нюансы

- Глобальный слой применяется автоматически ко всем проектам через `~/.claude/CLAUDE.md` — не надо импортировать его из проектного `AGENTS.md`.
- Если нужно временно «заглушить» хук в конкретной сессии: `AI_SETTINGS_QUIET=1 claude`.
