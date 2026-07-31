---
name: requesting-code-review
version: 6.2.0
category: workflow
description: Use when a completed change is high-risk, crosses subsystem boundaries, or the user explicitly requests independent review. Do NOT use by default for low- or medium-risk changes.
---

# Requesting Code Review

Independent review is a targeted risk control, not a ceremony after every task.

Read `../using-superpowers/references/risk-policy.md`.

## Default

- Low and medium risk: self-review the complete diff.
- High risk or cross-boundary: at most one independent review of the completed
  change.
- Explicit user request: review the requested scope once.

Do not dispatch a reviewer after each task, for mechanical changes, or merely
because subagents are available.

## Review Package

Give the reviewer:

- exact requirements;
- base and head revisions or the precise diff;
- changed boundaries and known risks;
- verification already run;
- a request for only correctness, security, data-loss, contract, and material
  maintainability findings.

Do not pass arbitrary conversation history. Do not ask the reviewer to rerun
passing checks without a concrete reason.

## Handling Findings

1. Verify each finding against the code and requirements.
2. Fix confirmed critical or important issues.
3. Verify the fix with the closest applicable check.
4. Stop. Request one scoped re-review only when the fix is itself high-risk or
   cannot be verified directly.

Minor style preferences do not start another loop. Disputed findings are
adjudicated by technical evidence, not reviewer repetition.

Template: [code-reviewer.md](code-reviewer.md)
