---
name: tg-post-writer
version: 1.2.0
description: |
  Use when the user asks "напиши пост в тг / оформи это для телеграма / сделай tg-пост про X".
  Target: personal channel or group Telegram posts in Russian, in the channel's established voice.
  SKIP: posts for other platforms (Twitter, LinkedIn, Habr — use separate skills), formal press releases.
category: work
tags: [writing, telegram, russian, content]
---

# Purpose

Compose a Telegram post in Russian from a rough idea, transcript, or technical draft.
The channel has an established voice (product engineer, direct, conversational, opinion-forward, self-ironic). Calibrate to it via the reference material below.

# Required reading before writing

1. `references/style-guide.md` — full channel style guide: voice, hooks, structure, rhythm, lexicon, quotation rules, endings, pre-send checklist.
2. `references/examples.md` — 10 reference posts across genres (news + analysis, thought / provocation, reflection, short emotional note).

Read both at least once per session. Do not copy phrases — reproduce logic, rhythm, intonation.

# Process

1. Read the input (idea, bullets, transcript, link).
2. Determine the angle — a single clear thesis. If the input contains multiple ideas — ask the user which to focus on.
3. **Generate 3 opening hook variants** — one per genre, 1–2 sentences each:
   - **А — провокация / гипербола:** резкое утверждение или намеренное преувеличение; сразу за ним — более взвешенный тезис.
   - **Б — факт / сценарий:** конкретный факт или узнаваемый сценарий из жизни читателя — без абстракций.
   - **В — вопрос / проблема:** вопрос, который читатель уже задаёт себе, или проблема, которую он узнаёт как свою.
   Present all three and wait: "Какой хук берём — А, Б или В? Или дай свой вариант." Use the chosen hook as the opening line of the post.
4. Pick format based on material (see `style-guide.md` section 3):
   - News + analysis (most common): facts → «Почему это важно?» pivot → 2–4 theses → personal take.
   - Thought / provocation: thesis opener → 3–5 short paragraphs → explicit position («Итак, мысль.»).
   - Short note / emotion: 1–2 lines, often self-ironic.
   - List: em-dash bullets, 3–5 items, one thought per item.
5. Write with channel's rhythm:
   - Mixed sentence length (short — long — medium, never uniform).
   - Paragraphs of 1–3 sentences.
   - Author present throughout («на мой взгляд», «я считаю», «кажется»).
   - Fact vs hypothesis explicitly marked.
6. Format for Telegram:
   - Paragraphs separated by blank lines.
   - Markdown only in Telegram's supported subset (`**bold**`, `__italic__`, `` `code` ``, triple-backtick code blocks).
   - Em-dash (—) for pauses, not hyphens.
   - Emoji: zero in most posts. At most one as a closing intonation beat in explicitly playful context.
7. Length (see `style-guide.md` section 7):
   - Short note: 20–100 chars.
   - News + take: 700–1500 chars.
   - Reflection / analysis: 1500–3000 chars.
   - Hard ceiling: ~3500 chars — above that, split into a series.
8. Run the pre-send checklist (`style-guide.md` section 11) before returning. If any item fails — rewrite.
9. **Cover image (опционально).** Если пост длиннее 100 символов — спроси пользователя: «Сгенерить обложку для поста?». Если да:
   - Сформулируй `cover_title` по правилам в секции "Cover title rules" ниже.
   - Покажи `cover_title` пользователю: «Обложка будет с заголовком: `<title>`. Так ок или поправить?». Пользователь может утвердить, попросить переделать или дать свой вариант.
   - После подтверждения вызови скрипт:
     ```
     cd tools && npx tsx render-cover.ts \
       --title "<cover_title>" \
       --out /tmp/meridian-tg-$(date +%Y%m%d-%H%M%S).png
     ```
   - Верни путь к PNG пользователю в формате `file:///tmp/...` для быстрого открытия.
   Если пост короче 100 символов — не предлагай, короткие заметки обходятся без обложки.

# Hard rules (do not violate)

- No emoji as bullet markers. No hashtags. No «подписывайтесь / лайк / репост». No «дорогие друзья / коллеги».
- No quotation marks for terms, product names, or scare quotes. Quotation marks ONLY for direct speech citations.
- No canceliarit («в рамках», «осуществлять», «данный»), no inforbiz («взрывной рост», «прорывное решение»).
- No exclamation marks in the first line.
- No openers from the banned list («В современном мире», «Сегодня я хочу рассказать», «Все мы знаем»).

# Output

The post text, ready to paste into Telegram.
If the angle is ambiguous — offer **2 variants** with a one-sentence rationale for each.
If the checklist fails any item — fix and re-check before returning; do not return a draft you know is off-voice.

# Cover title rules

Title для обложки формулируется **отдельно** от текста поста. В текст поста не попадает — живёт только на картинке.

**Формальные требования:**
- 3-8 слов
- не предложение, не хук-фраза — **тезис**
- третье лицо, нейтральный падеж (не «Смотрите сами…», не «Я думаю…»)
- первая буква заглавная, остальные как в обычном предложении
- без завершающих знаков (`.`, `!`, `?`, `…`)
- без кавычек (правило Meridian: кавычки только для прямой речи)
- без эмоджи, без хэштегов

**Калибровочные примеры:**

| Жанр поста | cover_title |
|---|---|
| Новость про модель | `Claude 4.7: тихий апгрейд в reasoning` |
| Размышление про найм | `AI ломает воронку найма` |
| Разбор инструмента | `Cursor больше не единственный выбор` |
| Опыт / ретроспектива | `Год на AI-агентах: что сломалось` |

**Анти-примеры:**

- «Смотрите сами, Claude 4.7 умнее Opus» — хук-фраза, не тезис
- «Что я думаю про AI-найм» — первое лицо, пустой смысл
- «Claude 4.7 — это новый король reasoning!» — восклицательный
- «Новая модель от Anthropic доступна в API с ценой 3/15 долларов за миллион токенов и контекстом 1 миллион» — не тезис, а простыня

Если пользователь просит переделать — перегенерировать по тем же правилам, не спорить. Если пользователь даёт свой title — использовать как есть (правила — для автогенерации, не для пользовательского ввода).
