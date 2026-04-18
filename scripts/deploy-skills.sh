#!/usr/bin/env bash
# deploy-skills.sh — развернуть скиллы на все поддерживаемые платформы одной командой.
#
# Что делает:
#   Claude Code   — прогоняет install.sh (симлинки ~/.claude/skills → repo/skills).
#   Codex         — тот же install.sh перегенерит плоский ~/.codex/AGENTS.md
#                   с развёрнутыми @imports.
#   Claude Desktop — двухступенчатая схема:
#                    1) пакует каждый скилл в zip в dist/claude-desktop-skills/
#                       (чтобы можно было загрузить через Settings → Capabilities
#                        → Skills → Upload — нужно для ПЕРВОЙ загрузки);
#                    2) для скиллов, которые уже один раз загружены через UI,
#                       делает rsync из репы прямо в папку Desktop
#                       (Library/.../skills-plugin/<sess>/<agent>/skills/<name>).
#                       Обновления подхватываются сразу — перезапусти Desktop.
#
# Режим синка — щадящий: rsync без --delete. Файлы, которых нет в репе, остаются.
#
# Идемпотентно — dist/ пересоздаётся с нуля на каждом прогоне.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$REPO_ROOT/dist/claude-desktop-skills"
DESKTOP_BASE="$HOME/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin"

require_cmd() {
    command -v "$1" >/dev/null 2>&1 || {
        echo "ERROR: нужна команда '$1', её нет в PATH" >&2
        exit 1
    }
}

require_cmd zip
require_cmd rsync

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

echo "    Упаковано скиллов: $count"

# -----------------------------------------------------------------------------
# Claude Desktop: rsync обновлений в уже загруженные скиллы.
# -----------------------------------------------------------------------------

echo
echo "==> Claude Desktop: ищу уже загруженные скиллы для авто-синка"

desktop_target=""
if [ -d "$DESKTOP_BASE" ]; then
    # Берём самый свежий skills-каталог: ID сессии и агента зависят от
    # установки, при релогине создаётся новый — актуальный всегда самый свежий.
    desktop_target=$(
        find "$DESKTOP_BASE" -maxdepth 4 -type d -name skills -print0 2>/dev/null \
            | while IFS= read -r -d '' d; do
                  mtime=$(stat -f "%m" "$d" 2>/dev/null || echo 0)
                  printf '%s\t%s\n' "$mtime" "$d"
              done \
            | sort -rn \
            | head -1 \
            | cut -f2-
    )
fi

if [ -z "$desktop_target" ] || [ ! -d "$desktop_target" ]; then
    echo "    Claude Desktop ещё ни разу не открывался или ни один скилл не"
    echo "    загружен через Upload — авто-синка не будет. Загрузи zip'ы из"
    echo "    $DIST_DIR через Settings → Capabilities → Skills → Upload."
else
    echo "    target: $desktop_target"
    synced=0
    pending=()
    for skill_dir in "$REPO_ROOT"/skills/*/*/; do
        [ -d "$skill_dir" ] || continue
        [ -f "$skill_dir/SKILL.md" ] || continue
        skill_name="$(basename "$skill_dir")"
        dst="$desktop_target/$skill_name"
        if [ -d "$dst" ]; then
            rsync -a \
                --exclude='.DS_Store' \
                --exclude='__pycache__' \
                --exclude='*.pyc' \
                "$skill_dir" "$dst/"
            echo "    sync: $skill_name"
            synced=$((synced + 1))
        else
            pending+=("$skill_name")
        fi
    done
    echo "    Обновлено скиллов: $synced"
    if [ ${#pending[@]} -gt 0 ]; then
        echo
        echo "    Первая загрузка нужна вручную (ещё нет в Desktop):"
        for p in "${pending[@]}"; do
            echo "      — $p  →  $DIST_DIR/$p.zip"
        done
    fi
    if [ "$synced" -gt 0 ]; then
        echo
        echo "    Перезапусти Claude Desktop, чтобы он перечитал SKILL.md."
    fi
fi

echo
echo "==> Готово."
echo "    zip'ы: $DIST_DIR"
echo
echo "Для первой загрузки скилла в Claude Desktop:"
echo "  1. Settings → Capabilities → Skills → Upload"
echo "  2. Перетащи нужный .zip из открывшейся папки."
echo "  3. Включи тумблер у скилла."
echo "  4. Дальнейшие обновления пойдут авто-синком при следующем прогоне."

if [[ "$OSTYPE" == "darwin"* ]] && command -v open >/dev/null 2>&1; then
    open "$DIST_DIR"
fi
