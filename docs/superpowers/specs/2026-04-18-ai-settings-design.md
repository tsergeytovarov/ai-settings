# Дизайн: библиотека настроек `ai-settings`

**Дата:** 2026-04-18
**Автор:** Sergey Popov + Claude (Борис)
**Статус:** На ревью пользователя

---

## 1. Цель и контекст

Создать собственную библиотеку настроек для AI coding-ассистентов (Claude Code, Codex CLI, Cursor, Gemini CLI) — единое место, где живут правила поведения модели, стандарты кода, стилистика, персона агента, специализированные субагенты и переиспользуемые скиллы.

**Почему это нужно:**
- Настройки разбросаны по `~/.claude`, `~/.codex`, папкам проектов; нет источника правды.
- Каждый новый проект требует ручной настройки правил и привычек модели.
- Опыт и удачные находки нигде не фиксируются — приходится переизобретать.
- Разные ИИшки читают разные файлы (`CLAUDE.md` / `AGENTS.md` / `GEMINI.md` / `.cursor/rules/*.mdc`) — без централизации появляется дрейф.

**Критерии успеха:**
- Один репозиторий — источник правды для всех четырёх платформ.
- Глобальная установка за одну команду (`./install.sh`), далее новые проекты работают без доп. действий по умолчанию.
- Для проектов со спецификой — одна команда (`ai-settings init`) добавляет проектные настройки поверх глобальных.
- Скиллы и субагенты живут с версионированием, каждый можно обновлять независимо.
- При добавлении правила в одном месте (`AGENTS.md` или `docs/ai/*.md`) — изменения автоматически становятся доступны всем четырём платформам.

---

## 2. Скоуп

### 2.1 Что входит в первую итерацию

- Глобальный `AGENTS.md` (source of truth, ≤200 строк) + модули в `docs/ai/` через `@imports`.
- Тонкие обёртки `CLAUDE.md` и `GEMINI.md` — импортируют `AGENTS.md` + платформенная специфика.
- Cursor получает контент через генерируемый `.cursor/rules/*.mdc` (скрипт `sync-cursor.sh`).
- Кастомная персона «Борис» и стилистика общения.
- 6 специализированных субагентов (code-reviewer, debugger, fastapi-backend, next-frontend, ml-helper, pr-writer).
- Стартовый набор скиллов (3 в `code/`, 1 в `work/`).
- Skill-lint с pytest — автопроверка качества описаний скиллов.
- Механизм глобальной установки (симлинки в `~/.claude`, `~/.codex`, `~/.gemini` + копия `settings.json`).
- Проектный установщик `ai-settings init`.
- Папка `examples/` — курируемые ссылки, промпты, референсы.
- `CHANGELOG.md` (корневой, на русском) и `TODO.md` (корневой, live-roadmap).
- GitHub Actions CI: skill-lint, валидация markdown и импортов.
- Публичный GitHub-репозиторий `ai-settings`, лицензия MIT.

### 2.2 Что не входит (YAGNI)

- Автоматическая генерация CHANGELOG из git-коммитов.
- Публикация скиллов как npm-пакетов или OCI-артефактов.
- Веб-UI или TUI для управления настройками.
- Система миграций между версиями `ai-settings`.
- Поддержка платформ кроме Claude/Codex/Cursor/Gemini (добавим по запросу).
- Кастомный Cursor-парсер (полагаемся на свой простой `sync-cursor.sh`).

---

## 3. Архитектурные решения

### 3.1 Source of truth — `AGENTS.md` + `@imports`

Подход: гибрид — `AGENTS.md` как корневой файл, тяжёлые темы вынесены в `docs/ai/<module>.md` и подключены через синтаксис `@docs/ai/python.md`.

**Почему этот подход:**
- `AGENTS.md` стал де-факто стандартом ([agents.md](https://agents.md/)); его читают Claude, Codex, Cursor, Gemini.
- `@imports` нативно поддерживаются в Claude Code и Gemini CLI. Codex читает `AGENTS.md` как plain text — модель сама следует ссылкам. Cursor получает плоскую версию через `sync-cursor.sh`.
- Монолитный `AGENTS.md` >500 строк — антипаттерн: модели начинают терять детали. Модульная структура с файлами по 20–50 строк работает лучше.

**Альтернативы (отвергнуты):**
- Симлинки без `@imports` — не даёт AI-специфичной тонкой настройки.
- Билд-генератор на все платформы — лишняя движущаяся часть.
- Дублирование в каждой платформе — дрейф неизбежен.

### 3.2 Мультиплатформенность

| Платформа | Файл | Как подключается |
|-----------|------|-----------------|
| Claude Code | `CLAUDE.md` (корень репо) + симлинк в `~/.claude/` | Нативно читает `@imports` |
| Codex CLI | `AGENTS.md` (корень репо) + симлинк в `~/.codex/` | Читает `AGENTS.md` нативно, `@imports` как ссылки в тексте |
| Gemini CLI | `GEMINI.md` (корень репо) + симлинк в `~/.gemini/` | Нативно читает `@imports` |
| Cursor | Генерируется в `~/.cursor/rules/ai-settings.mdc` | `sync-cursor.sh` резолвит `@imports` в плоский файл с frontmatter |

### 3.3 Язык

- **AI-файлы** (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `docs/ai/*.md`, `skills/*/SKILL.md`, `agents/*/AGENT.md`) — **английский** (compliance моделей выше).
- **Человеко-читаемые артефакты** (`README.md`, `CHANGELOG.md`, `TODO.md`, `docs/setup/*.md`, `examples/*`, PR, issues, commits, комментарии в коде) — **русский**.

Это зафиксировано в памяти как правило пользователя и действует для всех будущих изменений.

### 3.4 Развёртывание — гибрид

- Глобальный слой: симлинки в `~/.claude`, `~/.codex`, `~/.gemini` + копия `settings.json`. Работает автоматически для любого нового проекта без дополнительных действий.
- Проектный слой: опциональный `ai-settings init` кладёт проектный `AGENTS.md` (с импортом глобального) + проектные `settings.json` и `.cursor/rules/`.

### 3.5 Версионирование

- Весь репозиторий — под git, публичный GitHub.
- Каждый скилл — semver в YAML frontmatter + `CHANGELOG.md` в папке скилла.
- Корневой `CHANGELOG.md` (Keep a Changelog, русский) фиксирует изменения в репозитории целиком.
- Помощник `scripts/bump-skill-version.sh` автоматизирует бамп + запись в CHANGELOG.

---

## 4. Структура репозитория

```
ai-settings/
├── README.md                          # РУ: что это, как поставить, как пользоваться
├── CHANGELOG.md                       # РУ: Keep a Changelog, запись на каждое изменение
├── TODO.md                            # РУ: live-roadmap
├── LICENSE                            # MIT
│
├── AGENTS.md                          # EN: source of truth, ≤200 строк
├── CLAUDE.md                          # EN: thin wrapper, @AGENTS.md + Claude-specific
├── GEMINI.md                          # EN: thin wrapper, @AGENTS.md + Gemini-specific
│
├── docs/
│   ├── ai/                            # @-imports для AGENTS.md (EN)
│   │   ├── persona.md                 # Boris: direct, argues, no flattery, humor, "I don't know"
│   │   ├── style.md                   # communication style (RU by default, concise, options)
│   │   ├── commands.md                # Commands section: pytest, npm test, uv run, gh...
│   │   ├── coding-standards.md        # YAGNI, tests required, no dead code, security
│   │   ├── python.md                  # Python 3.12+, FastAPI, pytest, uv, ruff
│   │   ├── typescript.md              # TS strict, Next.js 15, React 19, tanstack-query
│   │   ├── git-workflow.md            # Conventional commits, branches, PR in RU
│   │   ├── red-flags.md               # Stop table: if you think X — stop
│   │   ├── hard-gates.md              # HARD-GATE blocks
│   │   ├── three-tiers.md             # Always / Ask first / Never
│   │   └── ml.md                      # (stub) seed, versioning, no PII, determinism
│   ├── setup/                         # РУ: гайды по развёртыванию
│   │   ├── claude-code.md
│   │   ├── codex.md
│   │   ├── cursor.md
│   │   ├── gemini.md
│   │   └── new-project.md
│   └── superpowers/
│       └── specs/
│           └── 2026-04-18-ai-settings-design.md   # этот файл
│
├── agents/                            # 6 specialized subagents
│   ├── code-reviewer/AGENT.md
│   ├── debugger/AGENT.md
│   ├── fastapi-backend/AGENT.md
│   ├── next-frontend/AGENT.md
│   ├── ml-helper/AGENT.md
│   └── pr-writer/AGENT.md
│
├── skills/
│   ├── README.md                      # РУ: шаблон и правила написания скилла
│   ├── code/
│   │   ├── ru-commit-message/
│   │   │   ├── SKILL.md
│   │   │   ├── CHANGELOG.md
│   │   │   ├── README.md
│   │   │   ├── references/
│   │   │   └── tests/fixtures.md
│   │   ├── ru-pr-description/
│   │   └── changelog-entry/
│   └── work/
│       └── tg-post-writer/
│
├── settings/
│   ├── claude-settings.json           # эталон ~/.claude/settings.json
│   ├── codex-config.toml              # эталон ~/.codex/config.toml
│   └── hooks/
│       └── session-start-reminder.sh
│
├── scripts/
│   ├── install.sh                     # глобальная установка (симлинки + копии)
│   ├── init-project.sh                # ai-settings init для проекта
│   ├── sync-cursor.sh                 # AGENTS.md → .cursor/rules/*.mdc
│   ├── bump-skill-version.sh          # helper для версий скиллов
│   └── lib/                           # общие утилиты для скриптов
│
├── examples/
│   ├── links.md                       # РУ: курируемые ссылки
│   ├── prompts/
│   │   ├── README.md
│   │   ├── coding/
│   │   ├── writing/
│   │   ├── research/
│   │   └── meta/
│   └── references/
│       ├── public-agents-md/
│       ├── public-skills/
│       └── articles/
│
├── tests/
│   └── skill-lint/                    # pytest-прогон для валидации всех скиллов
│       ├── conftest.py
│       ├── test_skills.py
│       └── fixtures/
│
└── .github/
    └── workflows/
        └── ci.yml                     # skill-lint, markdown validation, imports check
```

---

## 5. Корневой `AGENTS.md` — скелет

Файл ≤200 строк, 13 секций. Тяжёлые темы вынесены в `docs/ai/<module>.md` через `@imports`. Ниже — структура секций (полное содержимое пишется при имплементации).

```markdown
# AGENTS.md
<!-- Global AI settings for Claude Code, Codex, Cursor, Gemini CLI -->
<!-- Source of truth: github.com/<user>/ai-settings -->

## 1. Persona & Values — @docs/ai/persona.md
## 2. Communication Style — @docs/ai/style.md
## 3. Commands — @docs/ai/commands.md
## 4. Tech Stack (JS/TS, Python 3.12+, Next.js 15, React 19, FastAPI 0.100+, GitHub, Yandex Cloud)
## 5. Coding Standards — @docs/ai/coding-standards.md
     Python: @docs/ai/python.md
     TypeScript/JavaScript: @docs/ai/typescript.md
## 6. Git Workflow — @docs/ai/git-workflow.md
## 7. Docs Discipline (CHANGELOG required, TODO maintained, ADRs, READMEs)
## 8. Red Flags — @docs/ai/red-flags.md
## 9. Three-Tier Boundaries — @docs/ai/three-tiers.md
## 10. Hard Gates — @docs/ai/hard-gates.md
## 11. Skill & Agent Invocation Discipline
## 12. Uncertainty & Hallucination (ask > guess, "I don't know" preferred, 2-3 options)
## 13. ML-Specific — @docs/ai/ml.md
```

---

## 6. Модули `docs/ai/`

| Файл | Что внутри | Размер |
|------|-----------|------|
| `persona.md` | Борис: роль (senior engineer), ценности, характер (прямой, аргументирует, без лести, шутит, признаёт «не знаю») | 15–25 строк |
| `style.md` | RU по умолчанию, короткие ответы 3–7 предложений, 2–3 варианта для нетривиальных решений, развёрнутое резюме, один вопрос за раз, переспросить > догадаться | 20–30 строк |
| `commands.md` | Executable commands с флагами: `pytest`, `uv run`, `npm test`, `gh`, `yc` и т.д. Читается ПЕРВОЙ. | 30–50 строк |
| `coding-standards.md` | YAGNI, tests required, no dead code, security (secrets, OWASP), explicit > clever | 30–40 строк |
| `python.md` | Python 3.12+, `uv`, type hints, pytest, FastAPI DI/pydantic, ruff/black | 30–40 строк |
| `typescript.md` | TS strict, no unjustified `any`, Next.js 15 RSC-first, React 19, tanstack-query, eslint/prettier | 30–40 строк |
| `git-workflow.md` | Conventional commits, branch naming, PR/issues на русском, prefer small PRs, lint/format/test перед коммитом, squash-merge | 25–35 строк |
| `red-flags.md` | Таблица «если думаешь X — стоп»: catch-all Exception, hardcoded secrets/URLs, diff >500 строк, mock-всё-подряд, full dataset in memory, `any` в TS без причины | 20–30 строк (таблица) |
| `hard-gates.md` | `<HARD-GATE>` блоки: не закрывать без зелёных тестов, не коммитить без чтения diff, не выдумывать API, запрет `--no-verify`/`--dangerously-skip-permissions`/`--force` | 15–20 строк |
| `three-tiers.md` | Always / Ask first / Never — таблица по категориям (filesystem, git, network, deps, runtime) | 30–40 строк |
| `ml.md` | (Заглушка на будущее) seed, data/model versioning, no PII in logs, determinism | 20 строк |

---

## 7. Персона «Борис» и стилистика общения

### 7.1 Персона (фиксируется в `docs/ai/persona.md`)

- **Имя:** Борис.
- **Роль:** senior engineer, многоязычный, спокойно работает с JS/TS/Python/Node.
- **Ценности:** correctness > speed, explicitness > cleverness, small changes > big ones, think before write.
- **Прямота:** прямой до грубоватости — «это плохая идея, потому что X», без смягчений.
- **Спор:** если не согласен — спорит и аргументирует, даже если пользователь настаивает. Сдаётся только после услышанной контраргументации.
- **Лесть и извинения:** запрет на «отличный вопрос», «супер идея» и беспричинные извинения. Похвала — только за конкретное и заслуженное.
- **Юмор:** можно шутить свободно, если к месту. Самоирония приветствуется.
- **Признание незнания:** «не знаю» — нормальный ответ, без маскировки под знание.

### 7.2 Стилистика общения (фиксируется в `docs/ai/style.md`)

- **Язык:** всегда русский (правило пользователя).
- **Длина:** короткие ответы 3–7 предложений по умолчанию; разворачиваться только по запросу или когда задача требует.
- **Структура:** смешанно по ситуации — короткие ответы прозой, длинные со структурой (заголовки, списки, таблицы).
- **Тон:** неформальный, «ты».
- **Эмодзи:** разрешены в общении, запрещены в коде и документации.
- **Варианты:** для нетривиальных решений — всегда 2–3 варианта с трейд-оффами и рекомендацией.
- **Резюме:** развёрнутое резюме с чек-листом в конце нетривиальных задач (не после каждого чат-сообщения).
- **Вопросы:** один вопрос за раз, не батчами (это правило брейнштом-скилла, сохраняем).
- **Неопределённость:** лучше переспросить, если неопределённость влияет на результат, чем угадать.

---

## 8. Развёртывание

### 8.1 Глобальная установка (`scripts/install.sh`)

Одноразовый запуск после клонирования репо. Что делает:

| Цель | Действие |
|------|----------|
| `~/.claude/CLAUDE.md` | симлинк на `~/ai-settings/CLAUDE.md` |
| `~/.claude/settings.json` | **копия** (не симлинк) из `settings/claude-settings.json` |
| `~/.claude/agents/` | симлинк на `~/ai-settings/agents/` |
| `~/.claude/skills/` | симлинк на `~/ai-settings/skills/` |
| `~/.claude/hooks/` | симлинк на `~/ai-settings/settings/hooks/` |
| `~/.codex/AGENTS.md` | симлинк на `~/ai-settings/AGENTS.md` |
| `~/.codex/config.toml` | merge с существующим (не overwrite) |
| `~/.gemini/GEMINI.md` | симлинк на `~/ai-settings/GEMINI.md` |
| `~/.cursor/rules/ai-settings.mdc` | генерируется через `sync-cursor.sh` |

**Свойства:**
- Идемпотентность: повторные запуски дают тот же результат.
- Backup: перед каждой перезаписью существующие файлы копируются в `~/ai-settings/backups/<timestamp>/`.
- Dry-run: флаг `--dry-run` показывает, что будет сделано, без изменений.

### 8.2 Проектная установка (`scripts/init-project.sh` → `ai-settings init`)

Для проектов, требующих специфики. Важно понимать: **глобальный слой уже применяется автоматически** для любого нового проекта (через `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, `~/.gemini/GEMINI.md` — они загружаются каждой ИИшкой для всех сессий). Проектный `AGENTS.md` — **additive-слой поверх** глобального, а не замена.

Что делает `init-project.sh`:
- Создаёт проектный `AGENTS.md` в корне проекта — содержит только проектные правила (tech-stack, локальные конвенции, правила команды). Глобальный слой НЕ импортируется явно — он уже применяется платформой автоматически.
- Кладёт `.claude/settings.json` с project-специфичными permissions (например, разрешить `docker-compose up` в этом проекте).
- Кладёт `CHANGELOG.md` и `TODO.md` по шаблонам, если отсутствуют.
- Генерирует `.cursor/rules/ai-settings.mdc` через `sync-cursor.sh` (Cursor не имеет user-global уровня, поэтому копируем глобальные правила в каждый проект).
- Обновляет `.gitignore` для AI-артефактов (`.claude/sessions/`, `.claude/cache/`).

**Нюанс Cursor:** в отличие от Claude/Codex/Gemini, у Cursor нет стабильного user-global механизма (в зависимости от версии). Поэтому в проектах, где нужны правила в Cursor, `init-project.sh` записывает плоскую копию `AGENTS.md` в `./.cursor/rules/ai-settings.mdc`. Это единственная асимметрия.

### 8.3 Обновление

```bash
cd ~/ai-settings && git pull && ./scripts/install.sh
```

Симлинки не трогаются — новое содержимое подхватывается автоматически. Копии (`settings.json`) обновляются только после явного подтверждения пользователем (diff + yes/no).

### 8.4 Cursor-синк (`scripts/sync-cursor.sh`)

Простой скрипт (~20 строк bash или python):
1. Читает `AGENTS.md`.
2. Рекурсивно резолвит `@imports`, склеивает в один плоский файл.
3. Добавляет Cursor-овский YAML frontmatter (`alwaysApply: true`).
4. Пишет в `~/.cursor/rules/ai-settings.mdc` (глобально) или `./.cursor/rules/ai-settings.mdc` (проект).

Запускается: в `install.sh`, в `init-project.sh`, и git pre-commit хуком репозитория `ai-settings`, если менялись `AGENTS.md` или `docs/ai/*.md`.

### 8.5 Permissions — `settings/claude-settings.json`

Умеренно-либеральный профиль («вариант A» из брейншторма):

```jsonc
{
  "permissions": {
    "allow": [
      "Read(**)", "Grep(**)", "Glob(**)",
      "Bash(git status)", "Bash(git log:*)", "Bash(git diff:*)",
      "Bash(ls:*)", "Bash(pwd)", "Bash(cat:*)",
      "Bash(gh pr view:*)", "Bash(gh issue view:*)",
      "Bash(pytest:*)", "Bash(npm test:*)", "Bash(uv run:*)",
      "Bash(node --version)", "Bash(python --version)"
    ],
    "ask": [
      "Bash(git commit:*)", "Bash(git push:*)",
      "Bash(npm install:*)", "Bash(pip install:*)", "Bash(uv pip install:*)",
      "Write(**)", "Edit(**)"
    ],
    "deny": [
      "Bash(git push --force*)", "Bash(git reset --hard*)",
      "Bash(rm -rf*)",
      "Bash(*--dangerously-skip-permissions*)",
      "Bash(*--no-verify*)"
    ]
  }
}
```

`deny` срабатывает раньше `ask`/`allow` — даже явное разрешение не снимет deny.

---

## 9. Специализированные субагенты

Шесть агентов в `agents/<name>/AGENT.md`, каждый с YAML-frontmatter.

| Агент | Триггер (когда вызывается) | Что делает | Модель |
|-------|--------------------------|-----------|--------|
| `code-reviewer` | «review / проверь код», после крупного шага реализации, перед коммитом | Корректность, покрытие тестами, dead code, secrets, OWASP, соответствие `coding-standards.md`. Output: punch-list с severity. | Opus |
| `debugger` | «не работает / падает / flaky / непонятный баг» | `systematic-debugging` методика: воспроизвести → изолировать → гипотеза → проверить → исправить. | Sonnet |
| `fastapi-backend` | файл импортирует `fastapi`/`sqlalchemy`/`pydantic`; задача про Python API | FastAPI DI, pydantic v2, async-правильно, alembic, pytest фикстуры, uv. | Sonnet |
| `next-frontend` | файл `.tsx`/`.jsx`; упоминание Next/React | Next.js 15 (app router, RSC-first), React 19, TS strict, tanstack-query. Отказ от устаревших API (pages router, class components). | Sonnet |
| `ml-helper` | задача про pandas/numpy/torch/sklearn/датасеты | Детерминизм (seed), версионирование, нет PII в логах, hold-out оценка, uv-окружения. | Sonnet |
| `pr-writer` | «напиши PR / опиши коммит / сгенерь changelog» | По diff'у: conventional commit message на русском; PR title + description (TL;DR + изменения + тестирование + чек-лист); запись в CHANGELOG. | Haiku |

**Шаблон `AGENT.md`:**

```markdown
---
name: code-reviewer
description: |
  Trigger: use after completing a major implementation step, or when user asks
  "review this / check the code / look at the diff", or before any commit.
  SKIP: trivial doc changes, cosmetic refactors, conversations about design.
model: opus
tools: [Read, Grep, Glob, Bash]
---

# Role
Senior engineer performing a rigorous code review...

# Process
1. Read the full diff.
2. Check: correctness, test coverage, dead code, secrets, OWASP risks, style compliance.
3. Return: punch-list with file:line references, organized by severity.

# Output format
- Critical: [...]
- Should-fix: [...]
- Consider: [...]
- Positive: [...]
```

**Замечания:**
- Все агенты — **на английском** (compliance); **output** — на **русском** (правило пользователя).
- Codex не имеет нативной системы субагентов — дополнительно опишем их в `AGENTS.md` как ролевые промпты для эмуляции.

---

## 10. Скиллы — структура и версионирование

### 10.1 Шаблон папки скилла

```
skills/code/ru-commit-message/
├── SKILL.md           # основной файл, YAML frontmatter + инструкции (EN)
├── CHANGELOG.md       # история изменений этого скилла (RU)
├── README.md          # РУ: что это, примеры вызова
├── references/        # доп. материалы, шаблоны, примеры
│   └── conventional-commits.md
└── tests/             # fixtures для skill-lint
    └── fixtures.md
```

### 10.2 Шаблон `SKILL.md`

```markdown
---
name: ru-commit-message
version: 1.0.0
description: |
  Use when user asks "напиши коммит / сгенерь commit message / опиши этот diff as commit".
  Also trigger automatically before `git commit` if no message provided.
  SKIP: if user already wrote a commit message, or for merge commits.
category: code
tags: [git, conventional-commits, russian]
---

# Purpose
Generate a conventional-commit message in Russian from the current staged diff.

# Process
1. Run `git diff --staged`.
2. Classify: feat / fix / chore / refactor / docs / test / style / perf.
3. Pick scope (optional) from changed file paths.
4. Write description in Russian, imperative mood, under 72 chars.
5. If non-trivial: body explaining WHY, in Russian.
6. Output the message ready to paste into `git commit -m`.
```

### 10.3 Версионирование

- `version` в frontmatter (semver).
- `CHANGELOG.md` в папке скилла (Keep a Changelog, русский).
- Ручной бамп + helper `scripts/bump-skill-version.sh <skill> <major|minor|patch>` — добавляет запись в CHANGELOG, апдейтит frontmatter, делает коммит с conventional message.

### 10.4 Стартовый набор

**`skills/code/`:**
- `ru-commit-message` — conventional commit на русском из diff'а.
- `ru-pr-description` — PR-описание на русском (TL;DR + изменения + тестирование + чек-лист).
- `changelog-entry` — добавляет запись в корневой `CHANGELOG.md` проекта по diff'у.

**`skills/work/`:**
- `tg-post-writer` — существующий Telegram-скилл пользователя, перенесённый и адаптированный под стиль персоны.

### 10.5 `skills/README.md` — правила написания

Обязательные поля frontmatter: `name`, `version`, `description`, `category`, `tags`.
- `description` — минимум 100 символов, обязательно содержит `TRIGGER`/`Use when` и `SKIP`/`Do NOT use`.
- Инструкции скилла — на английском.
- Примеры вывода (`references/examples.md`) — на русском.
- Тесты (`tests/fixtures.md`) — входные данные и ожидаемый вывод.

---

## 11. Skill-lint

`tests/skill-lint/` — pytest-прогон, валидирует каждый скилл в `skills/`.

**Проверки:**

| Проверка | Правило |
|---------|---------|
| `test_frontmatter_exists` | YAML frontmatter есть и парсится |
| `test_required_fields` | `name`, `version`, `description`, `category` заполнены |
| `test_description_has_trigger` | содержит «Use when» или «Trigger» |
| `test_description_has_skip` | содержит «SKIP» или «Do NOT use» |
| `test_description_length` | минимум 100 символов |
| `test_version_semver` | соответствует `X.Y.Z` |
| `test_changelog_exists` | `CHANGELOG.md` присутствует и содержит запись под текущую версию |
| `test_name_matches_folder` | `name:` совпадает с именем папки |
| `test_no_obvious_secrets` | нет строк, похожих на API-ключи/токены (regex heuristic) |

Запускается: локально `pytest tests/skill-lint/`, и в GitHub Actions CI на каждом PR. CI падает, если хотя бы одна проверка не прошла.

---

## 12. Examples, hooks, CI

### 12.1 `examples/`

```
examples/
├── links.md                       # РУ: курируемые ссылки с комментариями (neuform.ai, ghuntley, Anthropic blog, ...)
├── prompts/
│   ├── README.md
│   ├── coding/                    # промпты для задач в коде
│   ├── writing/                   # промпты для текстов, постов
│   ├── research/                  # промпты для исследований
│   └── meta/                      # промпты про работу с ИИшками
└── references/
    ├── public-agents-md/          # дампы хороших публичных AGENTS.md
    ├── public-skills/             # референсы на публичные скиллы
    └── articles/                  # выжимки из статей (с цитированием)
```

### 12.2 Хуки

**Claude Code SessionStart hook (`settings/hooks/session-start-reminder.sh`):**
- Считает доступные скиллы в `~/.claude/skills/`.
- Выводит reminder: «доступно X скиллов, Y субагентов — проверь матч перед задачей».
- Отключаем через `AI_SETTINGS_QUIET=1`.

**Git pre-commit hook репозитория `ai-settings`:**
- Запускает `skill-lint`, если менялось что-то в `skills/`.
- Запускает `sync-cursor.sh`, если менялось `AGENTS.md` или `docs/ai/*.md`.
- Предупреждает (не блокирует), если есть изменения без соответствующей записи в `CHANGELOG.md`.

### 12.3 GitHub Actions CI (`.github/workflows/ci.yml`)

Прогон на каждом PR и push в `main`:
- `skill-lint` (pytest).
- Проверка валидности `AGENTS.md` — парсинг markdown, резолв `@imports` (все файлы существуют).
- `sync-cursor.sh --check` — проверяет, что скрипт отрабатывает без ошибок.
- `markdownlint` на всех `.md` (warning only, не блокирует).

### 12.4 CHANGELOG.md (корневой)

Формат Keep a Changelog, русский язык:

```markdown
# CHANGELOG

## [Unreleased]
### Добавлено
- Скилл `changelog-entry`.

### Изменено
- Персона: ужесточил запрет на лесть.

## [0.1.0] — 2026-04-20
### Первый релиз
- AGENTS.md с 13 секциями и @imports.
- 6 субагентов, 4 скилла, skill-lint.
```

Запись **на каждое изменение** (правило пользователя). Генерация — через скилл `changelog-entry`.

### 12.5 TODO.md (корневой)

```markdown
# TODO

## В работе
- [ ] Начальная имплементация согласно spec `docs/superpowers/specs/2026-04-18-ai-settings-design.md`.

## Следующее
- [ ] Расширенные правила skill-lint.
- [ ] Cursor: валидация работы симлинков.

## Идеи / бэклог
- [ ] Интеграция с yandex-cloud SDK.
- [ ] ML-helper: раздел про versioning датасетов.
- [ ] Автогенерация CHANGELOG из commits.
```

---

## 13. Память Claude Code

Система памяти (`~/.claude/projects/<hash>/memory/`) живёт **вне** `ai-settings` — она проектно-специфичная и содержит личные предпочтения пользователя. В `AGENTS.md` будет короткое напоминание о системе памяти (её поведение зашито в системный промпт Claude Code, дублировать не надо).

Уже зафиксированные в памяти правила для проекта `ai-settings`:
- `feedback_language_rules.md` — все человеко-читаемые артефакты на русском.
- `user_tech_stack.md` — JS/TS, Python, Next.js, React, FastAPI, GitHub, Yandex Cloud.

---

## 14. Репозиторий и публикация

- **Имя:** `ai-settings`.
- **Видимость:** публичный GitHub.
- **Лицензия:** MIT.
- **Конвенции веток:** `main` — стабильная, фичи через PR в `main`.
- **Коммиты:** conventional commits, заголовок на русском (тело допустимо мультиязычное).

---

## 15. Открытые вопросы на момент написания

1. Имя GitHub-аккаунта для создания репо — уточнится на шаге имплементации.
2. Финальный тест-раннер для JS/TS — Jest или Vitest. Решится при добавлении первого JS-проекта.
3. `tg-post-writer` — пересобрать с нуля или форкнуть существующий anthropic-skills:telegram-post-writer? Решится при переносе скилла.

---

## 16. Ссылки на ресёрч и источники

**Стандарты и документация:**
- [agents.md — официальный формат](https://agents.md/)
- [Claude Code docs — CLAUDE.md и @imports](https://code.claude.com/docs/en/overview)
- [Cursor Rules документация](https://cursor.com/docs/rules)
- [Gemini CLI — GEMINI.md](https://geminicli.com/docs/cli/gemini-md/)
- [Codex — AGENTS.md](https://developers.openai.com/codex/guides/agents-md)

**Лучшие практики:**
- [GitHub Blog — анализ 2500+ AGENTS.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)
- [Geoffrey Huntley — Specs методология](https://ghuntley.com/specs/)
- [Simon Willison — Agentic anti-patterns](https://simonwillison.net/guides/agentic-engineering-patterns/anti-patterns/)
- [Trail of Bits Claude Code config](https://github.com/trailofbits/claude-code-config)

**Коллекции и тулзы:**
- [VoltAgent — 100+ subagent templates](https://github.com/VoltAgent/awesome-claude-code-subagents)
- [awesome-claude-code (community)](https://github.com/hesreallyhim/awesome-claude-code)
- [rulesync — npm bulk generation](https://dev.to/dyoshikawatech/rulesync-published-a-tool-to-unify-management-of-rules-for-claude-code-gemini-cli-and-cursor-390f)
- [rule-porter — bidirectional конвертор](https://forum.cursor.com/t/rule-porter-convert-your-mdc-rules-to-claude-md-agents-md-or-copilot/153197)

**Пользователь добавил:**
- https://neuform.ai/community/featured

---

## 17. План следующих шагов

После утверждения этого документа:
1. Передаём в skill `superpowers:write-plan` — получаем пошаговый план имплементации с проверяемыми этапами.
2. Имплементация идёт в порядке: скелет репо → AGENTS.md + docs/ai → install.sh → скиллы → субагенты → skill-lint → CI → examples/README.
3. Публикация на GitHub — после того, как локальная имплементация прошла скелет «всё работает end-to-end на одной машине».
