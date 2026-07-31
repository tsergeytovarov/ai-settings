# Coding Standards

Language-agnostic principles. Applies to all code. Language-specific rules live in `python.md` and `typescript.md`.

## YAGNI

Do not add functionality "for the future". Build only what the current task needs. Extract abstractions when there are **three** concrete use cases, not before.

## Risk-based verification

Classify the change before deciding whether to add tests. Risk, not the mere
presence of changed code, determines the verification budget.

### Low risk

Examples: documentation, copy, styling, static markup, configuration values,
generated files, and mechanical wiring with no new branching or data
transformation.

- Do not add tests by default.
- Run only the cheapest applicable existing check: lint, type-check, build, or
  a focused smoke check.

### Medium risk

Examples: ordinary business logic, handlers, component behaviour, parsing, and
data transformation where failure is bounded and reversible.

- Add a test only for a key observable outcome, a non-obvious branch, or a
  regression that would otherwise be hard to notice.
- Prefer one behaviour test through a public seam over tests for every helper,
  branch, or implementation detail.
- Run the closest affected test target once after the change. Run broader
  existing tests only when the changed code is shared by them.

### High risk

Examples: a reproduced bug; authentication or authorization; money, personal
data, destructive operations, migrations, concurrency, production incidents,
or a public contract used by other systems.

- A minimal regression or contract test is required and is written first.
- Test the critical behaviour through the highest practical public seam.
- Run the affected suite. Run the full suite only when shared core behaviour
  changed, before a release, or when the user explicitly asks.

### Test budget

- Do not create a test per function, private method, trivial branch, or static
  rendering detail.
- Do not duplicate coverage already provided by a higher-level test.
- Do not make reviewers rerun passing tests without a concrete doubt that the
  recorded run does not answer.
- Any applicable test or check that was run must pass before completion. If no
  new test is warranted, state which existing check or smoke path verified the
  change.

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
