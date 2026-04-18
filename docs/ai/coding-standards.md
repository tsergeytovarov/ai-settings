# Coding Standards

Language-agnostic principles. Applies to all code. Language-specific rules live in `python.md` and `typescript.md`.

## YAGNI

Do not add functionality "for the future". Build only what the current task needs. Extract abstractions when there are **three** concrete use cases, not before.

## Tests required

- New logic → new tests. No exceptions.
- Bug fix → regression test that would have caught the bug. Write the test **first** (it fails), then the fix (it passes).
- You may not mark a task done if tests are failing.

## No dead code

- Unused imports, variables, functions, files — delete them. Don't comment them out.
- "We might need it later" → git history remembers.

## No commented-out code

- If the code isn't running, it has no right to live in the file.
- Exception: a short commented-out block with an inline comment explaining WHY it's temporarily disabled and a ticket/date for removal.

## TODOs with owner

- Every `TODO` or `FIXME` in code must have either a ticket reference or a GitHub issue link.
- A bare `TODO: fix this` is a lie.

## Explicit > clever

- If a colleague needs to read the code twice, rewrite it.
- Magic numbers → named constants.
- Long one-liners → multi-line with intermediate variables.
- Regex dragons → inline comments explaining what each group captures.

## Safety

- **Never** commit secrets. Use env vars or a secrets manager. Add sensitive file patterns to `.gitignore` proactively.
- On any path that takes user input: check for the OWASP top-10 risks for the relevant context (SQL injection, XSS, SSRF, path traversal, etc.).
- Validate at the boundary. Trust nothing from outside the process.

## Small changes

- One commit = one logical change. Don't pack refactoring, bug fix, and feature into a single commit.
- If your diff is >500 lines, pause — can it be split?
