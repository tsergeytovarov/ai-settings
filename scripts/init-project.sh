#!/usr/bin/env bash
# Project-level init: add additive AGENTS.md, settings, Cursor rules to a project.
# Run from the project root: `~/ai-settings/scripts/init-project.sh`

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AI_SETTINGS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
export AI_SETTINGS_ROOT
source "$SCRIPT_DIR/lib/common.sh"

PROJECT_ROOT="${1:-$PWD}"
PROJECT_ROOT="$(cd "$PROJECT_ROOT" && pwd)"

log_info "Initializing ai-settings for project: $PROJECT_ROOT"

# Project-specific AGENTS.md (additive; global layer auto-applies via ~/.claude, ~/.codex, ~/.gemini)
project_agents="$PROJECT_ROOT/AGENTS.md"
if [[ ! -f "$project_agents" ]]; then
  cat > "$project_agents" <<'EOF'
# AGENTS.md (project-local)

<!-- Additive layer. Global rules apply automatically via ~/.claude/CLAUDE.md,
     ~/.codex/AGENTS.md, ~/.gemini/GEMINI.md (symlinked to ~/ai-settings). -->

## Project context
<!-- TODO: опиши проект в 2-3 предложениях -->

## Tech stack (project-specific)
<!-- TODO: конкретные версии и фреймворки этого проекта -->

## Local conventions
<!-- TODO: проектные решения, отличающиеся от глобальных -->

## Commands (project-specific)
<!-- TODO: команды, специфичные для этого проекта -->
EOF
  log_ok "Created $project_agents"
else
  log_warn "$project_agents exists; not overwriting"
fi

# Project .claude/settings.json — minimal override if absent
claude_dir="$PROJECT_ROOT/.claude"
ensure_dir "$claude_dir"
project_settings="$claude_dir/settings.json"
if [[ ! -f "$project_settings" ]]; then
  cat > "$project_settings" <<'EOF'
{
  "$schema": "https://json.schemastore.org/claude-code-settings",
  "permissions": {
    "allow": [],
    "ask": [],
    "deny": []
  }
}
EOF
  log_ok "Created $project_settings (empty override)"
fi

# CHANGELOG.md + TODO.md templates
if [[ ! -f "$PROJECT_ROOT/CHANGELOG.md" ]]; then
  cat > "$PROJECT_ROOT/CHANGELOG.md" <<EOF
# CHANGELOG

Формат — [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

## [Unreleased]

EOF
  log_ok "Created CHANGELOG.md"
fi

if [[ ! -f "$PROJECT_ROOT/TODO.md" ]]; then
  cat > "$PROJECT_ROOT/TODO.md" <<'EOF'
# TODO

## В работе

## Следующее

## Идеи / бэклог
EOF
  log_ok "Created TODO.md"
fi

# Cursor rules for this project
"$SCRIPT_DIR/sync-cursor.sh" --project "$PROJECT_ROOT"

# .gitignore entries (append if missing)
gitignore="$PROJECT_ROOT/.gitignore"
touch "$gitignore"
for line in ".claude/sessions/" ".claude/cache/" ".cursor/sessions/"; do
  if ! grep -Fxq "$line" "$gitignore" 2>/dev/null; then
    echo "$line" >> "$gitignore"
    log_info ".gitignore += $line"
  fi
done

log_ok "Project init complete: $PROJECT_ROOT"
