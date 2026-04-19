# RTK — Rust Token Killer

rtk is a CLI proxy that compresses bash command output before it reaches context (60-90% savings). It is transparent — Claude never sees the rewrite.

## Meta commands (call rtk directly, not through hook)

- `rtk gain` — show token savings stats for this session
- `rtk gain --history` — full command history with savings
- `rtk discover` — analyze Claude Code history for missed compression opportunities
- `rtk proxy <cmd>` — run command without filtering (full output, for debugging)

## Name collision warning

Two different "rtk" projects exist on crates.io. Verify correct install: `rtk gain` should work (not "command not found"). If it fails, you have the wrong package — install via `brew install rtk` or `cargo install --git https://github.com/rtk-ai/rtk`.

## Hook behavior

All other commands (git, npm, pytest, grep, etc.) are automatically rewritten by the PreToolUse hook. Built-in tools (Read, Grep, Glob) are NOT affected.
