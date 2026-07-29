# Repository Sync Preflight

Repository synchronization is a hard gate before subject work.

1. Resolve the current project and every linked `repository_id`.
2. Run `hq-repo-sync preflight` for that project and those repositories before
   reading or changing subject code.
3. Repeat the preflight whenever a paused task is resumed. A report from an
   earlier work session is not reusable.

Proceed only when the command exits with code `0`. Any non-zero result is a
blocker. Show the blocker to the user. Stop all subject work.

The only Git operations that this preflight may perform without separate user approval are:
- automatic clone of a missing checkout
- `fetch --all --prune`
- `pull --ff-only`

Require a separate user decision for every other Git operation. This exception
does not authorize commit, branch, merge, rebase, reset, push, force push,
remote rewrite, or credential changes.
