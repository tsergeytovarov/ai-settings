# CLAUDE.md

<!-- Claude Code entry point. Imports AGENTS.md — the source of truth for all AI platforms. -->

@./AGENTS.md

## Claude Code-specific notes

- Always use the `Skill` tool (never `Read` on skill files) when invoking a skill.
- Use `TodoWrite` for tasks with 3+ steps; keep exactly one item `in_progress` at a time.
- Use the `Agent` tool with `subagent_type` to delegate heavy, isolated tasks (see `~/.claude/agents/` or `./agents/` in this repo).
- Before complex work: inspect descriptions of potentially relevant skills.
  Invoke a skill only when its stated trigger matches the task; checking the
  list is not permission to start every remotely related workflow.
- `Write` and `Edit` require a prior `Read` of the target file — don't try to edit blind.

## Claude Code controls

Model switches use `/model`. Effort switches use `/effort` with `low`, `medium`, `high`, or `xhigh`.

## Session hooks

The `SessionStart` hook at `~/.claude/hooks/session-start-reminder.sh` prints a short summary of available skills and subagents at the start of each session.
Silence with `AI_SETTINGS_QUIET=1` in the environment.
