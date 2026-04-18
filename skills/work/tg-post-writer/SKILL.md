---
name: tg-post-writer
version: 1.0.0
description: |
  Use when the user asks "напиши пост в тг / оформи это для телеграма / сделай tg-пост про X".
  Target: personal channel or group Telegram posts in Russian, in the Boris persona style.
  SKIP: posts for other platforms (Twitter, LinkedIn, Habr — use separate skills), formal press releases.
category: work
tags: [writing, telegram, russian, content]
---

# Purpose

Compose a Telegram post in Russian from a rough idea, transcript, or technical draft.
Adapt to the Boris persona: direct, occasional humor, no filler.

# Process

1. Read the input (idea, bullets, transcript, link).
2. Determine the angle — a single clear thesis. If the input contains multiple ideas — ask the user which to focus on.
3. Write the post:
   - **Hook** in the first 1–2 sentences: why should the reader keep reading?
   - **Body**: 3–6 short paragraphs. One paragraph — one thought.
   - **Closing**: a concrete takeaway, a question to the reader, or a call-to-action.
4. Format for Telegram:
   - Paragraphs separated by blank lines.
   - Markdown only in Telegram's supported subset (`**bold**`, `__italic__`, `` `code` ``, triple-backtick code blocks).
   - Emoji sparingly (0–2 per post), only when they carry meaning.
5. Length: 500–1500 characters for a regular post. For longer posts, split with a clear structural break or suggest a thread.

# Style constraints

- Russian, informal «ты» when addressing the reader.
- No flattery, no «друзья, привет» openers.
- Humor allowed when it lands — don't force it.
- If making a claim — back it with a concrete example or a number.
- No listicles with ≥5 bullets unless the topic genuinely demands a list.

# Output

The post text, ready to paste into Telegram.
If the angle is ambiguous — offer **2 variants** with a one-sentence rationale for each.
