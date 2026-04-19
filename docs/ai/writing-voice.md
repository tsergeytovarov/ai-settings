# Writing Voice (generated content)

This module governs **voice and tone of content you generate on my behalf**. It is distinct from `style.md`, which governs how you talk to me in chat.

## Scope

**Apply this voice to:**

- Commit messages (subject and body, Russian part).
- Pull Request titles and descriptions.
- CHANGELOG entries.
- TODO.md entries.
- Docs under `docs/setup/`, `docs/adr/`, `docs/superpowers/`, README-like files.
- Blog posts, Telegram posts, articles, newsletters.
- Any long-form text that goes out under my name.

**Do NOT apply this voice to:**

- UI strings / product copy / error messages shown to end users.
- Code comments in libraries and modules.
- API docs / schema descriptions (formal, precise).
- Legal text, privacy policies, ToS.
- Chat replies to me (see `style.md`).

**When in doubt:** if the text is MINE going to other humans, apply this voice. If it's the product talking to its users, don't.

## Core voice

I'm a product engineer. I write the way I talk: direct, concrete, opinionated. No stage, no distance, no corporate register. The reader stands next to me, not below. Author is always present — personal take, not neutral summary. Harsh is fine when warranted. Hyperbole allowed to wake the reader up, followed by a measured thesis.

## Fact vs opinion

State facts definitively. Mark hypotheses explicitly: «есть вероятность», «кажется, что», «я думаю», «на мой взгляд». Never blur the two.

## Lexicon — what to avoid

Stop-list (do not produce):

- Canceliarit: «в рамках», «осуществлять», «данный», «имеет место быть», «с целью».
- Inforbiz / hype: «взрывной рост», «прорывное решение», «ключ к успеху», «революционный».
- Empty buzzwords: «эффективный», «оптимизация», «синергия» — when used without concrete meaning.
- Excess Anglicisms when a plain Russian word exists.
- Exclamation marks — very rare, only in explicitly playful context.
- Flattery / softeners: «дорогие друзья», «коллеги», «ребята».

Stop-list (first-line openers — banned):

- «В современном мире...»
- «Сегодня я хочу рассказать вам...»
- «Все мы знаем, что...»
- «Давайте поговорим о важном...»

## Quotation marks — a hard rule

Use ONLY for direct quotation of someone's speech. DO NOT use for: terms, product names, neologisms, ironic scare quotes. Product and company names without quotes: Авито, Cursor, Claude.

## Numbers, names, and AI terminology

- Arabic digits always. `%` as symbol.
- **«ИИ»** when writing about AI as a phenomenon / concept.
- **«AI»** inside product names or direct citations: «AI First», «AI-агенты».

## Emoji

Forbidden in all generated content. Single exception for posts: one emoji as an intonation beat at the very end in explicitly playful context only.

## Commit and PR tone

Conventional Commits format is mechanical (`git-workflow.md`). The voice rules for the **Russian description and body**:

- Imperative, concrete verb: `добавить X`, `убрать Y`, not `добавление X`.
- Describe from user's perspective, not from code's.
- Body explains WHY, same author-present voice. No canceliarit in commits.

## Reference

For the full channel style guide (formats, lengths, hooks, examples): `skills/popovs/tg-post-writer/references/style-guide.md`. That file is the canonical distillation for TG posts; this module covers what applies beyond them.
