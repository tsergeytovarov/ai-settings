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

# --- Windows check ---
if [[ -z "${WSL_DISTRO_NAME:-}" ]]; then
  case "$OSTYPE" in
    msys*|cygwin*|win32*)
      echo "Windows detected without WSL."
      echo "This script requires WSL (Windows Subsystem for Linux)."
      echo "Please run this script from a WSL terminal."
      echo "Manual setup instructions: docs/setup/claude-code.md (Windows section)"
      exit 1
      ;;
  esac
fi

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

# settings.json — merge managed keys (permissions, hooks, $schema) into existing file.
# User-owned keys (enabledPlugins, extraKnownMarketplaces, etc.) are preserved.
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
  log_info "Merging managed keys into ~/.claude/settings.json..."
  if [[ $DRY_RUN -eq 0 ]]; then
    if command -v jq &>/dev/null; then
      tmp=$(mktemp)
      jq --argjson tpl "$(cat "$settings_source")" \
        '. * {"\$schema": $tpl["\$schema"], permissions: $tpl.permissions, hooks: $tpl.hooks}' \
        "$settings_target" > "$tmp" && mv "$tmp" "$settings_target"
      log_ok "settings.json updated (permissions + hooks merged)"
    else
      log_warn "jq not found — skipping merge. Install jq or manually copy: diff $settings_source $settings_target"
    fi
  else
    echo "[dry-run] jq-merge permissions + hooks from $settings_source -> $settings_target"
  fi
fi

# --- Codex personal skills (~/.agents/skills/) ---
# Codex discovers personal skills from ~/.agents/skills/<skill-name>/SKILL.md.
# Symlink each skill from the repo so the repo stays source of truth.
# Namespace prefix is dropped: popovs:write-meridian-article → write-meridian-article.
log_info "Setting up Codex personal skills (~/.agents/skills/)..."
if [[ $DRY_RUN -eq 0 ]]; then
  ensure_dir "$HOME/.agents/skills"
  for ns_dir in "$AI_SETTINGS_ROOT/skills"/*/; do
    [[ -d "$ns_dir" ]] || continue
    for skill_dir in "$ns_dir"*/; do
      [[ -f "$skill_dir/SKILL.md" ]] || continue
      skill_name="$(basename "$skill_dir")"
      target="$HOME/.agents/skills/$skill_name"
      ensure_symlink "$skill_dir" "$target"
    done
  done
else
  for ns_dir in "$AI_SETTINGS_ROOT/skills"/*/; do
    [[ -d "$ns_dir" ]] || continue
    for skill_dir in "$ns_dir"*/; do
      [[ -f "$skill_dir/SKILL.md" ]] || continue
      skill_name="$(basename "$skill_dir")"
      echo "[dry-run] ensure_symlink $skill_dir -> $HOME/.agents/skills/$skill_name"
    done
  done
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

# --- Claude Code: slash commands for personal skills ---
# For each skills/<namespace>/<skill>/ found in the repo, generates
# ~/.claude/commands/<namespace>/<skill>.md so skills appear in / autocomplete.
# Rename skills/popovs/ to skills/<your-handle>/ — the namespace follows automatically.
log_info "Generating personal skill slash commands for Claude Code..."

_generate_skill_commands() {
  local skills_root="$AI_SETTINGS_ROOT/skills"
  local total=0

  for ns_dir in "$skills_root"/*/; do
    [[ -d "$ns_dir" ]] || continue
    local ns
    ns="$(basename "$ns_dir")"
    local commands_dir="$HOME/.claude/commands/$ns"
    local count=0

    for skill_dir in "$ns_dir"*/; do
      [[ -f "$skill_dir/SKILL.md" ]] || continue
      local skill_name
      skill_name="$(basename "$skill_dir")"

      if [[ $DRY_RUN -eq 1 ]]; then
        echo "[dry-run] write $commands_dir/$skill_name.md  ($ns:$skill_name)"
        count=$((count + 1))
        continue
      fi

      ensure_dir "$commands_dir"

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
Invoke the \`$ns:$skill_name\` skill.
EOF
      log_info "  command: $ns:$skill_name"
      count=$((count + 1))
    done

    if [[ $DRY_RUN -eq 0 && $count -gt 0 ]]; then
      log_ok "Generated $count command(s) for namespace '$ns'"
    fi
  done
}

_generate_skill_commands

# --- RTK (Rust Token Killer) ---
log_info "Setting up RTK (Rust Token Killer)..."
if command -v rtk &>/dev/null; then
  log_ok "rtk already installed: $(rtk --version 2>/dev/null || echo 'unknown version')"
else
  log_info "rtk not found. Installing..."
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "[dry-run] install rtk binary"
  elif command -v brew &>/dev/null; then
    brew install rtk
    log_ok "rtk installed via Homebrew"
  else
    curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
    log_ok "rtk installed via install script"
  fi
fi

log_ok "ai-settings installation complete."
