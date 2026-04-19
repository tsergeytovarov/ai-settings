#!/usr/bin/env bash
# Global install: symlink ai-settings into ~/.claude, ~/.codex, ~/.gemini; set up Cursor rules.
# Idempotent. Supports --dry-run.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AI_SETTINGS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
export AI_SETTINGS_ROOT
source "$SCRIPT_DIR/lib/common.sh"

DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      cat <<EOF
Usage: $0 [--dry-run]
  --dry-run   Show actions without applying.
EOF
      exit 0
      ;;
  esac
done

log_info "ai-settings root: $AI_SETTINGS_ROOT"
[[ $DRY_RUN -eq 1 ]] && log_warn "DRY RUN — no changes will be made"

# --- Claude Code ---
log_info "Setting up Claude Code..."
if [[ $DRY_RUN -eq 0 ]]; then
  ensure_dir "$HOME/.claude"
  ensure_symlink "$AI_SETTINGS_ROOT/CLAUDE.md"         "$HOME/.claude/CLAUDE.md"
  ensure_symlink "$AI_SETTINGS_ROOT/agents"            "$HOME/.claude/agents"
  ensure_symlink "$AI_SETTINGS_ROOT/skills"            "$HOME/.claude/skills"
  ensure_symlink "$AI_SETTINGS_ROOT/settings/hooks"    "$HOME/.claude/hooks"
else
  echo "[dry-run] ensure_dir $HOME/.claude"
  echo "[dry-run] ensure_symlink $AI_SETTINGS_ROOT/CLAUDE.md -> $HOME/.claude/CLAUDE.md"
  echo "[dry-run] ensure_symlink $AI_SETTINGS_ROOT/agents -> $HOME/.claude/agents"
  echo "[dry-run] ensure_symlink $AI_SETTINGS_ROOT/skills -> $HOME/.claude/skills"
  echo "[dry-run] ensure_symlink $AI_SETTINGS_ROOT/settings/hooks -> $HOME/.claude/hooks"
fi

# settings.json — copy, don't symlink (user may customize locally)
settings_target="$HOME/.claude/settings.json"
settings_source="$AI_SETTINGS_ROOT/settings/claude-settings.json"
if [[ ! -f "$settings_target" ]]; then
  log_info "No existing ~/.claude/settings.json — installing from template"
  if [[ $DRY_RUN -eq 0 ]]; then
    cp "$settings_source" "$settings_target"
  else
    echo "[dry-run] cp $settings_source $settings_target"
  fi
else
  log_warn "Existing ~/.claude/settings.json — not overwriting. Diff with: diff $settings_source $settings_target"
fi

# --- Codex CLI ---
# Codex не резолвит @imports в AGENTS.md, поэтому кладём плоскую версию с
# развёрнутыми импортами. Не симлинк, а обычный файл — иначе Codex будет
# видеть только верхний уровень, не модули из docs/ai/.
log_info "Setting up Codex CLI..."
if [[ $DRY_RUN -eq 0 ]]; then
  ensure_dir "$HOME/.codex"
  "$SCRIPT_DIR/sync-cursor.sh" --codex
else
  echo "[dry-run] ensure_dir $HOME/.codex"
  echo "[dry-run] $SCRIPT_DIR/sync-cursor.sh --codex"
fi

# --- Gemini CLI ---
log_info "Setting up Gemini CLI..."
if [[ $DRY_RUN -eq 0 ]]; then
  ensure_dir "$HOME/.gemini"
  ensure_symlink "$AI_SETTINGS_ROOT/GEMINI.md" "$HOME/.gemini/GEMINI.md"
else
  echo "[dry-run] ensure_dir $HOME/.gemini"
  echo "[dry-run] ensure_symlink $AI_SETTINGS_ROOT/GEMINI.md -> $HOME/.gemini/GEMINI.md"
fi

# --- Cursor (generate flat rules file) ---
log_info "Setting up Cursor (via sync-cursor.sh)..."
if [[ -x "$SCRIPT_DIR/sync-cursor.sh" ]]; then
  if [[ $DRY_RUN -eq 0 ]]; then
    "$SCRIPT_DIR/sync-cursor.sh" --global
  else
    echo "[dry-run] $SCRIPT_DIR/sync-cursor.sh --global"
  fi
else
  log_warn "sync-cursor.sh not found or not executable; skipping"
fi

# --- Claude Code: slash commands for popovs: skills ---
# Generates ~/.claude/commands/popovs/<skill>.md for each skill in skills/popovs/.
# This makes popovs: skills accessible via / in the Claude Code interface.
log_info "Generating popovs: slash commands for Claude Code..."

_generate_popovs_commands() {
  local skills_dir="$AI_SETTINGS_ROOT/skills/popovs"
  local commands_dir="$HOME/.claude/commands/popovs"

  if [[ ! -d "$skills_dir" ]]; then
    log_warn "skills/popovs not found, skipping command generation"
    return 0
  fi

  if [[ $DRY_RUN -eq 0 ]]; then
    ensure_dir "$commands_dir"
  else
    echo "[dry-run] ensure_dir $commands_dir"
  fi

  local count=0
  for skill_dir in "$skills_dir"/*/; do
    [[ -f "$skill_dir/SKILL.md" ]] || continue
    local skill_name
    skill_name="$(basename "$skill_dir")"

    if [[ $DRY_RUN -eq 1 ]]; then
      echo "[dry-run] write $commands_dir/$skill_name.md  (popovs:$skill_name)"
      count=$((count + 1))
      continue
    fi

    local desc
    desc=$(SKILL_MD="$skill_dir/SKILL.md" SKILL_NAME="$skill_name" python3 <<'PYEOF'
import os, re
txt = open(os.environ['SKILL_MD']).read()
m = re.search(r'description:\s*\|?\n\s*(.+)', txt)
if m:
    d = m.group(1).strip()
else:
    m2 = re.search(r'description:\s*(.+)', txt, re.MULTILINE)
    d = m2.group(1).strip() if m2 else os.environ.get('SKILL_NAME', 'skill')
print(d.replace('"', "'"))
PYEOF
    )

    cat > "$commands_dir/$skill_name.md" <<EOF
---
description: "$desc"
---
Invoke the \`popovs:$skill_name\` skill.
EOF
    log_info "  command: popovs:$skill_name"
    count=$((count + 1))
  done

  [[ $DRY_RUN -eq 0 ]] && log_ok "Generated $count popovs: command(s)"
}

_generate_popovs_commands

log_ok "ai-settings installation complete."
