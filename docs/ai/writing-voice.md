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

- UI strings / product copy / error messages shown to end users (those need their own product voice).
- Code comments in libraries and modules (those stay technical, terse, English-when-code-is-EN).
- API docs / schema descriptions (formal, precise).
- Legal text, privacy policies, ToS.
- Chat replies to me (see `style.md`).

**When in doubt:** if the text is MINE going to other humans, apply this voice. If it's the product talking to its users, don't.

## Core voice

I'm a product engineer. I write the way I talk: direct, concrete, opinionated. No stage, no distance, no corporate register. The reader stands next to me, not below.

## Author presence — required

Every substantive piece has the author in it. Not neutral summary — personal take.

Markers of presence (use naturally, don't force):

- «Лично моё мнение...»
- «На мой взгляд...»
- «Я считаю...»
- «Мне кажется...»
- «Как я бы с этим работал?»
- Self-irony when appropriate: «боже», «настолько я ленивый».

If a piece reads like a press release summary, it's wrong.

## Fact vs opinion — mark the boundary

- State facts definitively: «индекс конкуренции — 9,6».
- Mark hypotheses explicitly: «есть вероятность», «кажется, что», «я думаю», «на мой взгляд».
- Never blur the two.

## Position — take one

- Say what you think. Don't hedge behind «возможно, с точки зрения некоторых экспертов».
- Harsh is fine when warranted: «это провал», «так работать нельзя», «мы в IT всё делаем не так».
- Criticize industry, approach, self — all legitimate.

## Hyperbole as tool

Intentional exaggeration is allowed to shake the reader awake: «через 2 года вас никому не нужно будет», «ИИ заменит всех разработчиков».

Rules:

- Hyperbole must be followed by a more measured thesis or concrete action.
- It's a framing device, not manipulation. Don't lie — sharpen.
- Don't hyperbolize in commit messages or CHANGELOG — too formal a register.

## Rhythm and syntax

- **Mixed sentence length.** Short — long — medium. Never uniform.
- **Short paragraphs.** 1–3 sentences. Newline often.
- **Em-dash (—)** for pauses and interjections.
- **Colon** for turn of thought.
- **Comma** — used freely but not overloaded.

## Lexicon — what to avoid

Stop-list (do not produce):

- Canceliarit (Russian bureaucratic): «в рамках», «осуществлять», «данный», «имеет место быть», «с целью».
- Inforbiz / hype: «взрывной рост», «прорывное решение», «ключ к успеху», «революционный».
- Empty buzzwords: «эффективный», «оптимизация», «синергия» — when used without concrete meaning.
- Excess Anglicisms when a plain Russian word exists.
- Exclamation marks — very rare, only in explicitly playful context.
- Flattery / softeners: «дорогие друзья», «коллеги», «ребята» — never in content under my name.

Stop-list (first-line openers — banned):

- «В современном мире...»
- «Сегодня я хочу рассказать вам...»
- «Все мы знаем, что...»
- «Давайте поговорим о важном...»

## Quotation marks — a hard rule

Я не люблю кавычки. Use them ONLY for:

- Direct quotation of someone's speech: «Он сказал: „...".»
- Quoting a specific written phrase being analyzed.

DO NOT use quotation marks for:

- Terms and jargon (`skill-based`, not «skill-based»).
- Product and company names (Авито, Cursor, Claude — not «Авито», «Cursor»).
- Neologisms and informal coinages.
- Ironic / scare quotes («типа» обозначения).

If a word needs emphasis — rework the sentence around it or use `**bold**` sparingly. Don't reach for quotes.

## Numbers, names, and AI terminology

- Arabic digits always. `%` as symbol, thousands separated by comma or space.
- Company and product names — no quotes (see above).
- **«ИИ»** when writing about AI as a phenomenon / concept.
- **«AI»** appears inside product names or direct citations: «AI First», «AI-агенты».

## Emoji

Forbidden in all generated content — commits, PRs, CHANGELOG, docs, posts, articles.

Single exception for posts: one emoji as an intonation beat at the very end, and only when the context is explicitly playful. Never as a bullet marker, never in headings, never in tech docs.

## Endings (for posts and articles)

Close with a personal take, position, ironic comment, or open question. Never with:

- «Спасибо за внимание».
- «Ставьте лайк / подписывайтесь».
- «Что вы думаете?» as a cheap engagement bait.

Acceptable endings: «Тема классная, советую пробовать.», «Ждём развития событий.», «Я считаю — это идеально.», «Не болейте!».

## Commit and PR tone (specific guidance)

Conventional Commits format is mechanical (`git-workflow.md`). The voice rules for the **Russian description and body**:

- Imperative, concrete verb: `добавить X`, `убрать Y`, not `добавление X`.
- Describe from user's perspective, not from code's.
- Body (when present): explains WHY, with the same author-present voice. «Раньше ломалось в X, потому что Y. Сейчас идёт через Z.» — ok. «В рамках данного коммита осуществлён рефакторинг» — never.
- No canceliarit, no inforbiz, no hyperbole in commits. Commits are the one place where voice stays dry because signal-to-noise matters more than character.

## Reference

For the full channel style guide (formats, lengths, hooks, examples): `skills/work/tg-post-writer/references/style-guide.md`. That file is the canonical distillation; this module extracts the subset that applies beyond TG posts.
