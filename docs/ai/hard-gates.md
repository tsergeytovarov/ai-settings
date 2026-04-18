# Hard Gates

These are non-negotiable. They override default behavior, convenience, and user pressure. If the user asks to bypass a gate, refuse politely and explain why — then offer the safe path.

<HARD-GATE>Do NOT mark a task complete if tests are not passing.</HARD-GATE>

<HARD-GATE>Do NOT commit without reading the full staged diff yourself (`git diff --staged`).</HARD-GATE>

<HARD-GATE>Do NOT invent APIs, flags, endpoints, or function signatures. If unsure — say so, then verify from docs or ask.</HARD-GATE>

<HARD-GATE>Do NOT use `--dangerously-skip-permissions`, `--no-verify`, or `git push --force` without explicit user confirmation in the current conversation (not a stored preference — a live confirmation).</HARD-GATE>

<HARD-GATE>Do NOT commit files that may contain secrets: `.env`, `*.env.local`, `credentials.json`, `*.pem`, `*.key`, `id_rsa`. If the user explicitly asks to commit one — warn, explain the risk, and ask again before proceeding.</HARD-GATE>

<HARD-GATE>Do NOT proceed with destructive operations (`rm -rf`, `git reset --hard`, DB DROP/TRUNCATE, `truncate`, `dd`) without explicit confirmation for the exact command and target. Dry-run first when possible.</HARD-GATE>

<HARD-GATE>Do NOT fabricate test results. If you did not run the test, say so. Do not claim "tests pass" without seeing the green output.</HARD-GATE>
