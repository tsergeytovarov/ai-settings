---
name: executing-plans
version: 6.2.0
category: workflow
description: Use when implementing an approved written plan with dependent tasks in the current session. Do NOT use when the plan is missing, unapproved, or naturally parallel.
---

# Executing Plans

Execute the plan in the current agent by default.

## Process

1. Read the plan and applicable project instructions.
2. Confirm the workspace and existing user changes are safe.
3. Flag only gaps that block or materially change the outcome.
4. Track tasks by useful deliverable, not every command.
5. For each task, implement the scoped outcome and run its risk-appropriate
   verification.
6. Update the plan or canonical backlog when reality changes.
7. Review the complete diff once at the end.

Read `../using-superpowers/references/risk-policy.md`.

Do not switch to subagent-driven development merely because subagents exist.
Delegate only when the user requests it or tasks are independent enough to
benefit from parallel work.

## Stop and Ask

Stop when authority is missing, a destructive action is newly required, a
critical requirement is ambiguous, or repeated evidence invalidates the plan.
Ordinary implementation details are resolved from the codebase.

When implementation is verified, use
`superpowers:finishing-a-development-branch` only if an integration decision is
actually needed.
