# TODO

## В работе

(пусто)

## Следующее

- [ ] `my-voice`: через 2 недели прогнать «обнови голос» по `voice/private/corrections.md`.
- [ ] Подключить `my-voice` в `opisat-zadachu` и `konsol-analyst` (живут в репе Консоли): там свой стиль текста.
- [ ] Добрать в корпус комменты из Трекера: их там пока нет.

- [ ] Расширенные правила `skill-lint` (анти-дубли, проверка ссылок).
- [ ] Проверка Cursor-синка в реальной установке (разные версии Cursor).
- [ ] ML-helper: секция про versioning датасетов (DVC / lakeFS).

## Идеи / бэклог

- [ ] Интеграция с Yandex Cloud SDK (скилл/субагент).
- [ ] Автогенерация CHANGELOG из коммитов по conventional-commit типам.
- [ ] TUI / веб-UI для управления настройками (low priority, YAGNI пока).
- [ ] Per-skill README auto-generation из SKILL.md frontmatter.

## Сделано

- [x] Глобальный скилл `my-voice` и корпус голоса в `voice/private/` (2026-11-16).
- [x] Риск-ориентированная политика тестов и ревью: критические контракты
  защищаются тестами, обычные правки не обрастают тестами и субагентскими
  циклами по умолчанию; fork Superpowers хранится в репозитории и не
  дублируется в Codex поверх plugin (2026-07-31).
- [x] Глобальная установка оригинального `brainstorming` из Superpowers v6.1.1 (2026-07-20).
- [x] Глобальный `$spec`: анализ проекта, brainstorming, выбранные исследования отдельными агентами, grilling, межмодельная проверка и 2 независимых ревью (2026-07-20).
- [x] Token-savings план (2026-04-19) — RTK-интеграция, Compression в style.md, Compact Instructions в AGENTS.md, Windows-инструкции в setup-доках, сокращение writing-voice.md.
- [x] Скилл `popovs:boilerplate` и публичный репо шаблонов `tsergeytovarov/popovs-boilerplate` — план [`docs/superpowers/plans/2026-04-19-popovs-boilerplate.md`](docs/superpowers/plans/2026-04-19-popovs-boilerplate.md) (2026-04-19).
- [x] Имплементация по плану [`docs/superpowers/plans/2026-04-18-ai-settings-implementation.md`](docs/superpowers/plans/2026-04-18-ai-settings-implementation.md) — релиз v0.1.0 (2026-04-18).
