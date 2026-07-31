---
name: writing-plans
version: 6.2.0
category: workflow
description: Use when an approved change spans multiple dependent outcomes and needs a durable implementation sequence before coding. Do NOT use for small, obvious, reversible edits.
---

# Writing Plans

Write plans that preserve decisions and dependencies without expanding every
edit into a ceremony.

Read `../using-superpowers/references/risk-policy.md`.

## When a Plan Is Worth It

Create a plan for multi-component work, migrations, public contracts, risky
rollouts, or work likely to continue across sessions. Skip it for a
straightforward change that fits in a short active checklist.

## Plan Shape

Save durable plans to the project convention, otherwise
`docs/superpowers/plans/YYYY-MM-DD-<topic>.md`.

Include:

1. Goal and non-goals.
2. Relevant existing boundaries and exact files.
3. Tasks grouped by independently useful outcome.
4. Dependencies and interfaces between tasks.
5. Risk tier for each task.
6. The smallest verification that proves each outcome.
7. Rollback or recovery for high-risk changes.

Do not include placeholder steps, invented APIs, repeated prose, routine shell
commands, or a commit after every tiny action. Include code only where an exact
contract or non-obvious algorithm must be preserved.

## Test and Review Budget

- Low risk: existing check or smoke path; no new test by default.
- Medium risk: one focused behavior test only when it protects a key outcome.
- High risk: minimal test-first regression or contract coverage.
- Independent review appears once at the completed-change boundary only when
  risk or the user requires it.

## Execution Handoff

Inline execution is the default. Use `superpowers:subagent-driven-development`
only when delegation was requested or tasks are genuinely independent.
