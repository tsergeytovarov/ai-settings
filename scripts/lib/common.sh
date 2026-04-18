#!/usr/bin/env bash
# Common utilities for ai-settings scripts.
# Source this: `source "$(dirname "$0")/lib/common.sh"`

set -euo pipefail

AI_SETTINGS_ROOT="${AI_SETTINGS_ROOT:-$HOME/ai-settings}"
BACKUP_DIR="$AI_SETTINGS_ROOT/backups/$(date +%Y%m%d-%H%M%S)"

log_info()  { echo -e "\033[36m[info]\033[0m  $*" >&2; }
log_warn()  { echo -e "\033[33m[warn]\033[0m  $*" >&2; }
log_error() { echo -e "\033[31m[error]\033[0m $*" >&2; }
log_ok()    { echo -e "\033[32m[ok]\033[0m    $*" >&2; }

# Create backup of a file/dir before overwrite. Safe for non-existent targets.
backup_if_exists() {
  local target="$1"
  if [[ -e "$target" || -L "$target" ]]; then
    mkdir -p "$BACKUP_DIR"
    local backup_path="$BACKUP_DIR/$(basename "$target")"
    cp -R "$target" "$backup_path" 2>/dev/null || cp "$target" "$backup_path"
    log_info "Backed up: $target -> $backup_path"
  fi
}

# Idempotent symlink: remove existing (with backup), create new.
ensure_symlink() {
  local src="$1" dst="$2"
  if [[ -L "$dst" ]] && [[ "$(readlink "$dst")" == "$src" ]]; then
    log_info "Symlink already correct: $dst -> $src"
    return 0
  fi
  backup_if_exists "$dst"
  rm -rf "$dst"
  mkdir -p "$(dirname "$dst")"
  ln -s "$src" "$dst"
  log_ok "Linked: $dst -> $src"
}

# Ensure dir exists.
ensure_dir() {
  mkdir -p "$1"
}
