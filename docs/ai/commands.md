# Commands

READ THIS FIRST. These are the canonical commands for common tasks. Prefer these over ad-hoc invocations — they include the flags that matter.

## Python (pytest + uv)

- Run all tests: `pytest -v`
- Run one file: `pytest -v path/to/test_file.py`
- Run one test: `pytest -v path/to/test_file.py::test_name`
- Run with coverage: `pytest -v --cov=src --cov-report=term-missing`
- Stop on first failure: `pytest -v -x`
- Install deps (preferred): `uv pip install -e ".[dev]"`
- Create venv: `uv venv && source .venv/bin/activate`
- Sync from lockfile: `uv sync --frozen`
- Run a script in venv: `.venv/bin/python script.py`
- Run a CLI in venv: `.venv/bin/<cli-command>`
- Lint: `ruff check .`
- Format: `ruff format .` (or `black .`)

**Do not run project code through `uv run`.** uv initializes its cache on every
invocation — including `--frozen` — and dies with `Permission denied` wherever
`~/.cache/uv` is read-only: agent sandboxes and cron. The failure surfaces as a
made-up problem with the task ("calendar unavailable", "monitoring failed")
instead of a tooling error. Call the venv interpreter directly; it never touches
the cache. uv stays the installer, run once outside the sandbox.

If `.venv/bin/python` is missing, create the environment (`uv sync --frozen` or
`uv venv`) — do not fall back to `uv run`, and do not ask to disable the sandbox.

## JavaScript / TypeScript (npm)

- Run tests: `npm test`
- Run one test (by path pattern): `npm test -- --testPathPattern=<pattern>`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Type-check (if separate script): `npm run type-check`
- Install deps: `npm install`
- Install single dep: `npm install <pkg>` (add `-D` for dev dep)

## Git

- Status: `git status`
- Log (recent): `git log --oneline -20`
- Log with graph: `git log --oneline --graph --decorate -20`
- Diff unstaged: `git diff`
- Diff staged: `git diff --staged`
- Diff against base: `git diff main...HEAD`
- Stash: `git stash push -m "<msg>"`
- Push current branch: `git push -u origin $(git branch --show-current)`

## GitHub CLI (`gh`)

- View current PR: `gh pr view`
- List PRs: `gh pr list`
- Create PR: `gh pr create --fill` (description in Russian — see git-workflow.md)
- View run status: `gh run list --limit 5`
- Watch run: `gh run watch`

## Yandex Cloud (`yc`)

- Authenticate (one-time): `yc init`
- List VMs: `yc compute instance list`
- List buckets: `yc storage bucket list`
- Full reference: https://cloud.yandex.ru/docs/cli/
