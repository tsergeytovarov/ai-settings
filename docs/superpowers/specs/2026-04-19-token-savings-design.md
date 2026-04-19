# Дизайн: экономия токенов и тёрсный стиль

**Дата:** 2026-04-19
**Статус:** одобрен

## Контекст

Задача — сократить расход токенов на чат-ответы всех AI-моделей (Claude, Gemini) и на системный промпт, не затрагивая качество генерируемого контента (TG-посты, статьи, документы, презентации).

Источник вдохновения: [caveman](https://github.com/JuliusBrussee/caveman) — caveman-style compression, ~65-75% экономии токенов при сохранении технической точности.

---

## Что меняем

### 1. `docs/ai/style.md` — раздел Compression

Добавить в конец файла новый раздел. Правило always-on для всех моделей (Claude + Gemini — оба импортируют AGENTS.md → style.md).

**Содержание раздела:**

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

**Что НЕ меняем в style.md:** всё остальное остаётся. Раздел Length («3–7 предложений») и Compression работают вместе.

---

### 2. `~/.claude/settings.json` — авто-компакт

Добавить настройку авто-сжатия истории при заполнении контекста. Работает только для Claude Code.

**Точное имя ключа:** верифицировать перед реализацией через документацию Claude Code (`/help` или `--help` в CLI). Предположительно `autoCompact` или аналог.

**Место:** в глобальный `~/.claude/settings.json` (уже существует, содержит только `enabledPlugins` и `extraKnownMarketplaces`).

---

### 3. `AGENTS.md` — вынести `ml.md` из постоянной цепочки

Убрать строку `@./docs/ai/ml.md` из AGENTS.md.

**Обоснование:** `ml.md` (~1.7KB) грузится в каждой сессии независимо от типа проекта. ML-правила нужны только в ML-проектах. Файл остаётся в `docs/ai/`, ссылаться вручную когда нужно.

**Что делать вместо:** добавить в AGENTS.md комментарий где искать `ml.md` и при каких условиях его стоит читать.

---

### 4. `docs/ai/writing-voice.md` — сократить дублирование

Файл занимает 6.8KB. Большая часть его содержимого дублирует `skills/popovs/tg-post-writer/references/style-guide.md`, которая грузится непосредственно в TG-скилле.

**Оставить в writing-voice.md:**
- Scope (что под этим голосом, что нет) — уникальный контент
- Core voice (1–2 предложения, без детализации)
- Fact vs opinion — один абзац
- Stop-lists (опенеры и лексика) — применяются к CHANGELOG, коммитам, статьям
- Quotation marks — ключевое правило, применяется везде
- Numbers и AI terminology — применяется везде
- Emoji — короткий раздел
- Commit and PR tone — специфика не покрытая tg-guide
- Reference на tg-post-writer style-guide

**Убрать из writing-voice.md (всё это есть в tg-guide):**
- Author presence — детальный список маркеров (оставить одну фразу)
- Position — дублирует core voice
- Hyperbole as tool — детально описано в tg-guide, оставить одну строку
- Rhythm and syntax — полностью в tg-guide (секция 4)
- Endings — полностью в tg-guide (секция 8)

**Целевой размер:** ~3KB (с 6.8KB).

---

### 5. Интеграция rtk (Rust Token Killer)

rtk — CLI-прокси, сжимает вывод bash-команд перед попаданием в контекст (input токены). Экономия 60-90% на `git`, `npm test`, `pytest`, `grep` и др. Работает только для Bash tool calls; Read/Grep/Glob не затрагивает.

**Механизм:** `PreToolUse` hook перехватывает команды, прозрачно переписывает (`git status` → `rtk git status`). Hook молча выходит с exit 0 если rtk не установлен — безопасно pre-wire до установки бинарника.

**`scripts/install.sh`** — добавить секцию rtk:
- macOS + brew → `brew install rtk` автоматически
- macOS без brew / Linux → `curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh` автоматически
- Windows → напечатать инструкцию, не падать (бинарник с releases + PATH)

**`rtk init -g` не нужен** — мы pre-wire всё сами:

- `settings/hooks/rtk-rewrite.sh` — скопировать из `hooks/claude/rtk-rewrite.sh` rtk репо. Уже будет в `~/.claude/hooks/` через существующий симлинк.
- `settings/claude-settings.json` — добавить `PreToolUse` hook: `{ "type": "command", "command": "~/.claude/hooks/rtk-rewrite.sh" }`.
- `docs/ai/rtk-awareness.md` — создать (~10 строк): мета-команды rtk (`rtk gain`, `rtk discover`, `rtk proxy`), warning про name collision с Rust Type Kit. Добавить `@./docs/ai/rtk-awareness.md` в AGENTS.md — подхватят Claude и Gemini.
- `settings/hooks/session-start-reminder.sh` — добавить проверку: если `~/.claude/hooks/rtk-rewrite.sh` существует, но `rtk` не в PATH → предупреждение с командой установки.

**`docs/setup/claude-code.md`** — добавить секцию RTK: что pre-wired автоматически, что нужно вручную (только бинарник), как проверить (`rtk --version`, `rtk gain`).

---

### 6. Windows: покрытие во всех setup-доках

Текущее состояние: нигде нет упоминания Windows. Все скрипты bash-only.

**Стратегия:** WSL — основной рекомендуемый путь для Windows. Нативный bash через Git Bash/MSYS2 — fallback с ограничениями.

**`scripts/install.sh`** — добавить Windows-детекцию в начало: если `OSTYPE` указывает на Windows без WSL → выводить понятное сообщение с ссылкой на ручные шаги, завершать с exit 1.

**`docs/setup/claude-code.md`** — добавить секцию Windows:
- Рекомендация: WSL → запустить `./scripts/install.sh` как обычно
- Без WSL: ручные шаги (создать симлинки через `mklink`, скопировать `claude-settings.json`)
- rtk на Windows: скачать бинарник из releases, добавить в PATH

**`docs/setup/gemini.md`** — добавить: путь на Windows `%USERPROFILE%\.gemini\GEMINI.md`; без WSL — скопировать GEMINI.md вручную.

**`docs/setup/cursor.md`** — добавить: `sync-cursor.sh` требует WSL или Git Bash; без него — скопировать `.cursor/rules/ai-settings.mdc` вручную.

**`docs/setup/codex.md`** — добавить: `install.sh` требует WSL; без него — скопировать `~/.codex/AGENTS.md` вручную (или `%USERPROFILE%\.codex\AGENTS.md`).

**`docs/setup/customization.md`** — добавить примечание в начало: все bash-команды требуют macOS/Linux или WSL на Windows.

---

## Что НЕ меняем

- `docs/ai/style.md` — всё кроме нового раздела Compression
- `docs/ai/writing-voice.md` — Scope и Commit/PR section неприкосновенны
- tg-post-writer skill — не трогаем
- Все остальные docs/ai/* файлы
- `.claudeignore` — не нужен, `.gitignore` уже покрывает `node_modules/`, `dist/`, `.pytest_cache/`; `.git` игнорируется Claude Code по умолчанию

---

## Порядок реализации

1. Добавить раздел Compression в `style.md`
2. Верифицировать имя ключа авто-компакта → обновить `~/.claude/settings.json`
3. Убрать `ml.md` из `AGENTS.md`, добавить комментарий
4. Сократить `writing-voice.md`
5. Интеграция rtk:
   a. Скопировать `rtk-rewrite.sh` в `settings/hooks/`
   b. Добавить `PreToolUse` hook в `settings/claude-settings.json`
   c. Создать `docs/ai/rtk-awareness.md`, добавить импорт в `AGENTS.md`
   d. Добавить rtk-проверку в `session-start-reminder.sh`
   e. Добавить rtk-установку в `scripts/install.sh`
   f. Обновить `docs/setup/claude-code.md` — секция RTK
6. Windows-покрытие:
   a. `scripts/install.sh` — Windows-детекция
   b. `docs/setup/claude-code.md` — секция Windows
   c. `docs/setup/gemini.md` — Windows-пути
   d. `docs/setup/cursor.md` — Windows-примечание
   e. `docs/setup/codex.md` — Windows-примечание
   f. `docs/setup/customization.md` — Windows-примечание в начало
7. Обновить CHANGELOG и TODO
