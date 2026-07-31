---
name: subagent-driven-development
version: 6.2.0
category: workflow
description: Use when the user requests delegated implementation or multiple substantial tasks are genuinely independent without shared state. Do NOT use for coupled or ordinary single-task work.
---

# Subagent-Driven Development

Subagents are for isolation and parallelism. They are not the default unit of
work and do not imply a reviewer after every task.

Read `../using-superpowers/references/risk-policy.md`.

## Use Only When

- the user explicitly requests subagents or delegation; or
- there are at least 2 substantial independent tasks with disjoint ownership
  and useful work remains for the coordinating agent.

Stay inline when tasks share files, depend on sequential discoveries, are small,
or the current agent can finish faster than briefing and integrating delegates.

## Workflow

1. Split work by independent outcome, not by tiny plan step.
2. Give each implementer a bounded brief: goal, files, constraints, interfaces,
   verification, and expected return.
3. Keep shared-state edits with one owner.
4. When agents return, inspect their diffs and integrate conflicts centrally.
5. Run risk-appropriate verification on the combined result.

Use [implementer-prompt.md](implementer-prompt.md) when a written brief helps.

## Review

- Do not dispatch per-task spec and quality reviewers.
- Do not create automatic fix/re-review cycles.
- For a high-risk combined change, request at most one final independent review
  using `superpowers:requesting-code-review`.
- Verify confirmed fixes directly; a second review requires a specific residual
  risk or an explicit user request.

## Stop Conditions

Stop delegation when tasks cease to be independent, agents edit overlapping
state, or coordination costs exceed the remaining implementation work.
