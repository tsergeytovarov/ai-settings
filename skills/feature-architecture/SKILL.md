---
name: feature-architecture
version: 1.0.0
category: architecture
description: Use when proposing the architecture for a NEW feature on top of an existing codebase — after discovery/recon, when you must commit to one design with a diagram, integration points, data flow, and a rough effort estimate. Do NOT use for documenting existing architecture or writing an implementation plan.
---

# Feature Architecture

## Overview

Turn codebase recon + product discovery into ONE recommended architecture for a new
feature. The output is a decision document a team can act on — one design (not a menu),
a real diagram, concrete integration points into the existing code, data flow, honest
effort, explicit assumptions.

Core principle: **commit to one architecture; tag every claim about existing code as
verified or inferred; never reference a diagram you did not actually embed.**

## When to use

- After arch-recon (you know how the existing system is built) AND product/market
  discovery (you know what the feature is).
- The deliverable is a design proposal, not implementation.

Not for: documenting existing architecture (use a blueprint skill); writing the
implementation plan (use superpowers:writing-plans).

## Inputs

- Recon artifact(s): existing modules, tables, endpoints, jobs.
- Discovery artifact(s): what the feature is, for whom, constraints.
- Target repo path(s).

## Required output contract (markdown, in this order)

1. **Problem & goal** — what the feature changes, 2-3 sentences.
2. **Recommended architecture** — ONE named approach + one-paragraph why. No menu.
3. **Diagram** — a real ` ```mermaid ` block (flowchart or sequence) of components and
   data flow. Draw it inline; never write "the diagram above/below" without an embedded block.
4. **Integration points** — table: existing thing (module/table/endpoint/job) → how the
   feature touches it. Tag each row `[verified]` (seen in recon) or `[inferred]` (assumed).
5. **Data flow** — explicit inputs → processing → outputs.
6. **Trade-offs** — 1-2 rejected alternatives, one line each on why rejected.
7. **Effort** — T-shirt (S/M/L) + where risk concentrates + rough phasing; say it's an estimate.
8. **Assumptions** — explicit; call out load-bearing ones to verify before building.

## Discipline

- **One architecture.** Alternatives appear only under Trade-offs as rejected, never as live options.
- **Verified vs inferred.** Every statement about existing code is tagged. Inferred integration points are not stated as fact.
- **Real diagram only.** The mermaid block must be present and consistent with the text. A described-but-not-embedded diagram is a failure.
- **No code, no implementation plan.** Architecture only.

## Common mistakes

| Mistake | Fix |
|---|---|
| "The diagram above" with no ` ```mermaid ` block | Embed a real mermaid block |
| Hedging between 2-3 architectures | Pick one; rejected ones go under Trade-offs |
| Inventing integration points as fact | Tag `[inferred]`; flag to verify |
| Effort with no basis | State the basis and where risk concentrates |
