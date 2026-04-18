# Cursor — подключение `ai-settings`

У Cursor нет стабильного user-global механизма правил (зависит от версии). Используем гибрид: глобальная попытка + per-project как надёжный fallback.

## Глобальная попытка

`scripts/install.sh` вызывает `sync-cursor.sh --global` — пишет в `~/.cursor/rules/ai-settings.mdc`. Если твоя версия Cursor это подхватывает, правила применяются везде.

## Per-project (надёжнее)

В корне проекта:

```bash
~/ai-settings/scripts/init-project.sh
```

Скрипт положит `.cursor/rules/ai-settings.mdc` прямо в проект. Cursor подхватит при следующем открытии.

## Что внутри `.mdc`

Это **плоская** версия `AGENTS.md` со всеми резолвнутыми `@imports` + Cursor-frontmatter:

```
---
alwaysApply: true
---

# AGENTS.md
<резолвнутое содержимое всех модулей>
```

Размер — около 18–20 КБ (стартовый набор правил).

## Обновление

После `git pull` в `~/ai-settings` вручную прогони:

```bash
# глобально:
~/ai-settings/scripts/sync-cursor.sh --global

# для конкретного проекта:
~/ai-settings/scripts/sync-cursor.sh --project /path/to/project
```

Cursor подхватит новые правила при следующем открытии окна.

## Валидация без записи

```bash
~/ai-settings/scripts/sync-cursor.sh --check
```

Проверяет, что все `@imports` резолвятся; ничего не пишет. Это же используется в CI.
