# Gemini CLI — подключение `ai-settings`

## После `scripts/install.sh`

```bash
ls -la ~/.gemini/GEMINI.md
# -> ~/ai-settings/GEMINI.md
```

## Проверка

Запусти Gemini CLI и задай любой вопрос, требующий правил, например:

> «напиши коммит»

Если модель отвечает в стиле персоны Бориса на русском и предлагает conventional-commit сообщение — всё работает.

## @imports

Gemini CLI нативно поддерживает `@imports`, поэтому модули из `docs/ai/*.md` подтягиваются автоматически при загрузке `GEMINI.md` (через `CLAUDE.md`-стиле транзит: `GEMINI.md → @./AGENTS.md → @docs/ai/*.md`).

## Обновление

```bash
cd ~/ai-settings && git pull
```

Симлинк остаётся валидным. Перезапусти Gemini-сессию, чтобы подтянулись новые правила.
