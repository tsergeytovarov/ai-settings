# AGENTS.md

<!-- Global AI settings for Claude Code, Codex, Cursor, Gemini CLI -->
<!-- Source of truth: https://github.com/tsergeytovarov/ai-settings -->
<!-- Human-readable docs: ./docs/setup/ (in Russian) -->

## 1. Persona & Values
@docs/ai/persona.md

## 2. Communication Style (chat)
@docs/ai/style.md

## 3. Writing Voice (generated content)

Governs the voice of content you produce on my behalf — commits, PRs, CHANGELOG, TODO, docs, posts, articles. Does NOT apply to UI strings, error messages for end users, or formal API docs.

@docs/ai/writing-voice.md

## 4. Commands (read this FIRST for any task)
@docs/ai/commands.md

## 5. Tech Stack (with versions)

- JavaScript / TypeScript, Node.js 20+
- Python 3.12+ (prefer `uv` over `pip`)
- Frameworks: Next.js 15 (app router, RSC-first), React 19, FastAPI 0.100+
- Data: SQLAlchemy 2.0+, Pydantic v2, Alembic
- Testing: pytest (Python); Jest or Vitest (JS/TS — confirm per-project)
- CI/CD: GitHub Actions
- Cloud: Yandex Cloud (`yc` CLI, not AWS/GCP)

## 6. Coding Standards
@docs/ai/coding-standards.md

Language-specific:
- Python: @docs/ai/python.md
- TypeScript / JavaScript: @docs/ai/typescript.md

## 7. Git Workflow
@docs/ai/git-workflow.md

## 8. Docs Discipline

- Every non-trivial change → entry in `CHANGELOG.md` (Russian, Keep a Changelog).
- Root `TODO.md` is maintained and updated as work progresses.
- ADRs for architectural decisions live in `docs/adr/` (create when first ADR appears).
- README is required for any new project, package, skill, or non-trivial script.
- Setup guides and user-facing docs live under `docs/setup/` and are **always in Russian**.

## 9. Red Flags
@docs/ai/red-flags.md

## 10. Three-Tier Boundaries
@docs/ai/three-tiers.md

## 11. Hard Gates
@docs/ai/hard-gates.md

## 12. Skill & Agent Invocation Discipline

Before any non-trivial task, check for a relevant skill or subagent.
- If there is even a 1% chance a skill applies — invoke it first.
- Never mention a skill without actually calling it.
- For specialized work (code review, debugging, FastAPI, Next.js, ML, PR writing) — prefer the corresponding subagent from `~/.claude/agents/` (see also `./agents/` in this repo).
- Subagents should run with a fresh, curated context. Never pass arbitrary conversation history — brief them explicitly.

## 13. Uncertainty & Hallucination

- Prefer **asking** to guessing when uncertainty affects the outcome.
- **"I don't know"** is a valid, preferred answer over a plausible-sounding guess.
- For non-trivial decisions — offer **2–3 options with tradeoffs** plus a recommendation.
- Never invent APIs, flags, endpoints, or function signatures. If unsure — verify from docs or ask the user.

## 14. ML-Specific
@docs/ai/ml.md
