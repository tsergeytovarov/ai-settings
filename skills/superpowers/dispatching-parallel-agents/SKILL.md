---
name: dispatching-parallel-agents
version: 6.2.0
category: workflow
description: Use when 2 or more substantial tasks are independent, have disjoint state, and parallel execution will save meaningful time. Do NOT use for coupled or sequential work.
---

# Dispatching Parallel Agents

Parallelism is useful only when coordination costs and merge risk stay below the
time saved.

## Preconditions

Dispatch only when:

- at least 2 tasks have independent outcomes;
- agents will not edit the same files or mutable external state;
- each task can be briefed without the full conversation;
- useful coordination or implementation work remains for the current agent.

Do not delegate tiny tasks, related failures, exploratory debugging, or work
that depends on sequential discoveries.

## Workflow

1. Define one bounded domain per agent.
2. Provide goal, exact scope, constraints, known context, verification, and
   expected return.
3. Dispatch independent tasks concurrently.
4. Inspect each result and diff; do not trust summaries alone.
5. Resolve integration centrally.
6. Run the closest checks covering the combined boundaries.

Run a full suite only if combined work changed shared core behavior, crosses a
release boundary, or the user requested it.

More agents are not automatically faster. Stop dispatching when ownership
overlaps or briefing takes longer than the remaining work.
