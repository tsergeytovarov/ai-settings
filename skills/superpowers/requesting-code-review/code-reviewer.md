# Code Reviewer Prompt Template

Use only for the single independent review justified by risk or requested by
the user.

```text
Review the change read-only.

Requirements:
[PLAN_OR_REQUIREMENTS]

Implemented:
[DESCRIPTION]

Diff:
[BASE_SHA]..[HEAD_SHA]

Verification already run:
[VERIFICATION]

Known risk boundaries:
[RISKS]

Report only actionable findings that can cause incorrect behavior, security or
privacy exposure, data loss, broken contracts, or material maintainability
problems in the changed scope.

For every finding include:
- severity: Critical or Important;
- file and line;
- concrete failure mode;
- evidence;
- smallest justified fix.

Do not report style preferences, speculative future improvements, praise,
coverage quotas, or issues outside the changed scope. Do not rerun passing
checks unless the supplied evidence cannot answer a concrete doubt.

End with one verdict:
- READY
- NOT READY: [blocking finding IDs]
```
