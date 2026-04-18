---
name: tg-post-writer
version: 1.1.0
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
3. Pick format based on material (see `style-guide.md` section 3):
   - News + analysis (most common): facts → «Почему это важно?» pivot → 2–4 theses → personal take.
   - Thought / provocation: thesis opener → 3–5 short paragraphs → explicit position («Итак, мысль.»).
   - Short note / emotion: 1–2 lines, often self-ironic.
   - List: em-dash bullets, 3–5 items, one thought per item.
4. Write with channel's rhythm:
   - Mixed sentence length (short — long — medium, never uniform).
   - Paragraphs of 1–3 sentences.
   - Author present throughout («на мой взгляд», «я считаю», «кажется»).
   - Fact vs hypothesis explicitly marked.
5. Format for Telegram:
   - Paragraphs separated by blank lines.
   - Markdown only in Telegram's supported subset (`**bold**`, `__italic__`, `` `code` ``, triple-backtick code blocks).
   - Em-dash (—) for pauses, not hyphens.
   - Emoji: zero in most posts. At most one as a closing intonation beat in explicitly playful context.
6. Length (see `style-guide.md` section 7):
   - Short note: 20–100 chars.
   - News + take: 700–1500 chars.
   - Reflection / analysis: 1500–3000 chars.
   - Hard ceiling: ~3500 chars — above that, split into a series.
7. Run the pre-send checklist (`style-guide.md` section 11) before returning. If any item fails — rewrite.

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
