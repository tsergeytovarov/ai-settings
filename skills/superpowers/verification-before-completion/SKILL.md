---
name: verification-before-completion
version: 6.2.0
category: workflow
description: Use when about to claim work is complete, fixed, passing, or ready to integrate. Do NOT use to repeat checks without a completion claim or concrete doubt.
---

# Verification Before Completion

Claims require fresh evidence from the current state.

Read `../using-superpowers/references/risk-policy.md`.

## Gate

Before a completion claim:

1. Identify the observable claim.
2. Choose the smallest command or manual path that proves it at the relevant
   boundary.
3. Run it fresh.
4. Read the result and exit status.
5. Report the evidence and any unverified boundary.

The complete command means the complete chosen check, not the entire repository
suite. Verification scope follows risk.

## Examples

| Claim | Evidence |
|---|---|
| Focused behavior works | affected test or reproducible smoke path |
| Build succeeds | build command exits 0 |
| Bug is fixed | original reproduction no longer fails |
| Plugin is installed | plugin listing shows expected source and version |
| Requirements are met | final diff checked against the approved scope |

Do not substitute old output, a reviewer summary, lint for a build, or tests for
an untested user-visible boundary.

## Limits

- Run the affected check once after the final relevant change.
- Rerun only when the checked state changed or the first result was ambiguous.
- Run the full suite only for shared core, a release boundary, or an explicit
  request.
- Do not make a reviewer repeat checks already evidenced without a concrete
  doubt.

If verification fails, report the actual state. Do not soften it into a success
claim.
