# Product specification template

Use the smallest shape that captures the decisions required to build and assess
the change. A product specification may describe an entire initiative, one
feature, an improvement, or a small product task.

## Scope selection

### Small

Use for one localized behavior change with few actors and states.

Required sections:

1. Summary
2. Problem
3. Desired user outcome
4. In scope / out of scope
5. Required behavior
6. Edge cases
7. Open questions

### Medium

Use for a feature or workflow spanning several states, actors, or surfaces.

Add:

- Users and scenarios
- User flow
- Success criteria
- Dependencies and constraints
- Risks

### Large

Use for a broad initiative with several workflows or meaningful rollout risk.

Add only when relevant:

- Background and evidence
- Goals and non-goals
- Detailed scenarios
- State and permission matrix
- Metrics and analytics
- Rollout and migration considerations
- Future scope

Large does not mean full product documentation. Keep the spec bounded to the
initiative under discussion.

## Writing rules

- Use the language of the user or target project.
- State confirmed facts and decisions directly.
- Mark assumptions as assumptions.
- Keep unresolved decisions under `Open questions`; do not hide them in prose.
- Describe externally observable behavior and outcomes.
- Include technical details only when they are fixed product constraints.
- Make `In scope` and `Out of scope` explicit.
- Use measurable success criteria when the change has a measurable outcome.
- Do not manufacture metrics for a small task that only needs acceptance
  behavior.
- Avoid implementation plans, API design, database schemas, and task breakdowns.

## Review rubric

Review the draft for decision quality, not prose preference.

1. **Proportionality** — Is the spec deep enough without inflating the task?
2. **Problem alignment** — Do the problem, user, and desired outcome agree?
3. **Scope integrity** — Are boundaries explicit and internally consistent?
4. **Behavioral clarity** — Could 2 teams implement materially different
   behavior while both claiming compliance?
5. **States and edge cases** — Are relevant empty, loading, error, permission,
   cancellation, and repeat-action states covered?
6. **Verifiability** — Can the expected product behavior be checked?
7. **Grounding** — Are project facts verified and assumptions labelled?
8. **Product focus** — Does the document avoid premature technical design?
9. **Decision honesty** — Are unresolved decisions visible rather than guessed?

## Finding severity

- `blocking`: The product cannot be implemented or evaluated without a user
  decision or correction.
- `major`: Ambiguity or inconsistency can cause materially wrong behavior, but
  the intended correction is supported by confirmed context.
- `minor`: Useful clarification with low risk. Never use this for style taste.
