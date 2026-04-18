# skill-lint

Автоматические проверки качества всех скиллов в `skills/`.

## Запуск локально

    pytest tests/skill_lint/ -v

## Что проверяется

Каждый файл `skills/**/SKILL.md` валидируется 9 правилами — см. `test_skills.py`.

## Как добавить новую проверку

Добавь функцию `test_<что>(skill_path, skill_frontmatter)` в `test_skills.py`. Она автоматически применится ко всем скиллам через pytest-фикстуру `skill_path`.
