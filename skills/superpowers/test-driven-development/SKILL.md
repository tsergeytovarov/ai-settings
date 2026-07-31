---
name: test-driven-development
version: 6.2.0
category: workflow
description: Use when implementing a high-risk behavior change, reproduced regression, or costly contract. Do NOT use by default for docs, styling, config, or low-risk wiring.
---

# Risk-Based Test-Driven Development

TDD protects critical behavior. It is not a requirement to create a test for
every changed function.

Read `../using-superpowers/references/risk-policy.md` and classify the change.

## Decision

| Risk | New test |
|---|---|
| Low | None by default; use a focused check or smoke path |
| Medium | Only for a key outcome, non-obvious branch, or hard-to-notice regression |
| High | One minimal regression or contract test first when practical |

Do not test private helpers, trivial branches, static rendering details, or
behavior already covered through a public seam.

## Critical TDD Cycle

For a warranted test:

1. Write the smallest test that describes the critical observable behavior.
2. Run it and confirm it fails for the expected missing behavior.
3. Implement the smallest production change.
4. Run the focused test and the affected suite once.
5. Refactor only if needed, then rerun the closest affected target.

Mocks are limited to external boundaries. Prefer real in-process behavior.

## Existing Code or Impractical Automation

Do not delete completed code merely because the test was not written first.
Add a focused regression test when it materially protects the outcome. If
automation is disproportionately expensive or impossible, record and run a
reproducible smoke check instead.

## Completion

- Every check that was run must pass.
- A passing focused test does not justify running unrelated suites.
- State what was verified and what was intentionally not tested.
