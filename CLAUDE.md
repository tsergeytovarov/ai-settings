# CLAUDE.md

<!-- Claude Code entry point. Imports AGENTS.md — the source of truth for all AI platforms. -->

@./AGENTS.md

## Claude Code-specific notes

- Always use the `Skill` tool (never `Read` on skill files) when invoking a skill.
- Use `TodoWrite` for tasks with 3+ steps; keep exactly one item `in_progress` at a time.
- Use the `Agent` tool with `subagent_type` to delegate heavy, isolated tasks (see `~/.claude/agents/` or `./agents/` in this repo).
- Before complex work: check the session's skill list; if there is even a 1% chance a skill matches — invoke it (per `superpowers:using-superpowers`).
- `Write` and `Edit` require a prior `Read` of the target file — don't try to edit blind.

## Подсказки по модели и усилию

В конце каждого ответа, где предлагается следующий шаг или запускается задача, добавляй подсказку формата:

> 💡 *Для этого подойдёт **[модель]** + **[effort]***

Маппинг:
- **Haiku** — поиск по кодовой базе, explore-агенты, bash-команды, саммари, простые правки. Effort: не нужен.
- **Sonnet** — большинство задач: коммиты, PR, объяснения, скилы, планирование, рефакторинг. Effort: medium (по умолчанию).
- **Opus** — архитектурные решения, глубокий code review, дизайн-ревью, сложный дебаг, длинный контекст, ресёрч. Effort: high или xhigh.

Effort уровни: `low` / `medium` / `high` / `xhigh` — переключаются командой `/effort`.
Модель — командой `/model`.

Подсказку давай кратко, одной строкой, только когда уместно (не к каждому техническому ответу).

## MCP-серверы

Не вызывай инструменты MCP-серверов (Notion, Confluence, Claude_in_Chrome, scheduled-tasks) без явной просьбы пользователя.

## Session hooks

The `SessionStart` hook at `~/.claude/hooks/session-start-reminder.sh` prints a short summary of available skills and subagents at the start of each session.
Silence with `AI_SETTINGS_QUIET=1` in the environment.
