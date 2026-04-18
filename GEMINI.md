# GEMINI.md

<!-- Gemini CLI entry point. Imports AGENTS.md — the source of truth. -->

@./AGENTS.md

## Gemini CLI-specific notes

- Skills are activated via the `activate_skill` tool (see the platform-adaptation note in `superpowers:using-superpowers`).
- Skill metadata is loaded at session start; full skill content activates on demand.
- Tool-name equivalents: if a skill or doc references Claude tool names (`Skill`, `Agent`, `TodoWrite`), treat them as logical actions and use the Gemini CLI equivalent.
