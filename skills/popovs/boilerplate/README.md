# popovs:boilerplate

Скилл разворачивает новый проект: структуру файлов, GitHub репо, снэпшот AI-правил, инструкцию деплоя.

## Когда вызывается

- Явно: `/popovs:boilerplate`
- Явно: «создать новый проект», «развернуть проект»

## Что делает

1. Подтягивает актуальные шаблоны из [tsergeytovarov/popovs-boilerplate](https://github.com/tsergeytovarov/popovs-boilerplate)
2. Задаёт 4 вопроса по одному: имя проекта, стек, видимость GitHub, домен
3. Копирует шаблон + подставляет плейсхолдеры (`{{PROJECT_NAME}}`, `{{DOMAIN}}`, etc.)
4. Копирует снэпшот AI-правил из `ai-settings` (`docs/ai/`, `AGENTS.md`, `CLAUDE.md`)
5. Генерирует `docs/DEPLOY.md` с точными командами для VM (93.77.187.42)
6. Создаёт GitHub репо и делает начальный коммит

## Доступные стеки

| Стек | Описание |
|---|---|
| `nextjs-fastapi` | Next.js 15 + FastAPI + PostgreSQL + Docker Compose |
| `fastapi-only` | FastAPI + PostgreSQL + Docker Compose |
| `landing` | Статический HTML/CSS/JS |
| `docs` | Документация / ресёрч (MkDocs Material) |

Новые стеки добавляются в репо `popovs-boilerplate` — появляются автоматически при следующем запуске.

## После запуска

- Локальный старт: README.md в созданном проекте
- Деплой на VM: `docs/DEPLOY.md` в созданном проекте

## Не делает

- Не деплоит автоматически — только пишет инструкцию
- Не SSH-ится на VM
- Не копирует сами скиллы (они глобальные, живут в `~/.claude/`)
