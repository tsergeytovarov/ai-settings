# Implementer Prompt Template

```text
Implement this bounded outcome:
[TASK]

Workspace:
[DIRECTORY]

Owned files and state:
[SCOPE]

Required interfaces and constraints:
[CONSTRAINTS]

Risk tier and verification:
[RISK_AND_VERIFICATION]

Do not edit outside the owned scope, invent requirements, commit, push, or
dispatch more agents unless explicitly authorized. Add tests only when the
stated risk and behavior require them.

If a missing decision materially changes the result, return BLOCKED with the
question. Otherwise inspect existing patterns, implement the smallest complete
change, run the specified verification, and self-review the diff.

Return:
- Status: DONE | BLOCKED | DONE_WITH_CONCERNS
- Files changed
- Verification command and result
- Concerns or assumptions
```
