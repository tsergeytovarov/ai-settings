---
name: my-voice
version: 1.1.0
description: |
  Use when writing or rewriting any text that other people will read under Sergey's name:
  a Yandex Tracker task, description or comment, a Mattermost message, thread reply or
  announcement, a Telegram message or channel post, an email, a message to his manager,
  a client or a stranger, a commit or PR description, a post or article. Trigger
  automatically whenever an agent drafts such a text in any project, even when the user
  only says "ответь ему", "напиши в тред", "заведи задачу", "что ему сказать", and as a
  final pass over texts from other writing skills (tg-post-writer, ru-commit-message,
  ru-pr-description, opisat-zadachu). Also use when the user corrects such a text
  ("поправь", "не так", "я бы написал так") and for "обнови голос / разбери правки".
  SKIP: code, code comments, UI strings and product copy, error messages for end users,
  formal API docs, legal text; chat replies from the agent to Sergey himself.
category: work
tags: [writing, voice, russian, tracker, mattermost, telegram]
---

# Purpose

Write outgoing texts the way Sergey writes them himself: short, direct, with an explicit reason, and without the usual LLM filler. The voice comes from his real messages, not from rules alone.

# Where the voice lives

Voice files sit in `voice/private/` of the ai-settings repo, three levels up from this file (`skills/popovs/my-voice/` → repo root). The folder is gitignored. Normally it resolves to `~/work/ai-settings/voice/private/`.

- `profile.md`: his techniques, grouped by register, with verbatim quotes. **Always read it.**
- `zadaniya.md`, `telegram.md`, `mattermost.md`: the raw corpus. Read only the part for the register you need.
- `corrections.md`: his past edits to agent texts. **Always read it.** These edits override `profile.md` where the two disagree.

If `voice/private/` is missing (another machine, a fresh clone), say so in one line and fall back to `references/anti-slop.md` and `references/channels.md` alone.

This skill also ships two public files:
- `references/channels.md`: a preset per channel (length, case, structure, greeting, swearing).
- `references/anti-slop.md`: the pre-send checklist.

# Process

1. **Channel and reader.** Work out where the text goes and who reads it: a Tracker task, a Tracker comment, a work chat reply, a work post or announcement, the manager, an external or unknown person, or the Telegram channel. If the reader is unknown and the choice changes the tone, ask one question. Otherwise pick the closest preset from `references/channels.md`.
2. **Load the voice.** Read `profile.md` (the matching register section plus "Главное" and "Чего в моих текстах нет") and `corrections.md`. From the corpus, pull 3–5 of his own messages from the same register, as references for rhythm. Never copy their content or names.
3. **Get the substance straight before the wording.** Every outgoing text needs: what happened or what is wanted, why (`потому что`), and what the reader must do and by when. If any of these is unknown, ask Sergey. Do not invent a reason, a deadline or a fact. When you cannot ask (a background run, a batch of drafts), write the most likely version and name the guess in the assumption line above the block. A reply that only answers a question needs no deadline.
4. **Draft in the register.** Follow the preset: length, case, greeting, list format. Keep his vocabulary (`короче`, `по сути`, `давай`, `я бы`, `скоуп`, `асап`) where it fits the register. Do not stuff every marker into one text.
5. **Run the checklist** in `references/anti-slop.md` and cut. A second pass that only cuts is normal.
6. **Hand over.** Put the final text in one fenced block, ready to paste. Before the block, at most one line on what you assumed. Offer no alternative versions unless asked.
7. **Never send it yourself.** Posting to Tracker, Mattermost, Telegram or email needs Sergey's explicit "да" for that exact text, as hard-gates and the platform rules require. A draft is the default output.

# Final pass over another skill's text

When another writing skill has already built the text (a commit, a PR, a post, a Tracker task by its template), keep its structure and required format. Change only the wording: run steps 2, 5 and 6. Conventional Commits prefixes, PR template headings and similar formats stay as they are.

# Learning from corrections

When Sergey rewrites or rejects a text this skill produced:

1. Apply his edit and give him the corrected text.
2. Append one entry to `voice/private/corrections.md`:
   ```
   ## YYYY-MM-DD · <channel>
   Было: <agent text, trimmed to the part he changed>
   Стало: <his version>
   Почему: <his words, or your one-line read of the pattern>
   ```
3. Tell him in one line that you logged it. Never log texts he did not correct.

On "обнови голос" or "разбери правки": read `corrections.md` and find patterns that repeat at least twice. Propose concrete edits to `profile.md` as before → after, and apply them only after he says yes. A one-off correction stays in `corrections.md` and does not become a rule.

# Output format

````
Предположил, что это ответ в тред разработчику, без срока.

```
нет, давайте не будем
нам надо быстро закрыть дыру, а не переписывать весь модуль
давай сделаем уведомление о статусе чека, а целевое решение потом отдельной задачей
```
````
