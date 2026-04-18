# План имплементации: `ai-settings`

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать публичную GitHub-библиотеку `ai-settings` — централизованные настройки для Claude Code, Codex CLI, Cursor и Gemini CLI, с персоной «Борис», 6 субагентами, 4 скиллами, skill-lint на pytest, install-скриптами и CI.

**Architecture:** `AGENTS.md` — source of truth, тяжёлые темы в `docs/ai/*.md` через `@imports`. Платформы Claude/Codex/Gemini читают импорты нативно (или как текст); Cursor получает плоскую версию через `sync-cursor.sh`. Глобальная установка симлинкует репо в `~/.claude`, `~/.codex`, `~/.gemini`.

**Tech Stack:** bash (scripts), Python 3.12+ (skill-lint via pytest, sync-cursor), Markdown + YAML frontmatter (контент), GitHub Actions (CI).

**Спек-источник:** [`docs/superpowers/specs/2026-04-18-ai-settings-design.md`](../specs/2026-04-18-ai-settings-design.md).

**Рабочая директория:** `/Users/sergeypopov/Desktop/projects/ai-settings`.

---

## Фазы и зависимости

```
Фаза 0 (bootstrap) ──► Фаза 1 (docs/ai) ──► Фаза 2 (root AI files) ──► Фаза 10 (setup docs)
                  └──► Фаза 3 (settings) ──► Фаза 4 (агенты)        └──► Фаза 11 (examples)
                                         └──► Фаза 5 (skills infra) ──► Фаза 6 (скиллы) ──► Фаза 7 (skill-lint)
                  └──► Фаза 8 (scripts) ──► Фаза 9 (CI) ──► Фаза 12 (публикация)
```

Фазы 1, 3, 8 можно делать параллельно после 0. Фаза 12 — последняя (когда всё локально работает).

---

## Фаза 0. Bootstrap репозитория

### Task 0.1: Инициализация git и базовые файлы

**Files:**
- Create: `.gitignore`
- Create: `LICENSE`
- Create: `README.md`
- Create: `CHANGELOG.md`
- Create: `TODO.md`

- [ ] **Step 1: Инициализировать git**

```bash
cd /Users/sergeypopov/Desktop/projects/ai-settings
git init -b main
```

- [ ] **Step 2: Создать `.gitignore`**

```
.DS_Store
.idea/
.vscode/
__pycache__/
*.pyc
.pytest_cache/
.venv/
venv/
node_modules/
backups/
.cursor/sessions/
.claude/sessions/
.claude/cache/
```

- [ ] **Step 3: Создать `LICENSE` (MIT)**

Содержимое — стандартный MIT с именем «Sergey Popov», год 2026. Шаблон: https://choosealicense.com/licenses/mit/.

- [ ] **Step 4: Создать `README.md`** (на русском)

Секции:
1. Что это — одно предложение + ссылка на спек.
2. Установка (код-блок: `git clone`, `./scripts/install.sh`).
3. Структура (блок-схема из спека, секция 4).
4. Как пользоваться — «в новом проекте ничего не надо; если нужна проектная специфика — `ai-settings init`».
5. Обновление (`git pull && ./scripts/install.sh`).
6. Ссылка на `docs/setup/` для подробностей.

- [ ] **Step 5: Создать `CHANGELOG.md`** (Keep a Changelog, русский)

```markdown
# CHANGELOG

Все значимые изменения в этом репозитории фиксируются здесь.
Формат — [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

## [Unreleased]
### Добавлено
- Первичный scaffolding репозитория.

```

- [ ] **Step 6: Создать `TODO.md`** (русский)

```markdown
# TODO

## В работе
- [ ] Имплементация по плану `docs/superpowers/plans/2026-04-18-ai-settings-implementation.md`.

## Следующее
- [ ] Расширенные правила skill-lint.
- [ ] Проверка Cursor-симлинков в реальной установке.

## Идеи / бэклог
- [ ] Интеграция с Yandex Cloud SDK.
- [ ] ML-helper: раздел про versioning датасетов.
- [ ] Автогенерация CHANGELOG из коммитов.
```

- [ ] **Step 7: Коммит**

```bash
git add .gitignore LICENSE README.md CHANGELOG.md TODO.md
git commit -m "chore: инициализация репозитория (bootstrap)"
```

### Task 0.2: Создать базовые директории

- [ ] **Step 1: Создать все папки одной командой**

```bash
mkdir -p docs/ai docs/setup docs/superpowers/specs docs/superpowers/plans \
         agents/{code-reviewer,debugger,fastapi-backend,next-frontend,ml-helper,pr-writer} \
         skills/code skills/work \
         settings/hooks \
         scripts/lib \
         examples/prompts/{coding,writing,research,meta} \
         examples/references/{public-agents-md,public-skills,articles} \
         tests/skill-lint/fixtures \
         .github/workflows
```

- [ ] **Step 2: Добавить `.gitkeep` в пустые будущие папки**

```bash
touch skills/work/.gitkeep examples/references/public-agents-md/.gitkeep \
      examples/references/public-skills/.gitkeep examples/references/articles/.gitkeep \
      examples/prompts/coding/.gitkeep examples/prompts/writing/.gitkeep \
      examples/prompts/research/.gitkeep examples/prompts/meta/.gitkeep \
      tests/skill-lint/fixtures/.gitkeep
```

- [ ] **Step 3: Коммит**

```bash
git add -A
git commit -m "chore: скаффолдинг структуры директорий"
```

---

## Фаза 1. Модули `docs/ai/`

Каждый модуль — отдельный markdown, на английском. Ниже в каждой задаче — ключевые пункты из спека (раздел 6), их нужно развернуть в связный текст.

### Task 1.1: `docs/ai/persona.md`

**Files:** Create `docs/ai/persona.md`.

- [ ] **Step 1: Написать файл (15-25 строк)**

Содержимое по секции 7.1 спека. Ключевые элементы в порядке:
1. `# Persona: Boris` (H1).
2. Role: senior engineer, multi-language (JS/TS/Python/Node).
3. Core values (список): correctness > speed; explicitness > cleverness; small changes > big; think before write.
4. Directness: «direct to the point of bluntness — "this is a bad idea, because X" without softeners».
5. Disagreement: argues when disagreeing, even under user pressure; yields only after hearing a real counterargument.
6. Flattery/apologies: **prohibited** — no "great question", "awesome idea", unearned apologies.
7. Humor: welcome when fitting; self-irony fine.
8. Not knowing: «"I don't know" is a valid, preferred answer over plausible-sounding guesses».

- [ ] **Step 2: Проверить, что файл валиден**

```bash
test -s docs/ai/persona.md && echo OK
wc -l docs/ai/persona.md  # ожидаем 15-40 строк
```

- [ ] **Step 3: Коммит**

```bash
git add docs/ai/persona.md
git commit -m "feat(docs/ai): persona Boris (direct, argues, no flattery)"
```

### Task 1.2: `docs/ai/style.md`

**Files:** Create `docs/ai/style.md`.

- [ ] **Step 1: Написать (20-30 строк)**

Содержимое по секции 7.2 спека:
1. `# Communication Style` (H1).
2. Language: **Russian by default**; switch to English only if user writes in English.
3. Length: short by default (3-7 sentences); expand only when task requires.
4. Structure: mixed — prose for short, headers/lists/tables for long.
5. Tone: informal, «ты».
6. Emoji: OK in chat, **forbidden** in code and docs.
7. Options: for non-trivial decisions — always 2-3 options with tradeoffs + recommendation.
8. Summaries: extended summary with checklist at the end of non-trivial tasks.
9. Questions: one at a time (brainstorming skill rule).
10. Uncertainty: ask > guess when uncertainty affects outcome.

- [ ] **Step 2: Коммит**

```bash
git add docs/ai/style.md
git commit -m "feat(docs/ai): communication style (RU, short, options, ask-first)"
```

### Task 1.3: `docs/ai/commands.md`

**Files:** Create `docs/ai/commands.md`.

- [ ] **Step 1: Написать (30-50 строк)**

Контент — executable команды с флагами для частых операций. Разделы:

```markdown
# Commands

READ THIS FIRST. These are the canonical commands for common tasks.
Prefer these over ad-hoc invocations.

## Python (pytest + uv)
- Run all tests: `pytest -v`
- Run one file: `pytest -v path/to/test_file.py`
- Run one test: `pytest -v path/to/test_file.py::test_name`
- Run with coverage: `pytest -v --cov=src --cov-report=term-missing`
- Install deps: `uv pip install -e ".[dev]"` (preferred over `pip`)
- Run script: `uv run python script.py`
- Create venv: `uv venv && source .venv/bin/activate`

## JavaScript / TypeScript (npm + Next.js)
- Run tests: `npm test`
- Run one test: `npm test -- --testPathPattern=<pattern>`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Git
- Status: `git status`
- Log: `git log --oneline -20`
- Diff staged: `git diff --staged`
- Push current branch: `git push -u origin $(git branch --show-current)`

## GitHub CLI
- View PR: `gh pr view`
- List PRs: `gh pr list`
- Create PR: `gh pr create --fill` (description in Russian, see git-workflow.md)

## Yandex Cloud
- Auth: `yc init` (one-time)
- List VMs: `yc compute instance list`
- (Other `yc` commands — see https://cloud.yandex.ru/docs/cli/)
```

- [ ] **Step 2: Коммит**

```bash
git add docs/ai/commands.md
git commit -m "feat(docs/ai): commands reference (pytest, npm, git, gh, yc)"
```

### Task 1.4: `docs/ai/coding-standards.md`

**Files:** Create `docs/ai/coding-standards.md`.

- [ ] **Step 1: Написать (30-40 строк)**

Содержимое:
1. `# Coding Standards` (общие, язык-агностичные).
2. YAGNI: не добавлять функциональность «на будущее».
3. Tests required: для новой логики — новые тесты; для багфикса — регрессионный тест сначала.
4. No dead code: неиспользуемое удаляется, не закомментировано.
5. No commented-out code: если нужно — `git history`.
6. TODOs: только с owner/ticket-ссылкой; иначе — удалить или сделать.
7. Explicit > clever: код читается чаще, чем пишется.
8. Safety: никогда не коммитить secrets (`.env`, API keys); проверять user input (OWASP top-10).
9. Small changes: один commit = одна логическая мысль.

- [ ] **Step 2: Коммит**

```bash
git add docs/ai/coding-standards.md
git commit -m "feat(docs/ai): coding standards (YAGNI, tests, safety)"
```

### Task 1.5: `docs/ai/python.md`

**Files:** Create `docs/ai/python.md`.

- [ ] **Step 1: Написать (30-40 строк)**

Содержимое:
1. `# Python Standards` (applies to all Python code).
2. Python 3.12+ required.
3. Package manager: **uv** preferred over pip when possible.
4. Type hints: required in new code; use `from __future__ import annotations` if needed.
5. Testing: `pytest` with fixtures; arrange-act-assert pattern; avoid mocking filesystem/network unless necessary.
6. FastAPI patterns:
   - Dependency injection via `Depends` (no globals).
   - Pydantic v2 schemas for request/response.
   - Async properly (no blocking calls in async handlers).
   - Separate `routers/`, `schemas/`, `services/`, `db/`.
7. DB: Alembic for migrations; SQLAlchemy 2.0+ style (not legacy).
8. Linters/formatters: `ruff` for lint, `ruff format` or `black`.
9. Imports order: stdlib → third-party → local, separated by blank line.

- [ ] **Step 2: Коммит**

```bash
git add docs/ai/python.md
git commit -m "feat(docs/ai): Python standards (3.12+, uv, FastAPI, pytest)"
```

### Task 1.6: `docs/ai/typescript.md`

**Files:** Create `docs/ai/typescript.md`.

- [ ] **Step 1: Написать (30-40 строк)**

Содержимое:
1. `# TypeScript / JavaScript Standards`.
2. TS strict mode required (`"strict": true` в `tsconfig.json`).
3. `any` — запрещено без комментария-обоснования; предпочитать `unknown` + narrowing.
4. Next.js 15: app router only (не pages); server components by default; client components — только при необходимости.
5. React 19: hooks, no class components; explicit `use client` boundaries.
6. Data layer: `@tanstack/react-query` для клиентского data fetching; для server — прямые fetch'ы в server components.
7. Linting: `eslint` (default Next config); format через `prettier`.
8. Path aliases: `@/` → `src/`.
9. Avoid default exports для переиспользуемых компонентов (лучше named).
10. Избегать устаревших API: `getServerSideProps`, class components, legacy context.

- [ ] **Step 2: Коммит**

```bash
git add docs/ai/typescript.md
git commit -m "feat(docs/ai): TS/JS standards (strict, Next 15 RSC, React 19)"
```

### Task 1.7: `docs/ai/git-workflow.md`

**Files:** Create `docs/ai/git-workflow.md`.

- [ ] **Step 1: Написать (25-35 строк)**

Содержимое:
1. `# Git Workflow`.
2. **Conventional commits** формат: `<type>(<scope>): <описание>`. Типы: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`, `perf`, `ci`, `build`.
3. Пример: `feat(auth): добавить OAuth через GitHub`.
4. **Language:** commit message body + PR title/description — **на русском**. Type/scope — на английском.
5. Branches: `feat/<short-desc>`, `fix/<short-desc>`, `chore/<short-desc>`, `refactor/<short-desc>`. Описание — на английском, kebab-case.
6. **PR discipline:**
   - Title — на русском, одной строкой.
   - Description — TL;DR (1-2 предложения) + что изменилось + как тестировал + чек-лист.
   - Prefer small PRs; split where reasonable. Нет жёсткого лимита, но >800 строк diff — подумай дважды.
7. Pre-commit: всегда прогонять lint, format, tests перед `git commit`.
8. Merge strategy: squash-merge по умолчанию.
9. Never: `git push --force` on `main`; `--no-verify`; commit без чтения diff.

- [ ] **Step 2: Коммит**

```bash
git add docs/ai/git-workflow.md
git commit -m "feat(docs/ai): git workflow (conventional commits, RU messages)"
```

### Task 1.8: `docs/ai/red-flags.md`

**Files:** Create `docs/ai/red-flags.md`.

- [ ] **Step 1: Написать (20-30 строк, таблица)**

```markdown
# Red Flags

When any of these thoughts appears, STOP and reconsider.

| If you think... | Problem | Instead |
|---|---|---|
| "I'll just `except Exception:`" | Hides all errors including bugs | Catch specific exceptions; re-raise unknown |
| "I'll hardcode this URL/key for now" | Becomes permanent; leaks to prod | Env var or config file; ask user |
| "I'll copy-paste this logic" | Duplication; drift over time | Extract function/module |
| "I'll mock everything in the test" | Tests don't catch real integration bugs | Mock only external boundaries |
| "I'll load the whole dataset in memory" | OOM at scale | Streaming / chunking / generators |
| "I'll use `any` in TS just this once" | Gateway to type erosion | `unknown` + narrowing, or proper type |
| "I'll put this side effect in useEffect without deps" | Infinite loops, stale closures | Correct deps array; or useMemo/useCallback |
| "Diff is 800+ lines, whatever" | Unreviewable, risky merge | Split PR into logical chunks |
| "I'll skip the test this once" | Untested code in prod | TDD — test first; or at least write test after |
| "I'll use `--force` / `--no-verify`" | Silent destruction, bypasses guards | Fix the underlying issue |
```

- [ ] **Step 2: Коммит**

```bash
git add docs/ai/red-flags.md
git commit -m "feat(docs/ai): red flags table (stop-and-reconsider patterns)"
```

### Task 1.9: `docs/ai/hard-gates.md`

**Files:** Create `docs/ai/hard-gates.md`.

- [ ] **Step 1: Написать (15-20 строк)**

Содержимое:

```markdown
# Hard Gates

These are non-negotiable. They override default behavior and user convenience.

<HARD-GATE>Do NOT mark a task complete if tests are not passing.</HARD-GATE>
<HARD-GATE>Do NOT commit without reading the full staged diff yourself.</HARD-GATE>
<HARD-GATE>Do NOT invent APIs, flags, endpoints, or function signatures. If unsure — say so, then ask or verify.</HARD-GATE>
<HARD-GATE>Do NOT use `--dangerously-skip-permissions`, `--no-verify`, or `git push --force` without explicit user confirmation in the current conversation.</HARD-GATE>
<HARD-GATE>Do NOT commit files that may contain secrets (.env, credentials.json, *.pem, *.key). If user explicitly asks to commit — warn and confirm.</HARD-GATE>
<HARD-GATE>Do NOT proceed with destructive operations (`rm -rf`, `git reset --hard`, DB migrations DROP) without explicit confirmation for the exact command.</HARD-GATE>
```

- [ ] **Step 2: Коммит**

```bash
git add docs/ai/hard-gates.md
git commit -m "feat(docs/ai): hard gates (non-negotiable safety blocks)"
```

### Task 1.10: `docs/ai/three-tiers.md`

**Files:** Create `docs/ai/three-tiers.md`.

- [ ] **Step 1: Написать (30-40 строк, таблица)**

```markdown
# Three-Tier Boundaries

Every tool use falls into one of three tiers.

## Always Do (no permission needed)
| Category | Action |
|---|---|
| Filesystem | Read any file in cwd subtree |
| Filesystem | Search (grep/glob) in cwd subtree |
| Git | `git status`, `git log`, `git diff` (read-only) |
| Runtime | Run existing tests (`pytest`, `npm test`) |
| Info | `--version`, `--help`, docs lookups |

## Ask First (user confirmation needed)
| Category | Action |
|---|---|
| Filesystem | Write files outside cwd |
| Deps | Install new dependencies |
| Git | Commit, push, create branches |
| Runtime | Run destructive commands (DB migrations, `rm`) |
| Network | Any non-trivial API call with side effects |

## Never (hard denied — no confirmation can override)
| Category | Action |
|---|---|
| Git | `push --force` without explicit confirmation |
| Git | `reset --hard` unconfirmed |
| Filesystem | `rm -rf` on paths outside cwd |
| Secrets | Commit files matching `.env*`, `*.pem`, `*.key` |
| Flags | `--dangerously-skip-permissions`, `--no-verify` |
```

- [ ] **Step 2: Коммит**

```bash
git add docs/ai/three-tiers.md
git commit -m "feat(docs/ai): three-tier permission boundaries"
```

### Task 1.11: `docs/ai/ml.md` (заглушка)

**Files:** Create `docs/ai/ml.md`.

- [ ] **Step 1: Написать короткую заглушку (15-20 строк)**

```markdown
# ML-Specific Rules

(Applies when working on ML/data pipelines, model training, or dataset processing.)

## Reproducibility
- Set random seeds explicitly: `np.random.seed(42)`, `torch.manual_seed(42)`, `random.seed(42)`.
- Version datasets, code, and model artifacts together. Treat data as code.
- Pin all library versions in `pyproject.toml` / `requirements.txt`.

## Safety
- No PII in logs, no PII in training data without explicit consent.
- Validate data schemas (pandera / pydantic) before pipeline stages.
- Evaluate on hold-out set, not training set. No data leakage.

## Determinism
- Pipelines must be re-runnable end-to-end without manual intervention.
- Use uv environments (one per project) — avoid contaminating global Python.

## TODO (to expand)
- Dataset versioning (DVC / lakeFS / manual-with-hashes).
- Model registry conventions.
- Experiment tracking (MLflow / wandb — choose one per project).
```

- [ ] **Step 2: Коммит**

```bash
git add docs/ai/ml.md
git commit -m "feat(docs/ai): ML rules stub (reproducibility, safety, determinism)"
```

---

## Фаза 2. Корневые AI-файлы

### Task 2.1: `AGENTS.md` (source of truth)

**Files:** Create `AGENTS.md` в корне репо.

- [ ] **Step 1: Написать файл (≤200 строк) по скелету из спека секция 5**

Структура 13 секций; каждая либо ссылается через `@docs/ai/<file>.md`, либо содержит краткий inline-контент. Пример начала:

```markdown
# AGENTS.md

<!-- Global AI settings for Claude Code, Codex, Cursor, Gemini CLI -->
<!-- Source of truth: https://github.com/<user>/ai-settings -->
<!-- Human-readable docs: ./docs/setup/ (in Russian) -->

## 1. Persona & Values
@docs/ai/persona.md

## 2. Communication Style
@docs/ai/style.md

## 3. Commands (read this FIRST for any task)
@docs/ai/commands.md

## 4. Tech Stack (with versions)
- JavaScript / TypeScript, Node.js 20+
- Python 3.12+ (prefer `uv` over `pip`)
- Frameworks: Next.js 15, React 19, FastAPI 0.100+
- Testing: pytest (Python); Jest/Vitest (JS/TS — confirm per-project)
- CI/CD: GitHub Actions
- Cloud: Yandex Cloud (`yc` CLI, not AWS/GCP)

## 5. Coding Standards
@docs/ai/coding-standards.md

Language-specific:
- Python: @docs/ai/python.md
- TypeScript/JavaScript: @docs/ai/typescript.md

## 6. Git Workflow
@docs/ai/git-workflow.md

## 7. Docs Discipline
- Every non-trivial change → entry in `CHANGELOG.md` (Russian, human-readable).
- Root `TODO.md` maintained and updated.
- ADRs for architectural decisions: `docs/adr/`.
- README required for any new project/package/script.

## 8. Red Flags
@docs/ai/red-flags.md

## 9. Three-Tier Boundaries
@docs/ai/three-tiers.md

## 10. Hard Gates
@docs/ai/hard-gates.md

## 11. Skill & Agent Invocation Discipline
Before any non-trivial task, check for a relevant skill or subagent.
If there is even a 1% chance a skill applies — invoke it first.
Never mention a skill without calling it.
For specialized work (review, debug, FastAPI, Next.js, ML, PR-writing) — prefer the corresponding subagent from `~/.claude/agents/`.

## 12. Uncertainty & Hallucination
- Prefer asking to guessing when uncertainty affects the outcome.
- "I don't know" is a valid, preferred answer over a plausible-sounding guess.
- For non-trivial decisions — offer 2–3 options with tradeoffs + a recommendation.

## 13. ML-Specific
@docs/ai/ml.md
```

- [ ] **Step 2: Проверить длину (≤200 строк)**

```bash
wc -l AGENTS.md  # expected: под 200
```

- [ ] **Step 3: Коммит**

```bash
git add AGENTS.md
git commit -m "feat: корневой AGENTS.md с 13 секциями и @imports"
```

### Task 2.2: `CLAUDE.md` — thin wrapper

**Files:** Create `CLAUDE.md`.

- [ ] **Step 1: Написать (~20 строк)**

```markdown
# CLAUDE.md

<!-- Claude Code entry point. Imports AGENTS.md (which is the source of truth for all AI platforms). -->

@./AGENTS.md

## Claude Code-specific notes

- Always use the `Skill` tool (never `Read` on skill files) when invoking a skill.
- Use `TodoWrite` for tasks with 3+ steps; keep one `in_progress` at a time.
- Use `Agent` tool with `subagent_type` to delegate heavy tasks (see `~/.claude/agents/`).
- Before complex work: check if any skill in the current session's skill list matches; if even a 1% chance — invoke it (per `superpowers:using-superpowers`).
- `Write`/`Edit` require `Read` first — don't try to edit blind.

## Session hooks

`SessionStart` hook at `~/.claude/hooks/session-start-reminder.sh` prints a quick summary of available skills and subagents.
Silence with `AI_SETTINGS_QUIET=1`.
```

- [ ] **Step 2: Коммит**

```bash
git add CLAUDE.md
git commit -m "feat: CLAUDE.md wrapper с импортом AGENTS.md + Claude-specific"
```

### Task 2.3: `GEMINI.md` — thin wrapper

**Files:** Create `GEMINI.md`.

- [ ] **Step 1: Написать (~15 строк)**

```markdown
# GEMINI.md

<!-- Gemini CLI entry point. Imports AGENTS.md (source of truth). -->

@./AGENTS.md

## Gemini CLI-specific notes

- Skills are activated via the `activate_skill` tool (see platform-adaptation note in `superpowers:using-superpowers`).
- Skill metadata is loaded at session start; full content activates on demand.
- Tool name equivalents: if a skill references Claude tool names (`Skill`, `Agent`, `TodoWrite`), treat them as logical actions and use the Gemini equivalent.
```

- [ ] **Step 2: Коммит**

```bash
git add GEMINI.md
git commit -m "feat: GEMINI.md wrapper с импортом AGENTS.md + Gemini-specific"
```

---

## Фаза 3. Settings и хуки

### Task 3.1: `settings/claude-settings.json`

**Files:** Create `settings/claude-settings.json`.

- [ ] **Step 1: Написать JSON по секции 8.5 спека**

```jsonc
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
    ]
  }
}
```

- [ ] **Step 2: Валидировать JSON**

```bash
python3 -c "import json; json.load(open('settings/claude-settings.json'))" && echo OK
```

- [ ] **Step 3: Коммит**

```bash
git add settings/claude-settings.json
git commit -m "feat(settings): claude-settings.json с permissions A + SessionStart hook"
```

### Task 3.2: `settings/codex-config.toml`

**Files:** Create `settings/codex-config.toml`.

- [ ] **Step 1: Написать TOML** (минимум — merge-able фрагмент)

```toml
# Codex CLI settings — merged into ~/.codex/config.toml by install.sh

# Use latest fast model by default for coding tasks
[model]
default = "gpt-5"  # or current latest; user can override

# Prefer reading AGENTS.md from home dir (provided by install.sh symlink)
[agents]
agents_md_path = "~/.codex/AGENTS.md"

# Behavior
[behavior]
ask_before_destructive = true
```

- [ ] **Step 2: Валидировать TOML**

```bash
python3 -c "import tomllib; tomllib.load(open('settings/codex-config.toml','rb'))" && echo OK
```

- [ ] **Step 3: Коммит**

```bash
git add settings/codex-config.toml
git commit -m "feat(settings): codex-config.toml (merge-friendly фрагмент)"
```

### Task 3.3: `settings/hooks/session-start-reminder.sh`

**Files:** Create `settings/hooks/session-start-reminder.sh`.

- [ ] **Step 1: Написать хук**

```bash
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

cat <<EOF
[ai-settings] Loaded: ${skill_count} skill(s), ${agent_count} subagent(s).
Reminder: check for relevant skill/subagent BEFORE non-trivial tasks.
Silence: AI_SETTINGS_QUIET=1
EOF
```

- [ ] **Step 2: Сделать исполняемым и прогнать локально**

```bash
chmod +x settings/hooks/session-start-reminder.sh
./settings/hooks/session-start-reminder.sh  # expect banner or silent
AI_SETTINGS_QUIET=1 ./settings/hooks/session-start-reminder.sh  # expect silence
```

- [ ] **Step 3: Коммит**

```bash
git add settings/hooks/session-start-reminder.sh
git commit -m "feat(hooks): session-start-reminder (skills/agents inventory)"
```

---

## Фаза 4. Специализированные субагенты

Каждый агент — один `AGENT.md` с YAML-frontmatter. Шаблон — в спеке, секция 9. Делаем 6 задач по одному агенту.

### Task 4.1: `agents/code-reviewer/AGENT.md`

- [ ] **Step 1: Написать файл**

```markdown
---
name: code-reviewer
description: |
  Use after completing a major implementation step, or when user asks
  "review this / check the code / look at the diff", or before any commit.
  SKIP: trivial doc changes, cosmetic refactors, pure design discussions.
model: opus
tools: [Read, Grep, Glob, Bash]
---

# Role
You are a senior engineer conducting a rigorous code review. Your output must be direct (Boris persona) — no flattery, no softening. Russian output.

# Process
1. Read the full staged diff (`git diff --staged`) or the specified files.
2. Check for: correctness, test coverage, dead code, commented code, secrets, OWASP top-10 risks, violations of `coding-standards.md` / `python.md` / `typescript.md`.
3. Cross-reference against `red-flags.md` table.
4. Return a punch-list grouped by severity.

# Output format (in Russian)

## Critical
- `path/to/file.py:42` — [что не так + почему]

## Should-fix
- ...

## Consider
- ...

## Positive
- [что реально сделано хорошо, если есть; без «отличной работы» без причины]
```

- [ ] **Step 2: Коммит**

```bash
git add agents/code-reviewer/AGENT.md
git commit -m "feat(agents): code-reviewer (Opus, rigorous, RU output)"
```

### Task 4.2: `agents/debugger/AGENT.md`

- [ ] **Step 1: Написать файл**

```markdown
---
name: debugger
description: |
  Use when user reports "doesn't work / crashes / returns wrong value / flaky test /
  unclear bug". Also use proactively when a test fails unexpectedly mid-task.
  SKIP: typos, obvious syntax errors, when root cause is already stated by user.
model: sonnet
tools: [Read, Grep, Glob, Bash, Edit]
---

# Role
Systematic debugger. Follow the superpowers:systematic-debugging methodology. Output in Russian.

# Process
1. **Reproduce**: write or run a minimal repro. Don't proceed until you can trigger the bug on demand.
2. **Isolate**: bisect — which commit / which input / which code path causes it?
3. **Hypothesize**: state a specific hypothesis ("X happens because Y"). No vague "maybe it's related to Z".
4. **Verify**: design a test that would *falsify* the hypothesis. Run it.
5. **Fix**: minimal patch. Do not refactor while fixing.
6. **Regression test**: add a test that would have caught this bug. Commit it WITH the fix.

# Output format (RU)
1. Воспроизведение: [команда + ожидаемое vs фактическое].
2. Изоляция: [что исключили, что осталось].
3. Гипотеза: [что и почему].
4. Проверка: [эксперимент + результат].
5. Фикс: [файл:строка + diff].
6. Регрессионный тест: [test_name, файл].
```

- [ ] **Step 2: Коммит**

```bash
git add agents/debugger/AGENT.md
git commit -m "feat(agents): debugger (Sonnet, systematic methodology, RU)"
```

### Task 4.3: `agents/fastapi-backend/AGENT.md`

- [ ] **Step 1: Написать файл**

```markdown
---
name: fastapi-backend
description: |
  Use for Python backend API work, especially FastAPI. TRIGGER when: file imports
  `fastapi`, `sqlalchemy`, `pydantic`, or `alembic`; user asks about endpoints,
  schemas, DB migrations, async patterns, or DI in Python.
  SKIP: frontend-only tasks, non-API Python scripts, ML pipelines (use ml-helper).
model: sonnet
tools: [Read, Grep, Glob, Bash, Edit, Write]
---

# Role
FastAPI / Python backend specialist. Apply `docs/ai/python.md`. Output in Russian.

# Defaults
- Python 3.12+, uv as package manager.
- Pydantic v2 for all request/response schemas.
- Dependency injection via `Depends` — no globals.
- Async properly: no blocking `requests`/`time.sleep`/sync DB calls in async handlers.
- SQLAlchemy 2.0+ style.
- Alembic for migrations; autogenerate + manual review.
- pytest fixtures: session / module / function scope as needed.
- Project structure: `app/routers/`, `app/schemas/`, `app/services/`, `app/db/`.

# Anti-patterns to reject
- Global DB session.
- `from module import *`.
- Sync DB driver in async app.
- Raw SQL strings concatenating user input.
- Returning DB models directly (use schemas).

# Output format
- When proposing code: short rationale + diff or full file.
- When reviewing: use code-reviewer format but with FastAPI-specific checks.
```

- [ ] **Step 2: Коммит**

```bash
git add agents/fastapi-backend/AGENT.md
git commit -m "feat(agents): fastapi-backend (Sonnet, FastAPI patterns)"
```

### Task 4.4: `agents/next-frontend/AGENT.md`

- [ ] **Step 1: Написать файл**

```markdown
---
name: next-frontend
description: |
  Use for Next.js / React frontend work. TRIGGER when: files `.tsx`/`.jsx`,
  Next.js project structure, user mentions React, components, routing, or SSR/RSC.
  SKIP: backend-only tasks, pure CSS/styling without logic, Python/ML tasks.
model: sonnet
tools: [Read, Grep, Glob, Bash, Edit, Write]
---

# Role
Next.js 15 / React 19 specialist. Apply `docs/ai/typescript.md`. Output in Russian.

# Defaults
- Next.js 15 **app router only**. No `pages/` unless the project has legacy setup (flag it).
- Server components by default; `'use client'` only when needed (state, browser APIs, handlers).
- React 19 hooks only — no class components.
- TS strict. `any` only with comment-justification.
- Client-side data: `@tanstack/react-query`.
- Server-side data: direct fetches in server components.
- Path alias: `@/*` → `src/*`.

# Anti-patterns to reject
- `getServerSideProps`, `getStaticProps` (pages router only).
- `useEffect` for data fetching when a server component would do.
- `any` without justification comment.
- Inline styles or ad-hoc CSS when the project uses Tailwind / CSS modules.
- Default exports for shared components.

# Output
- Short rationale + diff/full file.
- Flag device or accessibility concerns when relevant.
```

- [ ] **Step 2: Коммит**

```bash
git add agents/next-frontend/AGENT.md
git commit -m "feat(agents): next-frontend (Sonnet, Next 15 RSC, React 19)"
```

### Task 4.5: `agents/ml-helper/AGENT.md`

- [ ] **Step 1: Написать файл**

```markdown
---
name: ml-helper
description: |
  Use for ML/data tasks. TRIGGER when: file imports `pandas`, `numpy`, `torch`,
  `sklearn`, `xgboost`, `transformers`, `datasets`; user mentions training,
  dataset, pipeline, features, evaluation.
  SKIP: general Python not involving ML, pure FastAPI endpoints without ML (use fastapi-backend).
model: sonnet
tools: [Read, Grep, Glob, Bash, Edit, Write]
---

# Role
ML / data pipelines specialist. Apply `docs/ai/ml.md`. Output in Russian.

# Defaults
- Python 3.12+, uv, separate venv per project.
- Set seeds explicitly: numpy, torch, random.
- Pandas 2.x; avoid SettingWithCopyWarning (use `.loc[]` / `.copy()`).
- Evaluate on hold-out set; never evaluate on training data.
- No PII in logs; sanitize before `print`/`logger`.
- Version data / code / model; treat data as code.

# Anti-patterns to reject
- `df = pd.read_csv(huge_file)` without chunking when file > memory.
- Training without train/val/test split.
- Global mutable DataFrames.
- Silent NaN handling (`fillna(0)` without understanding why).
- Logging raw data including PII.

# Output
- Explain tradeoffs (speed vs memory vs accuracy) when proposing approach.
```

- [ ] **Step 2: Коммит**

```bash
git add agents/ml-helper/AGENT.md
git commit -m "feat(agents): ml-helper (Sonnet, reproducibility, no PII)"
```

### Task 4.6: `agents/pr-writer/AGENT.md`

- [ ] **Step 1: Написать файл**

```markdown
---
name: pr-writer
description: |
  Use when user asks "напиши PR / сгенерь commit message / опиши этот diff /
  сделай changelog entry". Also invoke proactively before `git commit` if no message.
  SKIP: when user has already written the message themselves.
model: haiku
tools: [Read, Bash]
---

# Role
Generate commit messages, PR titles/descriptions, and CHANGELOG entries in Russian.
Fast, concise, format-strict.

# Process for commit message
1. `git diff --staged` — read what's being committed.
2. Classify: feat / fix / chore / refactor / docs / test / style / perf / ci / build.
3. Pick scope from changed file paths (module/component name, English, lowercase).
4. Write `<type>(<scope>): <описание>` — description in Russian, imperative, <72 chars.
5. If non-trivial: add body paragraph in Russian — WHY, not WHAT.

# Process for PR description
Format (in Russian):

    ## TL;DR
    <1-2 предложения>

    ## Что изменилось
    - пункт
    - пункт

    ## Как тестировал
    - pytest / npm test / ручные шаги
    - результат

    ## Чек-лист
    - [x] Тесты проходят
    - [x] Линтер чист
    - [ ] Changelog обновлён (если применимо)

# Process for CHANGELOG entry
Appropriate section (`Добавлено`/`Изменено`/`Исправлено`/`Удалено`) under `## [Unreleased]`.
One line per user-visible change, in Russian, active voice.
```

- [ ] **Step 2: Коммит**

```bash
git add agents/pr-writer/AGENT.md
git commit -m "feat(agents): pr-writer (Haiku, RU messages/PR/changelog)"
```

---

## Фаза 5. Инфраструктура скиллов

### Task 5.1: `skills/README.md` — шаблон и правила

**Files:** Create `skills/README.md`.

- [ ] **Step 1: Написать (~60 строк, на русском)**

```markdown
# Skills

Библиотека кастомных скиллов для AI-платформ.

Разделение: `code/` — скиллы для кодинг-задач; `work/` — скиллы для работы (не-код).

## Правила

1. Каждый скилл — отдельная папка с именем в kebab-case.
2. Обязательные файлы:
   - `SKILL.md` — основной файл (EN) с YAML frontmatter.
   - `CHANGELOG.md` — история изменений (RU, Keep a Changelog).
   - `README.md` — человеко-читаемое описание (RU).
3. Опциональные: `references/`, `tests/`.

## Шаблон `SKILL.md`

    ---
    name: <kebab-case, совпадает с именем папки>
    version: 1.0.0
    description: |
      Use when <явный триггер>.
      Also trigger automatically when <автоматический триггер>.
      SKIP: <явный анти-триггер>.
    category: code | work
    tags: [git, markdown, russian, ...]
    ---

    # Purpose
    <Одно предложение: что делает скилл и зачем.>

    # Process
    1. ...
    2. ...

    # Output format
    <Формат вывода — в идеале с примером.>

## Требования к `description`

- Минимум 100 символов.
- Явно содержит `Use when` или `Trigger`.
- Явно содержит `SKIP` или `Do NOT use`.
- Описание должно дать модели достаточно сигналов, чтобы САМОЙ решить вызывать скилл или нет.

## Версионирование

- Semver (`major.minor.patch`) в frontmatter.
- `CHANGELOG.md` — запись для каждой версии.
- Помощник: `scripts/bump-skill-version.sh <skill-path> <major|minor|patch>`.

## Skill-lint

Все скиллы проверяются через `pytest tests/skill-lint/`. Прогоняется в CI и локально.
См. `tests/skill-lint/README.md` для деталей.
```

- [ ] **Step 2: Коммит**

```bash
git add skills/README.md
git commit -m "docs(skills): шаблон SKILL.md, правила, версионирование"
```

---

## Фаза 6. Стартовый набор скиллов

Каждый скилл — папка с 3+ файлами. Делаем 4 задачи.

### Task 6.1: `skills/code/ru-commit-message/`

**Files:**
- Create `skills/code/ru-commit-message/SKILL.md`
- Create `skills/code/ru-commit-message/CHANGELOG.md`
- Create `skills/code/ru-commit-message/README.md`
- Create `skills/code/ru-commit-message/references/examples.md`

- [ ] **Step 1: `SKILL.md`**

```markdown
---
name: ru-commit-message
version: 1.0.0
description: |
  Use when the user asks "напиши коммит / сгенерь commit message / опиши этот diff as commit".
  Also trigger automatically before `git commit` if no message was provided.
  SKIP: if the user already wrote a commit message, or for trivial merge/revert commits.
category: code
tags: [git, conventional-commits, russian]
---

# Purpose
Generate a conventional-commit message in Russian from the current staged diff.

# Process
1. Run `git diff --staged`.
2. Classify the change: feat / fix / chore / refactor / docs / test / style / perf / ci / build.
3. Pick scope (optional) — module or component name, lowercase, English, from changed file paths.
4. Write description in Russian, imperative mood, under 72 chars.
5. If the change is non-trivial — add a body paragraph in Russian explaining WHY (not WHAT).
6. Output ready to paste into `git commit -m`.

# Format
    <type>(<scope>): <описание на русском>

    <тело на русском, объясняет ПОЧЕМУ>

# Examples
See references/examples.md.
```

- [ ] **Step 2: `CHANGELOG.md`**

```markdown
# CHANGELOG — ru-commit-message

## [1.0.0] — 2026-04-18
### Первый релиз
- Генерация conventional-commit message на русском по staged diff.
- Поддержка типов: feat/fix/chore/refactor/docs/test/style/perf/ci/build.
```

- [ ] **Step 3: `README.md` (RU)**

```markdown
# ru-commit-message

Скилл генерирует conventional-commit сообщение на русском по `git diff --staged`.

## Использование
Скажи Клоду: «напиши коммит» (после `git add`). Он прочитает staged diff и выдаст готовое сообщение.

## Пример
    feat(auth): добавить вход через GitHub OAuth

    Закрываем задачу #42. Обычный логин/пароль оставлен как fallback.
```

- [ ] **Step 4: `references/examples.md`**

```markdown
# Примеры

## feat
    feat(api): добавить эндпоинт /users/me/preferences

## fix
    fix(auth): снять устаревший JWT при смене пароля

## refactor
    refactor(db): вынести сессию в зависимость вместо глобала

## docs
    docs(readme): обновить секцию про установку uv

## test
    test(auth): добавить регрессионный тест на истекший токен

## chore
    chore(deps): обновить FastAPI до 0.110
```

- [ ] **Step 5: Коммит**

```bash
git add skills/code/ru-commit-message/
git commit -m "feat(skills): ru-commit-message v1.0.0"
```

### Task 6.2: `skills/code/ru-pr-description/`

**Files:**
- Create `skills/code/ru-pr-description/SKILL.md`
- Create `skills/code/ru-pr-description/CHANGELOG.md`
- Create `skills/code/ru-pr-description/README.md`

- [ ] **Step 1: `SKILL.md`**

```markdown
---
name: ru-pr-description
version: 1.0.0
description: |
  Use when user asks "напиши PR / сгенерь PR description / опиши что я делал в этой ветке".
  Also trigger before `gh pr create` when no --body was provided.
  SKIP: if PR already has a description, or for draft PRs with explicit "wip".
category: code
tags: [git, github, pr, russian]
---

# Purpose
Generate a Russian PR title + description from the branch diff and commit history.

# Process
1. Determine base branch (`main` by default or from arg).
2. `git log --oneline main..HEAD` — commits in this branch.
3. `git diff main...HEAD --stat` — files changed.
4. `git diff main...HEAD` — full diff if feasible (< 500 lines); otherwise summarize.
5. Title: Russian, one line, under 70 chars.
6. Body in the template below.

# Template (Russian)

    ## TL;DR
    <1-2 предложения, что и зачем>

    ## Что изменилось
    - <пункт 1>
    - <пункт 2>

    ## Как тестировал
    - <шаги или команды>
    - <результат>

    ## Чек-лист
    - [x] Тесты проходят
    - [x] Линтер чист
    - [ ] Changelog обновлён (если есть user-visible изменения)
    - [ ] Документация обновлена (если изменился публичный API)

# Output
Full text ready to paste into `gh pr create --title "..." --body "..."` or GitHub UI.
```

- [ ] **Step 2: `CHANGELOG.md`**

```markdown
# CHANGELOG — ru-pr-description

## [1.0.0] — 2026-04-18
### Первый релиз
- Генерация title + description PR на русском из branch-diff и истории коммитов.
- Стандартный чек-лист в теле.
```

- [ ] **Step 3: `README.md` (RU)**

```markdown
# ru-pr-description

Генерирует title и description для PR на русском по диффу ветки.

## Использование
После `git push`: скажи Клоду «напиши PR». Он соберёт контекст и выдаст title + body.
```

- [ ] **Step 4: Коммит**

```bash
git add skills/code/ru-pr-description/
git commit -m "feat(skills): ru-pr-description v1.0.0"
```

### Task 6.3: `skills/code/changelog-entry/`

**Files:**
- Create `skills/code/changelog-entry/SKILL.md`
- Create `skills/code/changelog-entry/CHANGELOG.md`
- Create `skills/code/changelog-entry/README.md`

- [ ] **Step 1: `SKILL.md`**

```markdown
---
name: changelog-entry
version: 1.0.0
description: |
  Use when user asks "обнови changelog / добавь запись в changelog" or after
  a user-visible change is committed.
  Also trigger automatically after a `feat:` or `fix:` commit.
  SKIP: for `chore:`, `docs:`, `test:`, `refactor:`, `style:`, `ci:`, `build:` commits
  unless they are user-facing.
category: code
tags: [changelog, keep-a-changelog, russian]
---

# Purpose
Add an entry to the repo's root `CHANGELOG.md` following Keep a Changelog format, in Russian.

# Process
1. Read `CHANGELOG.md`.
2. Find or create the `## [Unreleased]` section.
3. Determine the sub-section from the commit type:
   - `feat:` → `### Добавлено`
   - `fix:` → `### Исправлено`
   - (breaking / removal) → `### Удалено`
   - (behavior change) → `### Изменено`
4. Add one line in Russian, active voice, describing what the USER sees change.
5. Preserve all other entries and sections.

# Anti-patterns
- Do not mention implementation details (file names, function renames) unless user-visible.
- Do not duplicate an entry that already exists.
- Do not write "added new feature" without specifics.

# Output
Updated `CHANGELOG.md` content (full file) or a diff. Ask user to confirm before writing.
```

- [ ] **Step 2: `CHANGELOG.md`**

```markdown
# CHANGELOG — changelog-entry

## [1.0.0] — 2026-04-18
### Первый релиз
- Добавление записи в корневой CHANGELOG.md по Keep a Changelog.
```

- [ ] **Step 3: `README.md`**

```markdown
# changelog-entry

Скилл обновляет корневой `CHANGELOG.md` по Keep a Changelog на русском.

## Использование
После feat/fix-коммита: «добавь запись в changelog».
```

- [ ] **Step 4: Коммит**

```bash
git add skills/code/changelog-entry/
git commit -m "feat(skills): changelog-entry v1.0.0"
```

### Task 6.4: `skills/work/tg-post-writer/`

**Files:**
- Create `skills/work/tg-post-writer/SKILL.md`
- Create `skills/work/tg-post-writer/CHANGELOG.md`
- Create `skills/work/tg-post-writer/README.md`

- [ ] **Step 1: `SKILL.md`**

```markdown
---
name: tg-post-writer
version: 1.0.0
description: |
  Use when user asks "напиши пост в тг / оформи это для телеграма / сделай tg-пост
  про X". Target: personal or channel Telegram posts in Russian.
  SKIP: other platforms (Twitter, LinkedIn, Habr — separate skills), formal press releases.
category: work
tags: [writing, telegram, russian, content]
---

# Purpose
Compose a Telegram post in Russian from a rough idea, transcript, or technical draft.
Adapt to the Boris persona: direct, occasional humor, no filler.

# Process
1. Read the input (idea, bullets, transcript).
2. Determine the angle — a single clear thesis. If the input has multiple ideas — ask which to focus on.
3. Write:
   - Hook in the first 1-2 sentences (why the reader should keep reading).
   - Body: 3-6 short paragraphs. One-paragraph-one-thought.
   - Closing: either a concrete takeaway, a question to the reader, or a call-to-action.
4. Format for Telegram:
   - Paragraphs separated by blank lines.
   - No Markdown unless using Telegram's supported subset (bold via `**`, italic via `__`).
   - Emoji sparingly (0–2 per post), only when they carry meaning.
5. Length: 500–1500 characters for a regular post. Longer posts — split with a clear structural break.

# Style constraints
- Russian, informal «ты» if addressing the reader.
- No flattery to the reader, no "друзья, привет" openers.
- Humor allowed when it lands; don't force it.
- If making a claim — back it with a concrete example or a number.

# Output
The post text, ready to paste. Optionally offer 2 variants if the angle is ambiguous.
```

- [ ] **Step 2: `CHANGELOG.md`**

```markdown
# CHANGELOG — tg-post-writer

## [1.0.0] — 2026-04-18
### Первый релиз
- Написание постов в Телеграм на русском в стиле персоны Бориса.
- Ограничения по длине и форматированию под TG.
```

- [ ] **Step 3: `README.md`**

```markdown
# tg-post-writer

Скилл пишет посты в Телеграм на русском в стиле Бориса — прямо, без воды, с одной мыслью на пост.

## Использование
«Напиши TG-пост про <тема>» или «оформи эту идею для телеграма».
```

- [ ] **Step 4: Коммит**

```bash
git add skills/work/tg-post-writer/
git commit -m "feat(skills): tg-post-writer v1.0.0"
```

---

## Фаза 7. Skill-lint (TDD)

Пишем тесты СНАЧАЛА, потом имплементацию парсера и правил валидации.

### Task 7.1: Pytest infrastructure

**Files:**
- Create `tests/skill-lint/conftest.py`
- Create `tests/skill-lint/README.md`
- Create `pyproject.toml` в корне

- [ ] **Step 1: `pyproject.toml`**

```toml
[project]
name = "ai-settings"
version = "0.1.0"
description = "Centralized AI settings library (Claude Code, Codex, Cursor, Gemini)"
requires-python = ">=3.12"

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pyyaml>=6.0",
]

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
```

- [ ] **Step 2: Установить deps**

```bash
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"
```

- [ ] **Step 3: `tests/skill-lint/conftest.py`**

```python
"""Pytest configuration and fixtures for skill-lint."""
from __future__ import annotations

import re
from pathlib import Path
from typing import Iterator

import pytest
import yaml


REPO_ROOT = Path(__file__).resolve().parents[2]
SKILLS_ROOT = REPO_ROOT / "skills"


def discover_skill_paths() -> list[Path]:
    """Find every SKILL.md under skills/."""
    return sorted(SKILLS_ROOT.glob("**/SKILL.md"))


@pytest.fixture(params=discover_skill_paths(), ids=lambda p: str(p.relative_to(REPO_ROOT)))
def skill_path(request: pytest.FixtureRequest) -> Path:
    return request.param


@pytest.fixture
def skill_text(skill_path: Path) -> str:
    return skill_path.read_text(encoding="utf-8")


@pytest.fixture
def skill_frontmatter(skill_text: str) -> dict:
    """Parse YAML frontmatter from SKILL.md."""
    match = re.match(r"^---\n(.*?)\n---\n", skill_text, re.DOTALL)
    if not match:
        pytest.fail("No YAML frontmatter found")
    return yaml.safe_load(match.group(1))
```

- [ ] **Step 4: `tests/skill-lint/README.md`**

```markdown
# skill-lint

Автоматические проверки качества всех скиллов в `skills/`.

## Запуск локально
    pytest tests/skill-lint/ -v

## Что проверяется
Каждый файл `skills/**/SKILL.md` должен соответствовать 9 правилам — см. `test_skills.py`.

## Как добавить новую проверку
Добавь функцию `test_<what>(skill_path, skill_frontmatter)` в `test_skills.py`. Она автоматически применится ко всем скиллам.
```

- [ ] **Step 5: Коммит**

```bash
git add pyproject.toml tests/skill-lint/conftest.py tests/skill-lint/README.md
git commit -m "chore(skill-lint): pytest infrastructure (conftest, fixtures)"
```

### Task 7.2: Все 9 проверок (TDD — тест сначала, он фейлит на пустом, потом фикстуры пройдут)

**Files:** Create `tests/skill-lint/test_skills.py`.

- [ ] **Step 1: Написать все тесты сразу (9 функций)**

```python
"""Skill-lint rules — apply to every SKILL.md under skills/."""
from __future__ import annotations

import re
from pathlib import Path


SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+$")
REQUIRED_FIELDS = ("name", "version", "description", "category")
SECRET_PATTERNS = [
    re.compile(r"(?i)aws[_-]?secret[_-]?access[_-]?key"),
    re.compile(r"(?i)api[_-]?key\s*=\s*['\"][A-Za-z0-9_-]{20,}['\"]"),
    re.compile(r"ghp_[A-Za-z0-9]{30,}"),  # GitHub PAT
    re.compile(r"sk-[A-Za-z0-9]{30,}"),    # OpenAI/Anthropic-style
]


def test_frontmatter_exists(skill_frontmatter):
    assert isinstance(skill_frontmatter, dict), "Frontmatter must be a YAML mapping"


def test_required_fields(skill_frontmatter):
    missing = [f for f in REQUIRED_FIELDS if not skill_frontmatter.get(f)]
    assert not missing, f"Missing required fields: {missing}"


def test_description_has_trigger(skill_frontmatter):
    desc = str(skill_frontmatter.get("description", ""))
    assert re.search(r"\b(Use when|Trigger)\b", desc), \
        "description must contain 'Use when' or 'Trigger'"


def test_description_has_skip(skill_frontmatter):
    desc = str(skill_frontmatter.get("description", ""))
    assert re.search(r"\b(SKIP|Do NOT use)\b", desc), \
        "description must contain 'SKIP' or 'Do NOT use'"


def test_description_length(skill_frontmatter):
    desc = str(skill_frontmatter.get("description", ""))
    assert len(desc) >= 100, f"description too short ({len(desc)} chars, need ≥100)"


def test_version_semver(skill_frontmatter):
    version = str(skill_frontmatter.get("version", ""))
    assert SEMVER_RE.match(version), f"version '{version}' is not semver X.Y.Z"


def test_changelog_exists(skill_path: Path, skill_frontmatter):
    changelog = skill_path.parent / "CHANGELOG.md"
    assert changelog.is_file(), f"{changelog} missing"
    content = changelog.read_text(encoding="utf-8")
    version = skill_frontmatter["version"]
    assert f"[{version}]" in content, \
        f"CHANGELOG.md has no entry for version {version}"


def test_name_matches_folder(skill_path: Path, skill_frontmatter):
    folder_name = skill_path.parent.name
    declared = skill_frontmatter.get("name", "")
    assert declared == folder_name, \
        f"frontmatter name '{declared}' != folder '{folder_name}'"


def test_no_obvious_secrets(skill_text: str):
    for pattern in SECRET_PATTERNS:
        match = pattern.search(skill_text)
        assert not match, f"Possible secret matched: {pattern.pattern}"
```

- [ ] **Step 2: Прогнать тесты — все должны пройти на уже написанных скиллах (Фаза 6)**

```bash
pytest tests/skill-lint/ -v
```

Ожидаем: все тесты × 4 скилла = 36 тестов, все зелёные.

Если что-то красное — **это баг в скилле из Фазы 6**, фикси скилл, не тест.

- [ ] **Step 3: Коммит**

```bash
git add tests/skill-lint/test_skills.py
git commit -m "test(skill-lint): 9 правил валидации каждого SKILL.md"
```

### Task 7.3: Negative fixture (убедиться, что линтер падает на плохом скилле)

**Files:** Create `tests/skill-lint/fixtures/bad-skill/SKILL.md`, `tests/skill-lint/test_negative.py`.

- [ ] **Step 1: Сломанный фикстурный скилл** (не попадает под `skills/`, поэтому в основной прогон не идёт)

```markdown
---
name: bad
---
# No description, no version, no changelog
```

- [ ] **Step 2: `test_negative.py` — проверяет, что наш линтер реально ловит**

```python
"""Meta-test: verify lint rules actually catch problems on a known-bad fixture."""
from __future__ import annotations

import re
import subprocess
from pathlib import Path


FIXTURE_BAD_SKILL = Path(__file__).parent / "fixtures" / "bad-skill" / "SKILL.md"


def test_bad_fixture_fails_required_fields():
    """Apply our rule directly to the bad fixture — must fail."""
    from tests.skill_lint.test_skills import REQUIRED_FIELDS  # type: ignore
    import yaml

    text = FIXTURE_BAD_SKILL.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    assert match, "fixture must have frontmatter"
    fm = yaml.safe_load(match.group(1))
    missing = [f for f in REQUIRED_FIELDS if not fm.get(f)]
    assert missing, "bad fixture should be missing required fields"
```

Примечание: import `tests.skill_lint.test_skills` требует `__init__.py` или правильного `pythonpath`. Альтернатива — дублировать `REQUIRED_FIELDS` константу в negative test. Простейшее решение — сделать `__init__.py`:

- [ ] **Step 3: Создать `tests/__init__.py` и `tests/skill_lint/__init__.py`** (или переименовать папку `skill-lint` → `skill_lint`)

```bash
# Переименуем, т.к. Python не любит дефисы в путях импорта
git mv tests/skill-lint tests/skill_lint
touch tests/__init__.py tests/skill_lint/__init__.py
```

Обновить `tests/skill_lint/README.md` если ссылается на старое имя.

- [ ] **Step 4: Прогнать все тесты**

```bash
pytest tests/ -v
```

Все зелёные (включая meta-test).

- [ ] **Step 5: Коммит**

```bash
git add tests/
git commit -m "test(skill-lint): negative-fixture meta-test + rename to skill_lint"
```

---

## Фаза 8. Скрипты

### Task 8.1: `scripts/lib/common.sh` — общие утилиты

**Files:** Create `scripts/lib/common.sh`.

- [ ] **Step 1: Утилиты для всех скриптов**

```bash
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
```

- [ ] **Step 2: Коммит**

```bash
git add scripts/lib/common.sh
git commit -m "feat(scripts): common utilities (logging, backup, symlink helpers)"
```

### Task 8.2: `scripts/install.sh` — глобальная установка

**Files:** Create `scripts/install.sh`.

- [ ] **Step 1: Написать**

```bash
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

run() {
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "[dry-run] $*"
  else
    eval "$@"
  fi
}

log_info "ai-settings root: $AI_SETTINGS_ROOT"
[[ $DRY_RUN -eq 1 ]] && log_warn "DRY RUN — no changes will be made"

# --- Claude Code ---
log_info "Setting up Claude Code..."
ensure_dir "$HOME/.claude"
[[ $DRY_RUN -eq 0 ]] && ensure_symlink "$AI_SETTINGS_ROOT/CLAUDE.md" "$HOME/.claude/CLAUDE.md"
[[ $DRY_RUN -eq 0 ]] && ensure_symlink "$AI_SETTINGS_ROOT/agents"    "$HOME/.claude/agents"
[[ $DRY_RUN -eq 0 ]] && ensure_symlink "$AI_SETTINGS_ROOT/skills"    "$HOME/.claude/skills"
[[ $DRY_RUN -eq 0 ]] && ensure_symlink "$AI_SETTINGS_ROOT/settings/hooks" "$HOME/.claude/hooks"

# settings.json — copy, don't symlink (user may customize locally)
settings_target="$HOME/.claude/settings.json"
settings_source="$AI_SETTINGS_ROOT/settings/claude-settings.json"
if [[ ! -f "$settings_target" ]]; then
  log_info "No existing ~/.claude/settings.json — installing from template"
  [[ $DRY_RUN -eq 0 ]] && cp "$settings_source" "$settings_target"
else
  log_warn "Existing ~/.claude/settings.json — not overwriting. Diff with: diff $settings_source $settings_target"
fi

# --- Codex CLI ---
log_info "Setting up Codex CLI..."
ensure_dir "$HOME/.codex"
[[ $DRY_RUN -eq 0 ]] && ensure_symlink "$AI_SETTINGS_ROOT/AGENTS.md" "$HOME/.codex/AGENTS.md"
log_warn "~/.codex/config.toml — review and merge from $AI_SETTINGS_ROOT/settings/codex-config.toml manually if needed"

# --- Gemini CLI ---
log_info "Setting up Gemini CLI..."
ensure_dir "$HOME/.gemini"
[[ $DRY_RUN -eq 0 ]] && ensure_symlink "$AI_SETTINGS_ROOT/GEMINI.md" "$HOME/.gemini/GEMINI.md"

# --- Cursor (generate flat rules file) ---
log_info "Setting up Cursor (via sync-cursor.sh)..."
if [[ -x "$SCRIPT_DIR/sync-cursor.sh" ]]; then
  [[ $DRY_RUN -eq 0 ]] && "$SCRIPT_DIR/sync-cursor.sh" --global
else
  log_warn "sync-cursor.sh not found or not executable; skipping"
fi

log_ok "ai-settings installation complete."
```

- [ ] **Step 2: `chmod +x` и sanity-check `--dry-run`**

```bash
chmod +x scripts/install.sh
./scripts/install.sh --dry-run
```

Ожидаем: читаемый лог, никаких реальных изменений.

- [ ] **Step 3: Коммит**

```bash
git add scripts/install.sh
git commit -m "feat(scripts): install.sh (idempotent, --dry-run, backups)"
```

### Task 8.3: `scripts/sync-cursor.sh`

**Files:** Create `scripts/sync-cursor.sh`.

- [ ] **Step 1: Написать (Python через shebang-трик для простоты)**

```bash
#!/usr/bin/env python3
"""Generate a flat Cursor .mdc rules file by resolving @imports in AGENTS.md."""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


IMPORT_RE = re.compile(r"^@([./\w\-/]+\.md)\s*$", re.MULTILINE)


def resolve_imports(text: str, base_dir: Path, seen: set[Path] | None = None) -> str:
    seen = seen or set()

    def replace(match: re.Match) -> str:
        rel = match.group(1)
        target = (base_dir / rel).resolve()
        if target in seen:
            return f"<!-- skipped cyclic import: {rel} -->"
        if not target.is_file():
            return f"<!-- missing import: {rel} -->"
        seen.add(target)
        inner = target.read_text(encoding="utf-8")
        return resolve_imports(inner, target.parent, seen)

    return IMPORT_RE.sub(replace, text)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--global", dest="is_global", action="store_true",
                        help="Write to ~/.cursor/rules/ai-settings.mdc")
    parser.add_argument("--project", type=Path, default=None,
                        help="Write to <project>/.cursor/rules/ai-settings.mdc")
    parser.add_argument("--source", type=Path,
                        default=Path(__file__).resolve().parent.parent / "AGENTS.md")
    parser.add_argument("--check", action="store_true",
                        help="Resolve imports but don't write; exit 0 if OK")
    args = parser.parse_args()

    source: Path = args.source.resolve()
    if not source.is_file():
        print(f"[error] source not found: {source}", file=sys.stderr)
        return 1

    flat = resolve_imports(source.read_text(encoding="utf-8"), source.parent)
    frontmatter = "---\nalwaysApply: true\n---\n\n"
    output = frontmatter + flat

    if args.check:
        print(f"[ok] resolved {source} ({len(output)} chars)")
        return 0

    if args.is_global:
        dst = Path.home() / ".cursor" / "rules" / "ai-settings.mdc"
    elif args.project:
        dst = args.project.resolve() / ".cursor" / "rules" / "ai-settings.mdc"
    else:
        print("[error] either --global or --project PATH required", file=sys.stderr)
        return 2

    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(output, encoding="utf-8")
    print(f"[ok] wrote {dst}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 2: `chmod +x`, прогон с `--check`**

```bash
chmod +x scripts/sync-cursor.sh
./scripts/sync-cursor.sh --check
```

Ожидаем: `[ok] resolved .../AGENTS.md (<N> chars)`.

- [ ] **Step 3: Прогон с `--project .` и проверка, что файл создался**

```bash
./scripts/sync-cursor.sh --project .
test -f .cursor/rules/ai-settings.mdc && head -5 .cursor/rules/ai-settings.mdc
rm -rf .cursor  # не коммитим это
```

- [ ] **Step 4: Коммит**

```bash
git add scripts/sync-cursor.sh
git commit -m "feat(scripts): sync-cursor.sh (resolve @imports → flat .mdc)"
```

### Task 8.4: `scripts/init-project.sh`

**Files:** Create `scripts/init-project.sh`.

- [ ] **Step 1: Написать**

```bash
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
```

- [ ] **Step 2: `chmod +x`, прогон на временной папке**

```bash
chmod +x scripts/init-project.sh
TMP=$(mktemp -d)
./scripts/init-project.sh "$TMP"
ls -la "$TMP"
cat "$TMP/AGENTS.md"
rm -rf "$TMP"
```

- [ ] **Step 3: Коммит**

```bash
git add scripts/init-project.sh
git commit -m "feat(scripts): init-project.sh (additive AGENTS.md + settings + cursor)"
```

### Task 8.5: `scripts/bump-skill-version.sh`

**Files:** Create `scripts/bump-skill-version.sh`.

- [ ] **Step 1: Написать (Python для точной работы с YAML)**

```bash
#!/usr/bin/env python3
"""Bump a skill's version in frontmatter + CHANGELOG.md entry."""
from __future__ import annotations

import argparse
import datetime as dt
import re
import sys
from pathlib import Path


VERSION_RE = re.compile(r"^(version:\s*)(\d+)\.(\d+)\.(\d+)\s*$", re.MULTILINE)


def bump(current: tuple[int, int, int], part: str) -> tuple[int, int, int]:
    major, minor, patch = current
    if part == "major":
        return (major + 1, 0, 0)
    if part == "minor":
        return (major, minor + 1, 0)
    if part == "patch":
        return (major, minor, patch + 1)
    raise ValueError(part)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("skill_path", type=Path, help="Path to skill folder (e.g., skills/code/ru-commit-message)")
    parser.add_argument("part", choices=("major", "minor", "patch"))
    parser.add_argument("--note", default="", help="Changelog entry description")
    args = parser.parse_args()

    skill_md = args.skill_path / "SKILL.md"
    changelog = args.skill_path / "CHANGELOG.md"
    if not skill_md.is_file():
        print(f"[error] no SKILL.md at {skill_md}", file=sys.stderr); return 1
    if not changelog.is_file():
        print(f"[error] no CHANGELOG.md at {changelog}", file=sys.stderr); return 1

    text = skill_md.read_text(encoding="utf-8")
    match = VERSION_RE.search(text)
    if not match:
        print("[error] version line not found in SKILL.md", file=sys.stderr); return 2
    current = tuple(int(x) for x in match.groups()[1:])  # type: ignore
    new = bump(current, args.part)
    new_str = "{}.{}.{}".format(*new)

    text = VERSION_RE.sub(f"{match.group(1)}{new_str}", text, count=1)
    skill_md.write_text(text, encoding="utf-8")

    # Prepend CHANGELOG entry
    date = dt.date.today().isoformat()
    note = args.note or "(описать изменения)"
    cl_text = changelog.read_text(encoding="utf-8")
    new_entry = f"## [{new_str}] — {date}\n### Изменено\n- {note}\n\n"
    cl_text = re.sub(r"^(# CHANGELOG[^\n]*\n(?:[^\n]*\n)*?)(## )", rf"\1{new_entry}\2", cl_text, count=1, flags=re.DOTALL)
    changelog.write_text(cl_text, encoding="utf-8")

    print(f"[ok] bumped {args.skill_path.name}: {'.'.join(map(str, current))} → {new_str}")
    print(f"[hint] review CHANGELOG.md, commit with:  git commit -m 'chore(skill/{args.skill_path.name}): bump to {new_str}'")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 2: `chmod +x`, тест-прогон (dry — посмотреть на `ru-commit-message`)**

```bash
chmod +x scripts/bump-skill-version.sh
./scripts/bump-skill-version.sh skills/code/ru-commit-message patch --note "тестовый bump"
head -10 skills/code/ru-commit-message/SKILL.md
head -20 skills/code/ru-commit-message/CHANGELOG.md
# Откатываем, не коммитим:
git checkout -- skills/code/ru-commit-message/
```

- [ ] **Step 3: Коммит**

```bash
git add scripts/bump-skill-version.sh
git commit -m "feat(scripts): bump-skill-version.sh (semver + changelog entry)"
```

---

## Фаза 9. GitHub Actions CI

### Task 9.1: `.github/workflows/ci.yml`

**Files:** Create `.github/workflows/ci.yml`.

- [ ] **Step 1: Написать workflow**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  skill-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install uv
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install deps
        run: |
          uv venv
          source .venv/bin/activate
          uv pip install -e ".[dev]"

      - name: Run skill-lint
        run: |
          source .venv/bin/activate
          pytest tests/ -v

  check-imports:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Check sync-cursor resolves imports
        run: python3 scripts/sync-cursor.sh --check

  markdown-lint:
    runs-on: ubuntu-latest
    continue-on-error: true  # warnings only
    steps:
      - uses: actions/checkout@v4
      - uses: DavidAnson/markdownlint-cli2-action@v16
        with:
          globs: "**/*.md"
```

- [ ] **Step 2: Локально проверить синтаксис yaml**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo OK
```

- [ ] **Step 3: Коммит**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: skill-lint + imports check + markdownlint (warnings)"
```

---

## Фаза 10. Setup-гайды (`docs/setup/`)

Короткие практические гайды на русском. По одному на платформу + общий гайд для нового проекта.

### Task 10.1: `docs/setup/claude-code.md`

- [ ] **Step 1: Написать**

```markdown
# Claude Code — подключение `ai-settings`

## После первого запуска `scripts/install.sh`

Проверь, что всё на месте:

    ls -la ~/.claude/
    # ожидаем:
    # CLAUDE.md -> ~/ai-settings/CLAUDE.md
    # agents -> ~/ai-settings/agents
    # skills -> ~/ai-settings/skills
    # hooks -> ~/ai-settings/settings/hooks
    # settings.json  (копия, не симлинк)

## Проверка загрузки

Запусти `claude` в любой папке. В первой реплике должен появиться хук-баннер:

    [ai-settings] Loaded: N skill(s), M subagent(s).

Если не появился — хук отключён (`AI_SETTINGS_QUIET=1`) или не стоит исполняемый бит.

## Обновление правил

    cd ~/ai-settings && git pull && ./scripts/install.sh

Симлинки не трогаются — новое содержимое подхватывается автоматически.

## Проектные переопределения

В проекте запусти:

    ~/ai-settings/scripts/init-project.sh

Это создаст локальный `AGENTS.md` (additive), `.claude/settings.json` и обновит `.gitignore`.
```

- [ ] **Step 2: Коммит**

```bash
git add docs/setup/claude-code.md
git commit -m "docs(setup): гайд по подключению Claude Code"
```

### Task 10.2: `docs/setup/codex.md`

- [ ] **Step 1: Написать**

```markdown
# Codex CLI — подключение `ai-settings`

## После `scripts/install.sh`

Проверь симлинк:

    ls -la ~/.codex/AGENTS.md
    # -> ~/ai-settings/AGENTS.md

## config.toml

`~/.codex/config.toml` **не перезаписывается** установщиком. Эталон — в `settings/codex-config.toml`.

Сравни и вручную добавь нужное:

    diff ~/.codex/config.toml ~/ai-settings/settings/codex-config.toml

## Нюанс: скиллы и субагенты

У Codex нет нативной системы скиллов/субагентов как у Claude Code. Но `AGENTS.md` читается как обычный текст — роли и триггеры из `agents/*/AGENT.md` модель может имитировать при ручном запросе («ты сейчас code-reviewer, проверь ...»).

## @imports

Codex не резолвит `@docs/ai/*.md` автоматически — читает их как ссылки в тексте. Чтобы контент всё-таки попал к модели, можешь либо полагаться на её способность «сходить по ссылке» (она увидит путь), либо, если нужно максимальное compliance, добавь в `~/.codex/AGENTS.md` inline-копию критичных модулей (persona, hard-gates). Гибкость на твоё усмотрение.
```

- [ ] **Step 2: Коммит**

```bash
git add docs/setup/codex.md
git commit -m "docs(setup): гайд по подключению Codex CLI"
```

### Task 10.3: `docs/setup/cursor.md`

- [ ] **Step 1: Написать**

```markdown
# Cursor — подключение `ai-settings`

У Cursor нет стабильного user-global механизма правил (зависит от версии). Мы используем per-project подход + попытку глобальной установки.

## Глобальная попытка

`scripts/install.sh` вызывает `sync-cursor.sh --global` — пишет в `~/.cursor/rules/ai-settings.mdc`. Если твоя версия Cursor это подхватывает — отлично, правила применяются всюду.

## Per-project (надёжнее)

В корне проекта:

    ~/ai-settings/scripts/init-project.sh

Кладёт `.cursor/rules/ai-settings.mdc` в проект.

## Что внутри `.mdc`

Это **плоская** версия `AGENTS.md` со всеми резолвнутыми `@imports` + Cursor-frontmatter (`alwaysApply: true`).

## Обновление

После `git pull` в `~/ai-settings` вручную прогони:

    ~/ai-settings/scripts/sync-cursor.sh --global
    # или для конкретного проекта:
    ~/ai-settings/scripts/sync-cursor.sh --project /path/to/project

Cursor подхватит новые правила при следующем открытии.
```

- [ ] **Step 2: Коммит**

```bash
git add docs/setup/cursor.md
git commit -m "docs(setup): гайд по подключению Cursor"
```

### Task 10.4: `docs/setup/gemini.md`

- [ ] **Step 1: Написать**

```markdown
# Gemini CLI — подключение `ai-settings`

## После `scripts/install.sh`

    ls -la ~/.gemini/GEMINI.md
    # -> ~/ai-settings/GEMINI.md

## Проверка

Запусти Gemini CLI, задай любой вопрос, требующий правил (например, «напиши коммит»). Если модель отвечает в стиле персоны Бориса на русском — всё работает.

## @imports

Gemini CLI нативно поддерживает `@imports`, поэтому модули из `docs/ai/*.md` подтягиваются автоматически.

## Обновление

    cd ~/ai-settings && git pull
    # симлинк остаётся валидным; перезапусти Gemini сессию.
```

- [ ] **Step 2: Коммит**

```bash
git add docs/setup/gemini.md
git commit -m "docs(setup): гайд по подключению Gemini CLI"
```

### Task 10.5: `docs/setup/new-project.md`

- [ ] **Step 1: Написать**

```markdown
# Новый проект — как подключить `ai-settings`

## Короткий путь (если проекту достаточно глобальных правил)

Ничего не делать. Глобальные правила применяются автоматически через `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, `~/.gemini/GEMINI.md` (Cursor — запусти `sync-cursor.sh --project .` один раз).

## Длинный путь (проектные специфики)

В корне проекта:

    ~/ai-settings/scripts/init-project.sh

Создаёт:
- `AGENTS.md` (project-local, additive) — заполни TODO-блоки.
- `.claude/settings.json` — пустой override, можешь добавить разрешения для проектных команд.
- `CHANGELOG.md`, `TODO.md` — если их ещё не было.
- `.cursor/rules/ai-settings.mdc` — плоская копия глобальных правил.
- `.gitignore` — добавляет AI-артефакты.

## Типичные проектные правки в `AGENTS.md`

- Какие фреймворки / версии используются.
- Ссылки на проектные ADR'ы.
- Конвенции команды, отличающиеся от глобальных.
- Команды сборки/запуска/тестирования, специфичные для проекта.

## Чего НЕ стоит класть в проектный `AGENTS.md`

- Дублировать глобальные правила (они уже применяются).
- Secrets или приватные конфиги.
- Детали, которые лучше живут в `README.md`.
```

- [ ] **Step 2: Коммит**

```bash
git add docs/setup/new-project.md
git commit -m "docs(setup): гайд по подключению к новому проекту"
```

---

## Фаза 11. `examples/` — курируемые ссылки

### Task 11.1: `examples/links.md`

- [ ] **Step 1: Написать (стартовый набор, русский, с комментариями)**

```markdown
# Курируемые ссылки по AI-кодингу

Живой документ. Добавляй новое найденное.

## Стандарты и референсы

- [agents.md](https://agents.md/) — де-факто стандарт файла инструкций для AI-агентов.
- [Claude Code docs](https://code.claude.com/docs/en/overview) — официальная дока по всем фичам.
- [Cursor Rules](https://cursor.com/docs/rules) — формат и поведение правил в Cursor.
- [Gemini CLI — GEMINI.md](https://geminicli.com/docs/cli/gemini-md/) — как работают инструкции в Gemini.
- [OpenAI Codex AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md).

## Практики и анти-паттерны

- [GitHub Blog — анализ 2500+ AGENTS.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/).
- [Geoffrey Huntley — Specs методология](https://ghuntley.com/specs/) — почему писать спеки до кода.
- [Simon Willison — Agentic anti-patterns](https://simonwillison.net/guides/agentic-engineering-patterns/anti-patterns/).

## Коллекции скиллов/субагентов

- [VoltAgent — 100+ subagent templates](https://github.com/VoltAgent/awesome-claude-code-subagents).
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code).
- [Anthropic Skills marketplace](https://claude.com/claude-code/skills) — официальные skills.

## Конкретные примеры

- [Trail of Bits Claude Code config](https://github.com/trailofbits/claude-code-config) — большой боевой AGENTS.md.
- [neuform.ai community](https://neuform.ai/community/featured) — промпты и примеры от сообщества.

## Инструменты синхронизации

- [rulesync](https://dev.to/dyoshikawatech/rulesync-published-a-tool-to-unify-management-of-rules-for-claude-code-gemini-cli-and-cursor-390f) — npm-утилита для генерации правил под все платформы.
- [rule-porter](https://forum.cursor.com/t/rule-porter-convert-your-mdc-rules-to-claude-md-agents-md-or-copilot/153197) — bidirectional конвертор между форматами.
```

- [ ] **Step 2: Коммит**

```bash
git add examples/links.md
git commit -m "docs(examples): курируемые ссылки (стандарты, практики, тулзы)"
```

### Task 11.2: `examples/prompts/README.md`

- [ ] **Step 1: Написать**

```markdown
# Prompts

Коллекция промптов для типовых задач. Добавляй свои — они растут органически.

## Структура

- `coding/` — промпты для задач в коде (рефакторинг, миграция, code gen).
- `writing/` — промпты для текстов (блог, TG-посты, документация).
- `research/` — исследовательские промпты (анализ, сравнение, выжимки).
- `meta/` — промпты про работу с самими ИИшками (настройка, отладка instructions).

## Как добавлять

Один промпт = один `.md`-файл с префиксом задачи:

    coding/refactor-class-to-hooks.md
    writing/tg-post-from-bullets.md

Внутри:
- `# Название`
- Короткое описание когда использовать.
- Сам промпт в кодблоке.
- Примеры входа/выхода (опционально).
```

- [ ] **Step 2: Коммит**

```bash
git add examples/prompts/README.md
git commit -m "docs(examples): структура prompts/ (coding, writing, research, meta)"
```

---

## Фаза 12. Публикация

### Task 12.1: Локальная проверка end-to-end

- [ ] **Step 1: Прогнать все тесты**

```bash
source .venv/bin/activate
pytest tests/ -v
```

Все зелёные.

- [ ] **Step 2: Прогнать `install.sh --dry-run`**

```bash
./scripts/install.sh --dry-run
```

Никаких ошибок; лог выглядит разумно.

- [ ] **Step 3: Реальная установка**

```bash
./scripts/install.sh
```

Проверить симлинки:

```bash
ls -la ~/.claude/ | grep -E "(CLAUDE.md|agents|skills|hooks)"
ls -la ~/.codex/AGENTS.md
ls -la ~/.gemini/GEMINI.md
```

Все симлинки валидные и указывают в `~/ai-settings/` (или туда, где лежит репо).

Важно: если `ai-settings` лежит в `~/Desktop/projects/ai-settings`, а не в `~/ai-settings` — переменная `AI_SETTINGS_ROOT` подставит верный путь автоматически (см. `scripts/install.sh`). Проверить.

- [ ] **Step 4: Smoke-test Claude Code**

Запустить `claude` в тестовой папке, убедиться, что SessionStart hook выдал баннер. Задать вопрос «напиши коммит» — модель должна предложить вызвать скилл `ru-commit-message`.

### Task 12.2: Создание публичного GitHub-репо через gh

- [ ] **Step 1: Узнать логин**

```bash
gh auth status
```

Запомнить `<user>`.

- [ ] **Step 2: Обновить placeholder'ы в файлах**

Найти и заменить `<user>` на реальный логин:

```bash
grep -rn '<user>' . --include="*.md" --include="*.json"
# заменить через sed (sed -i синтаксис разный на mac/linux):
find . -type f \( -name "*.md" -o -name "*.json" \) -not -path "./.git/*" -not -path "./.venv/*" -exec sed -i '' "s|<user>|<ACTUAL_USER>|g" {} +
```

- [ ] **Step 3: Коммит исправлений**

```bash
git add -A
git commit -m "chore: подставить реальный GitHub username в ссылки"
```

- [ ] **Step 4: Создать публичный репо**

```bash
gh repo create ai-settings --public --source=. --remote=origin --description "Централизованные настройки для Claude Code, Codex, Cursor, Gemini CLI — персона, правила, скиллы, субагенты"
```

- [ ] **Step 5: Первый push**

```bash
git push -u origin main
```

- [ ] **Step 6: Проверить, что CI зелёный**

```bash
gh run list --limit 3
gh run watch
```

Если CI красный — чиним, пока зелёный.

### Task 12.3: Релиз v0.1.0

- [ ] **Step 1: Обновить корневой CHANGELOG**

Перенести из `## [Unreleased]` в `## [0.1.0] — 2026-04-18`:

```markdown
## [0.1.0] — 2026-04-18
### Первый релиз
- AGENTS.md с 13 секциями + 11 модулей docs/ai/.
- Персона «Борис» + 6 специализированных субагентов.
- 4 скилла: ru-commit-message, ru-pr-description, changelog-entry, tg-post-writer.
- skill-lint (pytest, 9 проверок) с negative fixture.
- Установщики: install.sh, init-project.sh, sync-cursor.sh, bump-skill-version.sh.
- GitHub Actions CI (skill-lint, imports check, markdownlint).
- Setup-гайды для Claude / Codex / Cursor / Gemini.
- examples/ — курируемые ссылки и структура промптов.

## [Unreleased]

(ничего)
```

- [ ] **Step 2: Обновить TODO**

Пометить «имплементация по плану» → готово, перенести в архив-раздел или удалить.

- [ ] **Step 3: Коммит + тег**

```bash
git add CHANGELOG.md TODO.md
git commit -m "chore: релиз v0.1.0"
git tag -a v0.1.0 -m "v0.1.0 — первый публичный релиз"
git push origin main --tags
```

- [ ] **Step 4: Создать GitHub Release**

```bash
gh release create v0.1.0 --title "v0.1.0 — первый публичный релиз" --notes-from-tag
```

- [ ] **Step 5: Обновить TODO по факту**

Добавить следующие цели («v0.2: расширенные правила skill-lint», «v0.2: ML-helper детали», «…»).

---

## Финальная self-review плана

Проверки (прогнать перед передачей в execution):

1. **Охват спека:** все 17 разделов спека реализованы?
   - Цель (1) → весь план.
   - Скоуп (2) → Фаза 0-12.
   - Архитектурные решения (3) → Фазы 1, 2, 8.
   - Структура (4) → Task 0.2.
   - AGENTS.md скелет (5) → Task 2.1.
   - Модули docs/ai/ (6) → Фаза 1.
   - Персона и стиль (7) → Task 1.1, 1.2.
   - Деплой (8) → Фаза 8.
   - Субагенты (9) → Фаза 4.
   - Скиллы (10) → Фазы 5-6.
   - skill-lint (11) → Фаза 7.
   - Examples / CI (12) → Фазы 9, 11.
   - Память (13) → упомянуто в AGENTS.md Секция 11.
   - Репо и публикация (14) → Фаза 12.
   - Открытые вопросы (15) → разрешаются на Фазе 12 (GitHub user), остальные — при первом использовании.
   - Ссылки (16) → Task 11.1.
   - План (17) → этот документ.
2. **Plaсeholders:** нет `TBD`, `FIXME`, «implement later».
3. **Type consistency:** `skill_path` используется во всех fixtures одинаково; `AI_SETTINGS_ROOT` одинаково экспортируется; пути симлинков согласованы между `install.sh` и setup-гайдами.
4. **Команды воспроизводимы:** каждая bash-команда self-contained (либо с cd, либо с абсолютным путём, либо sourcing common.sh).

---

## Handoff

План готов. Два варианта запуска:

1. **Subagent-Driven** (рекомендую): использовать `superpowers:subagent-driven-development` — на каждую Task я дispatch'у fresh subagent, делаю code-review между задачами, итерация быстрая, контекст основной сессии чистый.
2. **Inline Execution**: использовать `superpowers:executing-plans` — выполняю Tasks в текущей сессии батчами с чекпоинтами для ревью.

Какой вариант?
