# Risk-Based Workflow Policy

Classify the change before choosing tests, reviewers, subagents, or suite size.
Use the highest applicable tier.

## Low risk

Examples: documentation, copy, styling, static markup, configuration values,
generated files, and mechanical wiring without new branching or data
transformation.

- No new tests by default.
- Self-review the diff.
- Run the cheapest applicable existing check or smoke path.
- Do not dispatch a reviewer or implementation subagent.

## Medium risk

Examples: ordinary business logic, handlers, parsing, component behavior, and
bounded reversible data transformations.

- Add at most the smallest behavior test needed for a key observable outcome,
  non-obvious branch, or regression that would otherwise be hard to notice.
- Prefer one public-seam test over tests for helpers or implementation details.
- Run the closest affected test target.
- Self-review by default. Use a subagent only for genuinely independent parallel
  work or when the user requests delegation.

## High risk

Examples: reproduced production bugs; authentication or authorization; money,
personal data, destructive operations, migrations, concurrency, incidents, or
public contracts used by other systems.

- Write one minimal regression or contract test first when automation is
  practical.
- Run the affected suite.
- Use at most one independent review of the completed change when it can
  materially reduce risk.
- A review fix is verified directly. Do not start an open-ended re-review loop.

## Full-suite rule

Run the full suite only when shared core behavior changed, before a release, or
when the user explicitly asks. A reviewer does not rerun passing checks without
a concrete doubt that the recorded evidence answers.

## Stop conditions

More tests, agents, or review rounds require a specific uncovered risk. Process
volume is not evidence of quality.
