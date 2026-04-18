# Python Standards

Applies to all Python code. Builds on top of `coding-standards.md`.

## Language version

- **Python 3.12+** required. Use modern syntax (`match/case`, `|` unions, PEP 695 generics where supported).

## Package management

- **uv** is preferred over pip when possible. Faster, reproducible, handles lockfiles.
- `uv venv` to create, `uv pip install -e ".[dev]"` to install in editable mode.
- Single source of truth for deps: `pyproject.toml`. Avoid `requirements.txt` unless required by external tooling.

## Type hints

- **Required in new code.** All public functions, methods, and class attributes are annotated.
- `from __future__ import annotations` at the top of modules that use forward refs or postponed evaluation.
- Prefer `list[int]` over `List[int]`; `dict[str, Any]` over `Dict[str, Any]` — PEP 585.

## Testing (pytest)

- Arrange–Act–Assert structure; blank line between sections.
- Use fixtures for setup; scope them (`session`, `module`, `function`) to match lifetime.
- Avoid mocking the filesystem, network, or database unless the cost of real I/O is excessive. Prefer integration tests over mock-heavy unit tests.
- Use `pytest.mark.parametrize` for truth-table tests.
- Name tests after behavior, not implementation: `test_user_is_locked_after_three_failed_logins`, not `test_lock_user`.

## FastAPI patterns

- **Dependency injection via `Depends`.** No global mutable state.
- **Pydantic v2** for request/response schemas. Never return raw DB models.
- **Async correctly**: no blocking calls (`requests.get`, `time.sleep`, sync SQLAlchemy) inside async handlers.
- Project layout: `app/routers/`, `app/schemas/`, `app/services/`, `app/db/`. One concern per file.
- Error handling: raise `HTTPException` at the route boundary; internal errors use custom exception types.

## Database (SQLAlchemy + Alembic)

- **SQLAlchemy 2.0+ style** (`sqlalchemy.select(...)`, not legacy `Query`).
- Migrations via **Alembic**: autogenerate, then manually review before committing.
- Never edit an applied migration. Add a new migration to reverse or amend.

## Linting & formatting

- `ruff check .` for linting; `ruff format .` (or `black .`) for formatting.
- Imports order: stdlib → third-party → local. Blank line between groups. `ruff` enforces this automatically.

## Imports

- Absolute imports by default. Relative imports only within a package when they improve readability.
- Never `from module import *`.
