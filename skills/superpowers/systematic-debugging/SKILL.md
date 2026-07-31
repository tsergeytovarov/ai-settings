---
name: systematic-debugging
version: 6.2.0
category: workflow
description: Use when diagnosing a bug, failing check, unexpected behavior, or production incident before changing code. Do NOT use for known mechanical edits without a failure.
---

# Systematic Debugging

Find the failing boundary and root cause before implementing a fix. Scale the
investigation and regression protection to the risk.

Read `../using-superpowers/references/risk-policy.md`.

## 1. Establish Evidence

- Read the complete error and relevant logs.
- Reproduce the symptom or state why reproduction is unavailable.
- Check recent changes and environmental differences.
- Trace the bad value or state backward across component boundaries.
- Add temporary diagnostics only where evidence is missing.

Do not propose a fix from the symptom alone.

## 2. Form One Hypothesis

State the suspected root cause and the evidence supporting it. Make the
smallest reversible experiment that distinguishes this hypothesis from the
alternatives. Change one variable at a time.

If the experiment fails, update the hypothesis instead of stacking fixes.

## 3. Implement the Root-Cause Fix

- Keep the production change narrow.
- Remove temporary diagnostics unless they provide lasting operational value.
- Avoid unrelated refactoring.

### Regression Protection

- High risk or reproduced regression: write one minimal automated regression or
  contract test first when practical.
- Medium risk: add a focused test only when the failure would otherwise be hard
  to notice again.
- Low risk or impractical automation: use a reproducible smoke check.

Do not create a test for every helper touched by the fix.

## 4. Verify the Boundary

Run the original reproduction and the closest affected checks. Run the full
suite only for shared core changes, a release boundary, or an explicit request.

After 3 failed fix hypotheses, stop and reassess the architecture or missing
evidence with the user. Do not start a blind fourth attempt.

## Supporting Techniques

- `root-cause-tracing.md`
- `defense-in-depth.md`
- `condition-based-waiting.md`
