#!/usr/bin/env bash
# deploy-skills.sh — развернуть скиллы на все поддерживаемые платформы одной командой.
#
# Что делает:
#   Claude Code  — прогоняет install.sh (симлинки ~/.claude/skills → repo/skills).
#   Codex        — тот же install.sh перегенерит плоский ~/.codex/AGENTS.md
#                  с развёрнутыми @imports (скиллы упоминаются как ссылки;
#                  содержимое модель читает файловыми тулзами при необходимости).
#   Claude Desktop — пакует каждый скилл в zip и открывает Finder. Дальше
#                    грузишь zip'ы руками через Settings → Capabilities →
#                    Skills → Upload. Нативного watched-folder у Desktop нет.
#
# Идемпотентно — dist/ пересоздаётся с нуля на каждом прогоне.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$REPO_ROOT/dist/claude-desktop-skills"

require_cmd() {
    command -v "$1" >/dev/null 2>&1 || {
        echo "ERROR: нужна команда '$1', её нет в PATH" >&2
        exit 1
    }
}

require_cmd zip

echo "==> Claude Code + Codex: install.sh"
"$REPO_ROOT/scripts/install.sh"

echo
echo "==> Claude Desktop: пакую zip'ы в $DIST_DIR"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

count=0
for skill_dir in "$REPO_ROOT"/skills/*/*/; do
    [ -d "$skill_dir" ] || continue
    [ -f "$skill_dir/SKILL.md" ] || {
        echo "    skip: $skill_dir (нет SKILL.md)"
        continue
    }
    skill_name="$(basename "$skill_dir")"
    parent_dir="$(dirname "$skill_dir")"
    (cd "$parent_dir" && zip -rq "$DIST_DIR/$skill_name.zip" "$skill_name" \
        -x "*/.DS_Store" "*/__pycache__/*" "*.pyc")
    size="$(du -h "$DIST_DIR/$skill_name.zip" | awk '{print $1}')"
    echo "    zip: $skill_name ($size)"
    count=$((count + 1))
done

echo
echo "==> Готово. Упаковано скиллов: $count"
echo "    $DIST_DIR"
echo
echo "Для Claude Desktop:"
echo "  1. Settings → Capabilities → Skills → Upload"
echo "  2. Перетащи .zip'ы из открывшейся папки (или замени существующие"
echo "     с тем же именем — перед апгрейдом удали старую версию в UI)."
echo "  3. Включи тумблер у каждого скилла."

if [[ "$OSTYPE" == "darwin"* ]] && command -v open >/dev/null 2>&1; then
    open "$DIST_DIR"
fi
