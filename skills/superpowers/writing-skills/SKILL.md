---
name: writing-skills
version: 6.2.0
category: workflow
description: Use when creating, editing, or validating reusable agent skills and their trigger behavior. Do NOT use for ordinary project documentation or one-off prompts.
---

# Writing Skills

Treat skills as behavior-shaping interfaces. Validate them in proportion to the
cost of a wrong instruction.

Read `../using-superpowers/references/risk-policy.md`.

## Authoring

- Keep `SKILL.md` focused on a reusable trigger and workflow.
- Frontmatter needs `name`, a semver `version`, `category`, and a description
  with explicit `Use when` and `Do NOT use` conditions.
- The description states triggering conditions, not the entire workflow.
- Prefer explicit conditions and positive recipes over long prohibition lists.
- Put heavy reference material or reusable scripts in supporting files.
- Remove duplicated guidance and stale examples.
- Frequently loaded skills should be short.

## Validation Budget

| Change | Validation |
|---|---|
| Typo, link, metadata, wording clarification | Static validation and direct inspection |
| Ordinary workflow change | Static validation plus one focused scenario |
| Safety-critical discipline or broad automatic behavior | Baseline scenario, changed scenario, and additional cases only for observed loopholes |

A scenario may be an isolated manual prompt, a harness check, or a subagent when
delegation is available and justified. Subagents, 5-repetition micro-tests, and
adversarial review loops are not mandatory for every edit.

Do not create tests when the control does not exhibit the failure. Do not keep
adding scenarios after the intended behavior is demonstrated unless a specific
gap remains.

## Checklist

1. Confirm the trigger is narrow and searchable.
2. Check instructions for contradictions and unbounded loops.
3. Run the repository's skill or plugin validator.
4. Run the risk-appropriate focused scenario.
5. Inspect the final diff.
6. Deploy through the platform's documented plugin update flow.

Do not commit or publish without user authorization.
