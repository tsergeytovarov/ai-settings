---
name: finishing-a-development-branch
version: 6.2.0
category: workflow
description: Use when verified implementation is ready and the user must choose whether to keep, merge, or publish the branch. Do NOT use before applicable checks pass.
---

# Finishing a Development Branch

Verify the actual change, then let the user choose integration.

Read `../using-superpowers/references/risk-policy.md`.

## 1. Verify

Run the smallest complete check justified by risk:

- low risk: lint, type-check, build, or smoke path;
- medium risk: closest affected tests;
- high risk: affected suite and required contract or regression checks;
- full suite: shared core, release boundary, or explicit request only.

If an applicable check fails, report it and stop. Do not claim completion.

## 2. Inspect

- Read the complete diff.
- Confirm current branch, upstream, base branch, and worktree ownership.
- Preserve unrelated user changes.

## 3. Ask for the Integration Choice

Offer only applicable options:

1. merge locally into the confirmed base branch;
2. push and create a pull request;
3. keep the branch as-is.

Do not commit, merge, push, delete a branch, or remove a worktree without the
authority required by user and project instructions.

## 4. Execute and Reverify

Perform the chosen action. If merging locally, rerun the same risk-appropriate
check on the merged result.

Only clean up a worktree created for this task and only after successful
integration or an explicit discard request. Destructive discard requires exact
confirmation of the branch and path.
