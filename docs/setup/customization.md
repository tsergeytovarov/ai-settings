# Кастомизация под себя

Репо — это мой личный пресет. Когда его клонируешь, ты получаешь мою персону (Бориса), мой стиль общения (русский, «ты», без лести), мой стек (Python/TypeScript/Next.js/FastAPI/Yandex Cloud) и мои личные скиллы (русские коммиты, посты в TG). Почти всё это надо поправить под себя.

Ниже — чеклист того, что трогать. По приоритету: сначала обязательное, потом опциональное, потом что **не** трогать.

## Обязательно (иначе получишь не себя, а меня)

### 1. `docs/ai/persona.md`

Моя персона «Борис»: прямой, без лести, «ты», признаёт незнание. Перепиши под себя:
- Имя и краткое описание (senior backend, data scientist, product — что угодно).
- Ценности (у меня correctness > speed, explicitness > cleverness).
- Тон общения (у меня грубовато-прямой; кому-то ближе мягкий или академический).
- Как обращается с незнанием.

Минимум — замени имя и пару абзацев. Максимум — полностью свой текст.

### 2. `docs/ai/style.md`

Язык, длина ответов, структура, эмодзи, «ты/вы».
- У меня: русский по умолчанию, «ты», 3–7 предложений, эмодзи только в чате (не в коде).
- Если пишешь на английском или в формальном регистре — правь полностью.

### 3. `AGENTS.md`, секция 4 — Tech Stack

Там у меня:
```
- JavaScript / TypeScript, Node.js 20+
- Python 3.12+ (prefer `uv` over `pip`)
- Frameworks: Next.js 15 (app router, RSC-first), React 19, FastAPI 0.100+
- Data: SQLAlchemy 2.0+, Pydantic v2, Alembic
- Testing: pytest (Python); Jest or Vitest (JS/TS — confirm per-project)
- CI/CD: GitHub Actions
- Cloud: Yandex Cloud (`yc` CLI, not AWS/GCP)
```

Замени на свой стек с версиями. Это читается моделью как **факт**, а не как рекомендация, — поэтому чужой стек собьёт её с толку.

### 4. `docs/ai/commands.md`

Канонические команды для твоих инструментов. У меня pytest, uv, npm, git, gh, yc. Если используешь poetry/pnpm/yarn/aws — замени.

## Опционально (если стек / задачи отличаются)

### 5. `docs/ai/python.md`, `docs/ai/typescript.md`, `docs/ai/ml.md`

Языковые стандарты. Если не пишешь на Python — удали `python.md` и уберут его `@import` из `AGENTS.md` секции 5. Аналогично для TypeScript и ML. Лучше меньше, чем левое.

### 6. `docs/ai/git-workflow.md`

Мой формат: Conventional Commits, **description на русском**, PR title+description на русском.
- Если команда коммитит на английском — поменяй примеры и явно скажи «description — English, imperative».
- Если не Conventional Commits — опиши свой формат.

### 7. `skills/code/ru-commit-message`, `ru-pr-description`, `changelog-entry`

Все три — русскоязычные.
- Если коммитишь на английском: удали `ru-commit-message` и `ru-pr-description`, или скопируй и переделай в `en-commit-message`.
- `changelog-entry` — тоже пишет по-русски в формате Keep a Changelog. Адаптируй язык.

### 8. `skills/work/tg-post-writer`

Личный скилл для постов в мой Telegram-канал в стиле Бориса. Если не ведёшь TG-канал — удаляй папку целиком. Если ведёшь, но на своём стиле — перепиши `SKILL.md` под свой тон и удали примеры.

### 9. `agents/`

6 субагентов: `code-reviewer`, `debugger`, `fastapi-backend`, `next-frontend`, `ml-helper`, `pr-writer`.
- `fastapi-backend`, `next-frontend`, `ml-helper` — узко-стековые. Если не работаешь с FastAPI / Next.js / ML — удали соответствующие папки, чтобы они не всплывали ложными триггерами.
- `code-reviewer`, `debugger`, `pr-writer` — общие, оставляй.

### 10. `docs/ai/red-flags.md`, `three-tiers.md`, `hard-gates.md`

Это общие safety-правила. Читаются как законы (hard-gates — буквально). Перед использованием пробеги глазами — согласен ли ты с каждым. У меня там вещи вроде «не делай `git push --force` без подтверждения», «не коммить `.env`» — обычно универсальное, но твои права.

## Не трогай (сломаешь — будет больно)

- **`CLAUDE.md`, `GEMINI.md`** — тонкие обёртки с единственной строкой `@./AGENTS.md`. Нужны для того, чтобы Claude Code и Gemini CLI подхватывали правила через свои конвенции именования.
- **Симлинки в `~/.claude/`, `~/.codex/`, `~/.gemini/`, `~/.cursor/rules/`** — создаются `install.sh`. Руками не трогай, управляй через скрипт.
- **`.cursor/rules/ai-settings.mdc`** (проектный) и **`~/.codex/AGENTS.md`** — **генерируемые** файлы (плоская версия AGENTS.md с развёрнутыми `@imports`). Правь исходный `AGENTS.md` / `docs/ai/*.md`, потом прогоняй `./scripts/install.sh` или `scripts/sync-cursor.sh --codex` / `--global`.
- **`scripts/`** — работают как есть. Менять только если понимаешь, что делаешь.
- **`tests/`** — skill-lint. Если меняешь формат `SKILL.md` — обновляй проверки вместе, не удаляй тесты.

## После правок

1. **Прогони тесты**, чтобы убедиться, что не сломал формат скиллов:
   ```bash
   source .venv/bin/activate && pytest tests/ -v
   ```
2. **Перегенерируй плоские файлы** для Codex и Cursor:
   ```bash
   ./scripts/install.sh
   ```
3. **Перезапусти** Claude Code / Codex / Gemini / Cursor — сессии кэшируют AGENTS.md на старте, новые правила подхватятся при новом запуске.
4. **Smoke-test**: задай вопрос «напиши коммит» или «привет, расскажи о себе». Если ассистент в своей (а не в моей) персоне — значит правки применились.

## Рекомендация по порядку

Не пытайся переписать всё за один заход. Работающий минимум:
1. `persona.md` + `style.md` под себя — 80% эффекта.
2. Удали `skills/work/tg-post-writer/` и `skills/code/ru-*`, если не твой язык.
3. Живи неделю, смотри где ассистент ломается или звучит чужо — правь точечно.

Всё остальное — опциональная тонкая настройка.
