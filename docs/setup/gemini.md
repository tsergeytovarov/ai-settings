# Gemini CLI — подключение `ai-settings`

## После `scripts/install.sh`

```bash
ls -la ~/.gemini/GEMINI.md ~/.gemini/AGENTS.md ~/.gemini/skills
# -> ai-settings/GEMINI.md, ai-settings/AGENTS.md и ai-settings/skills/superpowers
```

## Проверка

Запусти Gemini CLI и задай любой вопрос, требующий правил, например:

> «напиши коммит»

Если модель отвечает в стиле персоны Бориса на русском и предлагает conventional-commit сообщение — всё работает.

## @imports

Gemini CLI нативно поддерживает `@imports`, поэтому модули из `docs/ai/*.md` подтягиваются автоматически при загрузке `GEMINI.md` (через транзит `GEMINI.md → @./AGENTS.md → @docs/ai/*.md`). Отдельный симлинк `~/.gemini/AGENTS.md` нужен, потому что относительный импорт разрешается из глобальной папки Gemini, а не из директории исходного симлинка.

Risk-based Superpowers подключены через `~/.gemini/skills`. Остальные общие скиллы Gemini также видит в `~/.agents/skills`, которую создаёт тот же установщик.

## Обновление

```bash
cd ~/ai-settings && git pull
```

Симлинк остаётся валидным. Перезапусти Gemini-сессию, чтобы подтянулись новые правила.

## Windows

**WSL (рекомендуется):** запустить `./scripts/install.sh` — GEMINI.md симлинкуется автоматически.

**Без WSL (вручную):**
```powershell
# В PowerShell:
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.gemini\GEMINI.md" -Target "$PWD\GEMINI.md"
```

> Путь на Windows: `%USERPROFILE%\.gemini\GEMINI.md`
