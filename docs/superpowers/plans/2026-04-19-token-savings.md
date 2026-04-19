# Token Savings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce token consumption in chat responses and bash tool outputs across all AI models, without affecting generated content quality.

**Architecture:** Three complementary layers — (1) compress AI's own chat responses via style rules, (2) compress bash command outputs via rtk proxy hook, (3) reduce system prompt size by trimming always-loaded files. All changes are config/doc files; no application code.

**Tech Stack:** Bash, Markdown, JSON. External tool: rtk (Rust binary, brew/curl install).

**Note on testing:** These are config and documentation changes. There are no automated tests for them. Each task includes a manual verification step — follow it before committing.

---

## File Map

| File | Action | What changes |
|---|---|---|
| `docs/ai/style.md` | Modify | Add Compression section at end |
| `AGENTS.md` | Modify | Remove ml.md import, add rtk-awareness import, add compact instructions |
| `docs/ai/writing-voice.md` | Modify | Shrink from 6.8KB to ~3KB |
| `docs/ai/rtk-awareness.md` | Create | 10-line rtk meta-commands reference |
| `settings/hooks/rtk-rewrite.sh` | Create | Copy from rtk repo verbatim |
| `settings/claude-settings.json` | Modify | Add PreToolUse hook for rtk |
| `settings/hooks/session-start-reminder.sh` | Modify | Add rtk binary check |
| `scripts/install.sh` | Modify | Add rtk install section + Windows detection |
| `docs/setup/claude-code.md` | Modify | Add Windows section + RTK section |
| `docs/setup/gemini.md` | Modify | Add Windows section |
| `docs/setup/cursor.md` | Modify | Add Windows note |
| `docs/setup/codex.md` | Modify | Add Windows note |
| `docs/setup/customization.md` | Modify | Add Windows note at top |
| `CHANGELOG.md` | Modify | Entry for all changes |
| `TODO.md` | Modify | Remove completed items |

---

## Task 1: Add Compression section to style.md

**Files:**
- Modify: `docs/ai/style.md`

- [ ] **Step 1: Read current style.md**

```bash
cat -n docs/ai/style.md
```

Verify the file ends after the "Uncertainty" section. Confirm there is no existing Compression section.

- [ ] **Step 2: Append Compression section**

Add to the end of `docs/ai/style.md`:

```markdown

## Compression

Always-on. Applies only to AI's own chat responses.

**Drop:**
- Filler: просто, конечно, разумеется, по сути, в принципе, безусловно, действительно
- Pleasantries: «конечно помогу», «с удовольствием», «отличный вопрос»
- Hedging: «возможно стоит отметить», «следует учитывать», «нужно сказать», «стоит упомянуть»
- Softeners: «как бы», «своего рода», «в некотором смысле»

**Allow:** фрагменты вместо полных предложений, короткие синонимы (fix вместо «реализовать решение»).

**Auto-clarity:** для предупреждений о безопасности и деструктивных операций — нормальный стиль, возобновить после.

**Does NOT apply to:** TG-посты, статьи, документы, презентации, README, CHANGELOG, коммиты, PR — всё что под `writing-voice.md`.
```

- [ ] **Step 3: Verify**

```bash
tail -20 docs/ai/style.md
```

Expected: Compression section visible, no trailing whitespace issues.

- [ ] **Step 4: Commit**

```bash
git add docs/ai/style.md
git commit -m "feat(style): добавить раздел Compression для экономии токенов в чате"
```

---

## Task 2: Add Compact Instructions to AGENTS.md and remove ml.md

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Read current AGENTS.md**

```bash
cat -n AGENTS.md
```

Find: the `@./docs/ai/ml.md` line (section 14 or similar) and the end of the file.

- [ ] **Step 2: Remove ml.md import**

In `AGENTS.md`, find and remove the line:

```
@./docs/ai/ml.md
```

Replace the entire ML section (currently section 14) with a comment:

```markdown
## 14. ML-Specific

> Load on demand — only in ML/data projects. Reference: `docs/ai/ml.md`.
> Read it manually when working on ML tasks: `@./docs/ai/ml.md`
```

- [ ] **Step 3: Add Compact Instructions at end of AGENTS.md**

Add to the end of `AGENTS.md`:

```markdown

## Compact Instructions

When context compaction runs, preserve:
- Current task state and what has been decided
- File paths and line numbers of changes in progress
- Any open questions or blockers
- Hard gates and permission rules from `docs/ai/hard-gates.md`

Summarize and discard:
- Long tool output that has already been acted on
- Earlier exploration steps that led to a dead end
- Repeated content from multiple file reads
```

- [ ] **Step 4: Verify**

```bash
grep -n "ml.md" AGENTS.md
```

Expected: only the comment line, not an `@./docs/ai/ml.md` import.

```bash
tail -15 AGENTS.md
```

Expected: Compact Instructions section visible.

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md
git commit -m "feat(agents): вынести ml.md из цепочки, добавить Compact Instructions"
```

---

## Task 3: Trim writing-voice.md

**Files:**
- Modify: `docs/ai/writing-voice.md`

The goal: shrink from 6.8KB to ~3KB by removing content that duplicates `skills/popovs/tg-post-writer/references/style-guide.md`. The tg-post-writer skill loads its own style-guide directly — no need to repeat it in the always-loaded system prompt.

**Keep:** Scope, Core voice (brief), Fact vs opinion (1 paragraph), Stop-lists, Quotation marks, Numbers/AI terminology, Emoji, Commit and PR tone, Reference to tg-guide.

**Remove:** Author presence (detailed markers), Position section, Hyperbole section, Rhythm and syntax section, Endings section.

- [ ] **Step 1: Read current writing-voice.md**

```bash
cat -n docs/ai/writing-voice.md
```

Note line numbers for each section to remove.

- [ ] **Step 2: Rewrite writing-voice.md**

Replace the entire file content with:

```markdown
# Writing Voice (generated content)

This module governs **voice and tone of content you generate on my behalf**. It is distinct from `style.md`, which governs how you talk to me in chat.

## Scope

**Apply this voice to:**

- Commit messages (subject and body, Russian part).
- Pull Request titles and descriptions.
- CHANGELOG entries.
- TODO.md entries.
- Docs under `docs/setup/`, `docs/adr/`, `docs/superpowers/`, README-like files.
- Blog posts, Telegram posts, articles, newsletters.
- Any long-form text that goes out under my name.

**Do NOT apply this voice to:**

- UI strings / product copy / error messages shown to end users.
- Code comments in libraries and modules.
- API docs / schema descriptions (formal, precise).
- Legal text, privacy policies, ToS.
- Chat replies to me (see `style.md`).

**When in doubt:** if the text is MINE going to other humans, apply this voice. If it's the product talking to its users, don't.

## Core voice

I'm a product engineer. I write the way I talk: direct, concrete, opinionated. No stage, no distance, no corporate register. The reader stands next to me, not below. Author is always present — personal take, not neutral summary. Harsh is fine when warranted. Hyperbole allowed to wake the reader up, followed by a measured thesis.

## Fact vs opinion

State facts definitively. Mark hypotheses explicitly: «есть вероятность», «кажется, что», «я думаю», «на мой взгляд». Never blur the two.

## Lexicon — what to avoid

Stop-list (do not produce):

- Canceliarit: «в рамках», «осуществлять», «данный», «имеет место быть», «с целью».
- Inforbiz / hype: «взрывной рост», «прорывное решение», «ключ к успеху», «революционный».
- Empty buzzwords: «эффективный», «оптимизация», «синергия» — when used without concrete meaning.
- Excess Anglicisms when a plain Russian word exists.
- Exclamation marks — very rare, only in explicitly playful context.
- Flattery / softeners: «дорогие друзья», «коллеги», «ребята».

Stop-list (first-line openers — banned):

- «В современном мире...»
- «Сегодня я хочу рассказать вам...»
- «Все мы знаем, что...»
- «Давайте поговорим о важном...»

## Quotation marks — a hard rule

Use ONLY for direct quotation of someone's speech. DO NOT use for: terms, product names, neologisms, ironic scare quotes. Product and company names without quotes: Авито, Cursor, Claude.

## Numbers, names, and AI terminology

- Arabic digits always. `%` as symbol.
- **«ИИ»** when writing about AI as a phenomenon / concept.
- **«AI»** inside product names or direct citations: «AI First», «AI-агенты».

## Emoji

Forbidden in all generated content. Single exception for posts: one emoji as an intonation beat at the very end in explicitly playful context only.

## Commit and PR tone

Conventional Commits format is mechanical (`git-workflow.md`). The voice rules for the **Russian description and body**:

- Imperative, concrete verb: `добавить X`, `убрать Y`, not `добавление X`.
- Describe from user's perspective, not from code's.
- Body explains WHY, same author-present voice. No canceliarit in commits.

## Reference

For the full channel style guide (formats, lengths, hooks, examples): `skills/popovs/tg-post-writer/references/style-guide.md`. That file is the canonical distillation for TG posts; this module covers what applies beyond them.
```

- [ ] **Step 3: Verify size**

```bash
wc -c docs/ai/writing-voice.md
```

Expected: under 3500 bytes (was 6849).

- [ ] **Step 4: Commit**

```bash
git add docs/ai/writing-voice.md
git commit -m "refactor(writing-voice): убрать дублирование с tg-guide, 6.8KB → ~3KB"
```

---

## Task 4: Create rtk-awareness.md and add to AGENTS.md

**Files:**
- Create: `docs/ai/rtk-awareness.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Create rtk-awareness.md**

Create `docs/ai/rtk-awareness.md` with this exact content:

```markdown
# RTK — Rust Token Killer

rtk is a CLI proxy that compresses bash command output before it reaches context (60-90% savings). It is transparent — Claude never sees the rewrite.

## Meta commands (call rtk directly, not through hook)

- `rtk gain` — show token savings stats for this session
- `rtk gain --history` — full command history with savings
- `rtk discover` — analyze Claude Code history for missed compression opportunities
- `rtk proxy <cmd>` — run command without filtering (full output, for debugging)

## Name collision warning

Two different "rtk" projects exist on crates.io. Verify correct install: `rtk gain` should work (not "command not found"). If it fails, you have the wrong package — install via `brew install rtk` or `cargo install --git https://github.com/rtk-ai/rtk`.

## Hook behavior

All other commands (git, npm, pytest, grep, etc.) are automatically rewritten by the PreToolUse hook. Built-in tools (Read, Grep, Glob) are NOT affected.
```

- [ ] **Step 2: Add import to AGENTS.md**

In `AGENTS.md`, find the section "## 5. Tech Stack" (or wherever ml.md used to be imported). Add the rtk-awareness import in a logical spot — after the coding standards section:

```markdown
## 15. RTK (token-optimized bash output)
@./docs/ai/rtk-awareness.md
```

- [ ] **Step 3: Verify import is correct**

```bash
grep -n "rtk" AGENTS.md
```

Expected: one `@./docs/ai/rtk-awareness.md` import line.

- [ ] **Step 4: Commit**

```bash
git add docs/ai/rtk-awareness.md AGENTS.md
git commit -m "feat(rtk): добавить rtk-awareness.md и импорт в AGENTS.md"
```

---

## Task 5: Add rtk-rewrite.sh hook file

**Files:**
- Create: `settings/hooks/rtk-rewrite.sh`

This file will be symlinked to `~/.claude/hooks/rtk-rewrite.sh` automatically (existing install.sh symlinks the entire `settings/hooks/` dir).

- [ ] **Step 1: Create rtk-rewrite.sh**

Create `settings/hooks/rtk-rewrite.sh` with this exact content (copied verbatim from rtk repo, hook version 3):

```bash
#!/usr/bin/env bash
# rtk-hook-version: 3
# RTK Claude Code hook — rewrites commands to use rtk for token savings.
# Requires: rtk >= 0.23.0, jq
#
# This is a thin delegating hook: all rewrite logic lives in `rtk rewrite`,
# which is the single source of truth (src/discover/registry.rs).
# To add or change rewrite rules, edit the Rust registry — not this file.
#
# Exit code protocol for `rtk rewrite`:
#   0 + stdout  Rewrite found, no deny/ask rule matched → auto-allow
#   1           No RTK equivalent → pass through unchanged
#   2           Deny rule matched → pass through (Claude Code native deny handles it)
#   3 + stdout  Ask rule matched → rewrite but let Claude Code prompt the user

if ! command -v jq &>/dev/null; then
  echo "[rtk] WARNING: jq is not installed. Hook cannot rewrite commands. Install jq: https://jqlang.github.io/jq/download/" >&2
  exit 0
fi

if ! command -v rtk &>/dev/null; then
  echo "[rtk] WARNING: rtk is not installed or not in PATH. Hook cannot rewrite commands. Install: https://github.com/rtk-ai/rtk#installation" >&2
  exit 0
fi

# Version guard: rtk rewrite was added in 0.23.0.
# Older binaries: warn once and exit cleanly (no silent failure).
# Cache the version check to avoid spawning multiple processes on every hook call.
CACHE_DIR=${XDG_CACHE_HOME:-$HOME/.cache}
CACHE_FILE="$CACHE_DIR/rtk-hook-version-ok"
if [ ! -f "$CACHE_FILE" ]; then
  RTK_VERSION_RAW=$(rtk --version 2>/dev/null)
  RTK_VERSION=${RTK_VERSION_RAW#rtk }
  RTK_VERSION=${RTK_VERSION%% *}
  if [ -n "$RTK_VERSION" ]; then
    IFS=. read -r MAJOR MINOR PATCH <<<"$RTK_VERSION"
    # Require >= 0.23.0
    if [ "$MAJOR" -eq 0 ] && [ "$MINOR" -lt 23 ]; then
      echo "[rtk] WARNING: rtk $RTK_VERSION is too old (need >= 0.23.0). Upgrade: cargo install rtk" >&2
      exit 0
    fi
  fi
  mkdir -p "$CACHE_DIR" 2>/dev/null
  touch "$CACHE_FILE" 2>/dev/null
fi

INPUT=$(cat)
CMD=$(jq -r '.tool_input.command // empty' <<<"$INPUT")

if [ -z "$CMD" ]; then
  exit 0
fi

# Delegate all rewrite + permission logic to the Rust binary.
REWRITTEN=$(rtk rewrite "$CMD" 2>/dev/null)
EXIT_CODE=$?

case $EXIT_CODE in
  0)
    # Rewrite found, no permission rules matched — safe to auto-allow.
    # If the output is identical, the command was already using RTK.
    [ "$CMD" = "$REWRITTEN" ] && exit 0
    ;;
  1)
    # No RTK equivalent — pass through unchanged.
    exit 0
    ;;
  2)
    # Deny rule matched — let Claude Code's native deny rule handle it.
    exit 0
    ;;
  3)
    # Ask rule matched — rewrite the command but do NOT auto-allow so that
    # Claude Code prompts the user for confirmation.
    ;;
  *)
    exit 0
    ;;
esac

if [ "$EXIT_CODE" -eq 3 ]; then
  # Ask: rewrite the command, omit permissionDecision so Claude Code prompts.
  jq -c --arg cmd "$REWRITTEN" \
    '.tool_input.command = $cmd | {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "updatedInput": .tool_input
      }
    }' <<<"$INPUT"
else
  # Allow: rewrite the command and auto-allow.
  jq -c --arg cmd "$REWRITTEN" \
    '.tool_input.command = $cmd | {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "allow",
        "permissionDecisionReason": "RTK auto-rewrite",
        "updatedInput": .tool_input
      }
    }' <<<"$INPUT"
fi
```

- [ ] **Step 2: Make executable**

```bash
chmod +x settings/hooks/rtk-rewrite.sh
```

- [ ] **Step 3: Verify**

```bash
head -3 settings/hooks/rtk-rewrite.sh
ls -la settings/hooks/rtk-rewrite.sh
```

Expected: `#!/usr/bin/env bash` on line 1, executable bit set (`-rwxr-xr-x`).

- [ ] **Step 4: Commit**

```bash
git add settings/hooks/rtk-rewrite.sh
git commit -m "feat(rtk): добавить rtk-rewrite.sh hook для перехвата bash-команд"
```

---

## Task 6: Wire rtk hook into claude-settings.json

**Files:**
- Modify: `settings/claude-settings.json`

- [ ] **Step 1: Read current claude-settings.json**

```bash
cat settings/claude-settings.json
```

Find the `"hooks"` section. Currently it has only `"SessionStart"`.

- [ ] **Step 2: Add PreToolUse hook**

In `settings/claude-settings.json`, add `"PreToolUse"` to the hooks section:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings",
  "permissions": {
    "allow": [
      "Read(**)",
      "Grep(**)",
      "Glob(**)",
      "Bash(git status)",
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(git branch:*)",
      "Bash(git show:*)",
      "Bash(ls:*)",
      "Bash(pwd)",
      "Bash(cat:*)",
      "Bash(gh pr view:*)",
      "Bash(gh issue view:*)",
      "Bash(gh pr list:*)",
      "Bash(gh issue list:*)",
      "Bash(pytest:*)",
      "Bash(npm test:*)",
      "Bash(npm run lint:*)",
      "Bash(uv run:*)",
      "Bash(node --version)",
      "Bash(python --version)",
      "Bash(python3 --version)"
    ],
    "ask": [
      "Bash(git commit:*)",
      "Bash(git push:*)",
      "Bash(git checkout:*)",
      "Bash(git merge:*)",
      "Bash(git rebase:*)",
      "Bash(npm install:*)",
      "Bash(pip install:*)",
      "Bash(uv pip install:*)",
      "Write(**)",
      "Edit(**)"
    ],
    "deny": [
      "Bash(git push --force*)",
      "Bash(git push -f*)",
      "Bash(git reset --hard*)",
      "Bash(rm -rf*)",
      "Bash(*--dangerously-skip-permissions*)",
      "Bash(*--no-verify*)"
    ]
  },
  "hooks": {
    "SessionStart": [
      { "type": "command", "command": "~/.claude/hooks/session-start-reminder.sh" }
    ],
    "PreToolUse": [
      { "type": "command", "command": "~/.claude/hooks/rtk-rewrite.sh" }
    ]
  }
}
```

- [ ] **Step 3: Validate JSON**

```bash
python3 -m json.tool settings/claude-settings.json > /dev/null && echo "JSON valid"
```

Expected: `JSON valid`

- [ ] **Step 4: Commit**

```bash
git add settings/claude-settings.json
git commit -m "feat(rtk): подключить PreToolUse hook для rtk в claude-settings.json"
```

---

## Task 7: Add rtk binary check to session-start-reminder.sh

**Files:**
- Modify: `settings/hooks/session-start-reminder.sh`

- [ ] **Step 1: Read current session-start-reminder.sh**

```bash
cat settings/hooks/session-start-reminder.sh
```

Find where the final `cat <<EOF` block is.

- [ ] **Step 2: Add rtk check before the EOF block**

Add this block after the `agent_count` calculation and before the `cat <<EOF`:

```bash
# rtk check — warn if hook is wired but binary is missing
RTK_HOOK="$HOME/.claude/hooks/rtk-rewrite.sh"
RTK_WARNING=""
if [[ -f "$RTK_HOOK" ]] && ! command -v rtk &>/dev/null; then
  RTK_WARNING=$'\nrtk hook is wired but rtk binary not found. Install: brew install rtk'
fi
```

And add `${RTK_WARNING}` to the EOF block:

```bash
cat <<EOF
[ai-settings] Loaded: ${skill_count} skill(s), ${agent_count} subagent(s).
Reminder: check for relevant skill/subagent BEFORE non-trivial tasks.
Silence: AI_SETTINGS_QUIET=1${RTK_WARNING}
EOF
```

- [ ] **Step 3: Verify syntax**

```bash
bash -n settings/hooks/session-start-reminder.sh && echo "Syntax OK"
```

Expected: `Syntax OK`

- [ ] **Step 4: Commit**

```bash
git add settings/hooks/session-start-reminder.sh
git commit -m "feat(rtk): добавить проверку rtk бинарника в session-start hook"
```

---

## Task 8: Add rtk install to scripts/install.sh + Windows detection

**Files:**
- Modify: `scripts/install.sh`

- [ ] **Step 1: Read current install.sh**

```bash
cat -n scripts/install.sh
```

Find: line after `set -euo pipefail` and before `SCRIPT_DIR=...`, and the final `log_ok` line.

- [ ] **Step 2: Add Windows detection after set -euo pipefail**

After `set -euo pipefail` and before `SCRIPT_DIR=...`, add:

```bash
# Windows detection — must be before any bash-specific operations
if [[ "${OSTYPE:-}" == "msys" ]] || [[ "${OSTYPE:-}" == "cygwin" ]] || [[ "${COMSPEC:-}" == *cmd.exe* ]]; then
  echo "ERROR: Windows without WSL detected."
  echo ""
  echo "This script requires macOS, Linux, or Windows with WSL."
  echo "Setup options:"
  echo "  1. WSL (recommended): install WSL, open a WSL terminal, then run this script."
  echo "  2. Manual setup: see docs/setup/claude-code.md#windows"
  exit 1
fi
```

- [ ] **Step 3: Add rtk install function before the final log_ok line**

Add this function definition and call before `log_ok "ai-settings installation complete."`:

```bash
# --- RTK (Rust Token Killer) ---
log_info "Checking rtk installation..."
_install_rtk() {
  if command -v rtk &>/dev/null; then
    log_ok "rtk already installed: $(rtk --version 2>/dev/null)"
    return 0
  fi

  local os
  os="$(uname -s)"

  case "$os" in
    Darwin)
      if command -v brew &>/dev/null; then
        log_info "Installing rtk via Homebrew..."
        if [[ $DRY_RUN -eq 0 ]]; then
          brew install rtk
        else
          echo "[dry-run] brew install rtk"
        fi
      else
        log_info "Homebrew not found. Installing rtk via curl..."
        if [[ $DRY_RUN -eq 0 ]]; then
          curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
          # curl installs to ~/.local/bin — ensure it's in PATH for current shell
          export PATH="$HOME/.local/bin:$PATH"
        else
          echo "[dry-run] curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh"
        fi
      fi
      ;;
    Linux)
      log_info "Installing rtk via curl..."
      if [[ $DRY_RUN -eq 0 ]]; then
        curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
        export PATH="$HOME/.local/bin:$PATH"
      else
        echo "[dry-run] curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh"
      fi
      ;;
    *)
      log_warn "Unknown OS: $os. Install rtk manually: https://github.com/rtk-ai/rtk#installation"
      return 0
      ;;
  esac

  # Verify install
  if command -v rtk &>/dev/null; then
    log_ok "rtk installed: $(rtk --version 2>/dev/null)"
  else
    log_warn "rtk install may have succeeded but binary not in current PATH."
    log_warn "Add to PATH: export PATH=\"\$HOME/.local/bin:\$PATH\""
    log_warn "Then verify: rtk --version && rtk gain"
  fi
}

_install_rtk
```

- [ ] **Step 4: Verify syntax**

```bash
bash -n scripts/install.sh && echo "Syntax OK"
```

Expected: `Syntax OK`

- [ ] **Step 5: Test dry-run**

```bash
./scripts/install.sh --dry-run 2>&1 | tail -20
```

Expected: dry-run lines for rtk visible, no errors.

- [ ] **Step 6: Commit**

```bash
git add scripts/install.sh
git commit -m "feat(install): добавить установку rtk и Windows-детекцию"
```

---

## Task 9: Add RTK + Windows sections to docs/setup/claude-code.md

**Files:**
- Modify: `docs/setup/claude-code.md`

- [ ] **Step 1: Read current claude-code.md**

```bash
cat -n docs/setup/claude-code.md
```

- [ ] **Step 2: Add Windows and RTK sections**

Append to `docs/setup/claude-code.md`:

```markdown

## Windows

### Рекомендуемый путь: WSL

1. Установи [WSL](https://learn.microsoft.com/ru-ru/windows/wsl/install): `wsl --install` в PowerShell (от администратора).
2. Открой WSL-терминал.
3. Клонируй репо и запусти `./scripts/install.sh` как обычно.

Все symlink-и, hooks и rtk работают в WSL без изменений.

### Без WSL (ручная настройка)

Запусти в PowerShell:

```powershell
# Создать директорию Claude Code
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude"

# Скопировать CLAUDE.md (symlink не поддерживается без Developer Mode)
Copy-Item "CLAUDE.md" "$env:USERPROFILE\.claude\CLAUDE.md"

# Скопировать settings.json
Copy-Item "settings\claude-settings.json" "$env:USERPROFILE\.claude\settings.json"

# Скопировать hooks
Copy-Item -Recurse "settings\hooks" "$env:USERPROFILE\.claude\hooks"

# Скопировать agents и skills
Copy-Item -Recurse "agents" "$env:USERPROFILE\.claude\agents"
Copy-Item -Recurse "skills" "$env:USERPROFILE\.claude\skills"
```

**Ограничение:** при обновлении репо (`git pull`) нужно вручную перекопировать изменившиеся файлы. С WSL этого нет.

### RTK на Windows

1. Скачай бинарник `rtk-x86_64-pc-windows-msvc.zip` из [releases](https://github.com/rtk-ai/rtk/releases).
2. Разархивируй и положи `rtk.exe` в папку из PATH (например, `C:\Users\<you>\.local\bin`).
3. Проверь: в PowerShell или CMD запусти `rtk --version`.

> В WSL rtk устанавливается через `brew install rtk` или curl — как на Linux.

## RTK (Rust Token Killer)

rtk сжимает вывод bash-команд до того, как они попадают в контекст (экономия 60–90%).

### Что уже настроено автоматически

После `scripts/install.sh`:
- `~/.claude/hooks/rtk-rewrite.sh` — hook для перехвата команд (через симлинк из `settings/hooks/`)
- `~/.claude/settings.json` — `PreToolUse` hook подключён

### Что нужно сделать вручную

Только установить бинарник — hook уже ждёт его:

```bash
# macOS
brew install rtk

# Linux / macOS без brew
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc  # или ~/.bashrc
```

Если запустить `./scripts/install.sh` — rtk установится автоматически.

### Проверка

```bash
rtk --version   # должно показать: rtk X.Y.Z
rtk gain        # статистика экономии токенов
```

> **Name collision:** на crates.io есть другой пакет "rtk" (Rust Type Kit). Если `rtk gain` не работает — установлен не тот пакет. Используй `brew install rtk` или `cargo install --git https://github.com/rtk-ai/rtk`.
```

- [ ] **Step 3: Verify**

```bash
grep -c "Windows\|RTK\|rtk" docs/setup/claude-code.md
```

Expected: 10+ matches.

- [ ] **Step 4: Commit**

```bash
git add docs/setup/claude-code.md
git commit -m "docs(setup): добавить секции Windows и RTK в claude-code.md"
```

---

## Task 10: Add Windows notes to remaining setup docs

**Files:**
- Modify: `docs/setup/gemini.md`
- Modify: `docs/setup/cursor.md`
- Modify: `docs/setup/codex.md`
- Modify: `docs/setup/customization.md`

- [ ] **Step 1: Append to docs/setup/gemini.md**

```markdown

## Windows

**С WSL:** путь тот же — `~/.gemini/GEMINI.md` (WSL использует Linux-пути).

**Без WSL:** скопируй вручную:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.gemini"
Copy-Item "GEMINI.md" "$env:USERPROFILE\.gemini\GEMINI.md"
```

Gemini CLI ищет GEMINI.md по `%USERPROFILE%\.gemini\GEMINI.md` на Windows.
При обновлении репо — перекопировать вручную.
```

- [ ] **Step 2: Append to docs/setup/cursor.md**

```markdown

## Windows

`sync-cursor.sh` — bash-скрипт, требует WSL или Git Bash.

**С WSL / Git Bash:** запускай как обычно.

**Без WSL:** скопируй `.cursor/rules/ai-settings.mdc` вручную в нужный проект:

```powershell
# Сначала сгенерируй файл через WSL или Git Bash:
# ./scripts/sync-cursor.sh --check  (проверка)
# ./scripts/sync-cursor.sh --project /path/to/project  (запись)

# Или скопируй уже существующий:
Copy-Item ".cursor\rules\ai-settings.mdc" "C:\path\to\project\.cursor\rules\ai-settings.mdc"
```
```

- [ ] **Step 3: Append to docs/setup/codex.md**

```markdown

## Windows

`install.sh` — bash-скрипт, требует WSL.

**С WSL:** запускай `./scripts/install.sh` как обычно.

**Без WSL:** скопируй плоский AGENTS.md вручную. Сначала сгенерируй его через WSL или Linux машину командой `./scripts/sync-cursor.sh --codex`, потом:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex"
Copy-Item "~/.codex/AGENTS.md" "$env:USERPROFILE\.codex\AGENTS.md"
```

При обновлении репо — перегенерировать и перекопировать.
```

- [ ] **Step 4: Add Windows note at top of docs/setup/customization.md**

After the opening paragraph (before the first `---`), add:

```markdown

> **Windows:** все bash-команды ниже требуют macOS, Linux или Windows с WSL. В PowerShell они не работают. Рекомендация: [установи WSL](https://learn.microsoft.com/ru-ru/windows/wsl/install) и работай из WSL-терминала.

```

- [ ] **Step 5: Verify all four files changed**

```bash
grep -l "Windows" docs/setup/gemini.md docs/setup/cursor.md docs/setup/codex.md docs/setup/customization.md
```

Expected: все 4 файла в выводе.

- [ ] **Step 6: Commit**

```bash
git add docs/setup/gemini.md docs/setup/cursor.md docs/setup/codex.md docs/setup/customization.md
git commit -m "docs(setup): добавить инструкции для Windows во все setup-доки"
```

---

## Task 11: Regenerate flat files + update CHANGELOG and TODO

**Files:**
- Run: `scripts/install.sh --dry-run` then `scripts/sync-cursor.sh`
- Modify: `CHANGELOG.md`
- Modify: `TODO.md`

- [ ] **Step 1: Regenerate Codex and Cursor flat files**

```bash
./scripts/sync-cursor.sh --codex
./scripts/sync-cursor.sh --global
```

Expected: no errors. `~/.codex/AGENTS.md` updated (ml.md removed, rtk-awareness added).

- [ ] **Step 2: Verify Codex flat file**

```bash
grep -c "rtk" ~/.codex/AGENTS.md
grep "ml.md" ~/.codex/AGENTS.md
```

Expected: rtk appears (from rtk-awareness import), ml.md appears only in the comment (not as an @import).

- [ ] **Step 3: Add CHANGELOG entry**

At top of `CHANGELOG.md`, under the current date section (or create new):

```markdown
## [Unreleased]

### Добавлено
- Раздел Compression в `docs/ai/style.md` — always-on фильтрация filler/hedging/pleasantries в чат-ответах всех моделей
- Интеграция rtk (Rust Token Killer): `settings/hooks/rtk-rewrite.sh`, PreToolUse hook в `settings/claude-settings.json`, `docs/ai/rtk-awareness.md`
- Проверка rtk бинарника в `session-start-reminder.sh` с подсказкой при отсутствии
- Установка rtk в `scripts/install.sh` (brew/curl/Windows)
- Compact Instructions в `AGENTS.md` для управления авто-компакцией контекста
- Windows-инструкции во все setup-доки (`claude-code.md`, `gemini.md`, `cursor.md`, `codex.md`, `customization.md`)
- Windows-детекция в `scripts/install.sh` с понятным сообщением об ошибке

### Изменено
- `docs/ai/writing-voice.md` сокращён с 6.8KB до ~3KB — убрано дублирование с tg-post-writer style-guide
- `AGENTS.md`: `ml.md` вынесен из постоянной цепочки (загружать вручную в ML-проектах)
```

- [ ] **Step 4: Update TODO.md**

Remove any completed items related to this feature. Add if not present:

```markdown
- [x] Добавить Compression в style.md
- [x] Интегрировать rtk
- [x] Добавить Windows-инструкции во все setup-доки
- [x] Сократить writing-voice.md
```

- [ ] **Step 5: Final commit**

```bash
git add CHANGELOG.md TODO.md
# Also add regenerated files if they changed:
git add -u
git commit -m "chore: обновить CHANGELOG и TODO после интеграции token savings"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Compression в style.md | Task 1 ✓ |
| Авто-компакт (→ Compact Instructions) | Task 2 ✓ |
| ml.md вынести из chain | Task 2 ✓ |
| writing-voice.md сократить | Task 3 ✓ |
| rtk-awareness.md + AGENTS.md | Task 4 ✓ |
| rtk-rewrite.sh в settings/hooks/ | Task 5 ✓ |
| PreToolUse в claude-settings.json | Task 6 ✓ |
| session-start rtk check | Task 7 ✓ |
| install.sh rtk + Windows | Task 8 ✓ |
| claude-code.md Windows + RTK | Task 9 ✓ |
| gemini.md Windows | Task 10 ✓ |
| cursor.md Windows | Task 10 ✓ |
| codex.md Windows | Task 10 ✓ |
| customization.md Windows | Task 10 ✓ |
| CHANGELOG + TODO | Task 11 ✓ |

**Dependency order verified:**
- Task 5 (hook file) → Task 6 (wire into settings) ✓
- Task 4 (rtk-awareness.md) → Task 4 step 2 (import in AGENTS.md) ✓
- Task 8 (install.sh) independent of rtk hook tasks ✓

**No placeholders:** all code blocks contain complete content.
