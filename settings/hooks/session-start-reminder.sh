#!/usr/bin/env bash
# SessionStart reminder for Claude Code: quick inventory of skills and agents.
# Silence with AI_SETTINGS_QUIET=1.

set -euo pipefail

if [[ "${AI_SETTINGS_QUIET:-0}" == "1" ]]; then
  exit 0
fi

SKILLS_DIR="${HOME}/.claude/skills"
AGENTS_DIR="${HOME}/.claude/agents"

skill_count=0
agent_count=0

if [[ -d "$SKILLS_DIR" ]]; then
  skill_count=$(find "$SKILLS_DIR" -mindepth 2 -maxdepth 3 -name SKILL.md 2>/dev/null | wc -l | tr -d ' ')
fi

if [[ -d "$AGENTS_DIR" ]]; then
  agent_count=$(find "$AGENTS_DIR" -mindepth 2 -maxdepth 2 -name AGENT.md 2>/dev/null | wc -l | tr -d ' ')
fi

RTK_HOOK="$HOME/.claude/hooks/rtk-rewrite.sh"
RTK_WARNING=""
if [[ -f "$RTK_HOOK" ]] && ! command -v rtk &>/dev/null; then
  RTK_WARNING=$'\nrtk hook is wired but rtk binary not found. Install: brew install rtk'
fi

cat <<EOF
[ai-settings] Loaded: ${skill_count} skill(s), ${agent_count} subagent(s).
Reminder: check for relevant skill/subagent BEFORE non-trivial tasks.
Silence: AI_SETTINGS_QUIET=1${RTK_WARNING}
EOF
