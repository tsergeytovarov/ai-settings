---
name: brainstorming
version: 6.2.0
category: workflow
description: Use when a request leaves material product, architecture, behavior, or scope decisions unresolved. Do NOT use for approved, well-bounded implementation work.
---

# Brainstorming

Clarify consequential choices before implementation. Scale the design work to
the ambiguity and cost of reversal.

## Embedded mode: product-spec-pipeline

Use this mode only when the parent skill passes the exact marker
`embedded-mode=product-spec-pipeline` and a writable run directory.

1. Inspect the current project context.
2. Ask one question at a time until the idea and intended outcome are clear.
3. Offer 2-3 product directions with trade-offs and a recommendation.
4. Require the user to select or approve one direction.
5. Write the raw idea, considered directions, selected direction, rationale,
   rejected alternatives, and unresolved questions to
   `<run-dir>/brainstorm.md`.

Keep this pass product-focused. Do not expand it into architecture or an
implementation plan, do not commit, and do not invoke `writing-plans`. Return
control to the parent pipeline after the selected direction is approved and
the file exists.

## Choose a Track

### Lightweight

Use for a small, well-bounded change with an obvious implementation and cheap
rollback.

1. Inspect the relevant context.
2. State the intended change and any important assumption in a few sentences.
3. If the user has already approved that outcome, proceed.
4. Otherwise ask one blocking question.

No mandatory spec file, commit, visual companion, or implementation plan.

### Full design

Use when the change introduces a new product flow, public interface,
architecture boundary, irreversible decision, or several plausible approaches.

1. Inspect project context.
2. Ask one question at a time until purpose, constraints, and success criteria
   are clear.
3. Offer 2-3 approaches with trade-offs and a recommendation.
4. Present a concise design covering boundaries, data flow, failure handling,
   and risk-based verification.
5. Get approval before implementation.
6. Write a durable spec only when the project needs one or the user requests it.

Use a visual companion only when a diagram or mockup is materially clearer than
text, and ask before opening it.

## Scope

Decompose genuinely independent subsystems. Do not turn a small config or
workflow edit into a product-design ceremony.

## Handoff

For a complex approved design, use `superpowers:writing-plans`. For a
straightforward approved change, implement directly with the appropriate
domain skill.
