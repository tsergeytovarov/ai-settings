---
name: using-superpowers
version: 6.2.0
category: workflow
description: Use when starting a conversation or deciding whether a Superpowers workflow matches the current task. Do NOT use it to auto-invoke skills whose stated triggers do not match.
---

# Using Superpowers

Use skills when their stated trigger matches the task. Skill discovery is a
routing step, not permission to start every available workflow.

## Routing

1. Read the user's request and applicable project instructions.
2. Inspect descriptions of plausible skills.
3. Invoke only skills whose trigger clearly matches.
4. Follow the smallest workflow that resolves the request.

User and project instructions override skill defaults. In particular, an
explicit request to work inline, avoid subagents, limit tests, skip a formal
spec, or avoid commits narrows the workflow.

Read [risk-policy.md](references/risk-policy.md) before choosing test, review,
subagent, or verification effort.

## Defaults

- Stay in the current agent for low- and medium-risk work.
- Do not invoke a skill merely because there is a remote possibility it applies.
- Do not stack overlapping process skills unless each adds a necessary step.
- Prefer one focused verification over repeated broad checks.
- Ask only when missing information would materially change the result.

Explicit skill requests still apply unless they conflict with a higher-priority
instruction or cannot run in the current environment.

## Platform Adaptation

- Codex: `references/codex-tools.md`
- Pi: `references/pi-tools.md`
- Gemini: `references/gemini-tools.md`
- Antigravity: `references/antigravity-tools.md`
