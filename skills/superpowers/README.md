# Superpowers: risk-based fork

Встроенная версия Superpowers основана на upstream `v6.2.0` и локальном
изменении `d6e9665`. `ai-settings` хранит её как source of truth, чтобы
поведение не зависело от временного plugin cache.

Главное отличие от upstream: объём тестов, ревью и делегирования зависит от
риска изменения. Обычная правка остаётся в текущем агенте, критичный путь
получает минимальный регрессионный тест и не больше одного независимого ревью.
Повторные циклы допустимы только для конкретного незакрытого риска.

Политика описана в
[`using-superpowers/references/risk-policy.md`](using-superpowers/references/risk-policy.md).

## Установка

- Claude Code читает namespace через глобальный симлинк `~/.claude/skills`.
- Codex получает personal skills, только если plugin Superpowers не установлен.
  Это защищает от двух копий одного набора и списка из почти 30 дублей.
- Claude Desktop получает zip и обновления через `scripts/deploy-skills.sh`.

Лицензия upstream сохранена в [`LICENSE.superpowers`](LICENSE.superpowers).
